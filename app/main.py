import asyncio
import logging
import os
import time
import uuid
from collections import deque
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse


logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format='{"level":"%(levelname)s","message":"%(message)s"}',
)

log = logging.getLogger("reconix-demo")

TERMINAL = {"completed", "failed", "cancelled"}
MAX_SESSIONS = 20


class DemoService:
    def __init__(self) -> None:
        self.target = os.getenv("DEMO_TARGET", "").strip()
        self.reconix_url = os.getenv(
            "RECONIX_CLOUD_BASE_URL",
            "http://api:8080",
        ).rstrip("/")
        self.reconix_key = os.getenv("RECONIX_CLOUD_API_KEY", "")
        self.threatlens_url = os.getenv(
            "THREATLENS_BASE_URL",
            "http://threatlens:8000",
        ).rstrip("/")
        self.threatlens_key = os.getenv("THREATLENS_API_KEY", "")
        self.timeout = float(
            os.getenv("DEMO_TIMEOUT_SECONDS", "180")
        )
        self.poll_interval = float(
            os.getenv("DEMO_POLL_INTERVAL_SECONDS", "2")
        )

        self.active = asyncio.Lock()
        self.sessions: dict[str, dict[str, Any]] = {}
        self.recent_starts: dict[str, deque[float]] = {}

    def check_rate_limit(self, client: str) -> None:
        now = time.monotonic()
        starts = self.recent_starts.setdefault(client, deque())

        while starts and now - starts[0] > 60:
            starts.popleft()

        if len(starts) >= 5:
            raise HTTPException(
                status_code=429,
                detail="Demo rate limit exceeded",
            )

        starts.append(now)

    async def start(self, client: str) -> dict[str, Any]:
        if not self.target:
            raise HTTPException(
                status_code=503,
                detail="Demo target is not configured",
            )

        self.check_rate_limit(client)

        if self.active.locked():
            raise HTTPException(
                status_code=429,
                detail="A demonstration is already running",
            )

        await self.active.acquire()

        session_id = f"demo_{uuid.uuid4().hex}"

        session: dict[str, Any] = {
            "session_id": session_id,
            "status": "starting",
            "stage": "Reconix",
            "error": None,
        }

        self.sessions[session_id] = session

        asyncio.create_task(self.run(session_id))

        return self.public(session)

    def get(self, session_id: str) -> dict[str, Any]:
        session = self.sessions.get(session_id)

        if not session:
            raise HTTPException(
                status_code=404,
                detail="Demo session not found",
            )

        return self.public(session)

    @staticmethod
    def public(session: dict[str, Any]) -> dict[str, Any]:
        allowed = {
            "session_id",
            "status",
            "stage",
            "scan_id",
            "alert_id",
            "triage",
            "evidence",
            "error",
        }

        return {
            key: value
            for key, value in session.items()
            if key in allowed
        }

    async def run(self, session_id: str) -> None:
        session = self.sessions[session_id]

        try:
            timeout = httpx.Timeout(
                10,
                read=self.timeout,
            )

            async with httpx.AsyncClient(
                timeout=timeout,
                follow_redirects=False,
            ) as client:

                # ---------------------------------------------------------
                # 1. Reconix Cloud
                # ---------------------------------------------------------
                session["stage"] = "Reconix"

                scan = await self.request(
                    client,
                    "POST",
                    "/api/v1/scans",
                    self.reconix_url,
                    self.reconix_key,
                    json={
                        "target": self.target,
                        "profile": "safe",
                    },
                )

                scan_id = scan.get("scan_id")

                if not isinstance(scan_id, str) or not scan_id:
                    raise ValueError("invalid scan response")

                session["scan_id"] = scan_id

                result = await self.poll_scan(
                    client,
                    session,
                    scan_id,
                )

                # ---------------------------------------------------------
                # 2. ThreatLens ingestion
                # ---------------------------------------------------------
                session["stage"] = "ThreatLens"

                ingested = await self.request(
                    client,
                    "POST",
                    f"/v1/ingest/reconix-cloud/{scan_id}",
                    self.threatlens_url,
                    self.threatlens_key,
                    json={
                        "result": result,
                    },
                )

                # ThreatLens returns:
                # {
                #     "scan_id": "...",
                #     "ingested": 5,
                #     "alert_ids": ["finding_..."]
                # }
                #
                # Support both a direct alert_id and alert_ids list.
                alert_id = self.find_id(
                    ingested,
                    "alert_id",
                    "id",
                )

                if not alert_id:
                    alert_ids = ingested.get("alert_ids")

                    if isinstance(alert_ids, list) and alert_ids:
                        first_alert_id = alert_ids[0]

                        if (
                            isinstance(first_alert_id, str)
                            and first_alert_id
                        ):
                            alert_id = first_alert_id

                if not alert_id:
                    raise ValueError(
                        "ThreatLens ingestion returned no alert ID"
                    )

                session["alert_id"] = alert_id

                # ---------------------------------------------------------
                # 3. Retrieve normalized alert
                # ---------------------------------------------------------
                alert = (
                    ingested.get("alert")
                    if isinstance(ingested.get("alert"), dict)
                    else None
                )

                if not alert:
                    alert = await self.request(
                        client,
                        "GET",
                        f"/v1/alerts/{alert_id}",
                        self.threatlens_url,
                        self.threatlens_key,
                    )

                if not isinstance(alert, dict):
                    raise TypeError(
                        "Invalid ThreatLens alert response"
                    )

                # ---------------------------------------------------------
                # 4. Prepare representative alert
                # ---------------------------------------------------------
                representative = self.representative(alert)

                # ---------------------------------------------------------
                # 5. ThreatLens triage
                # ---------------------------------------------------------
                session["stage"] = "Triage"

                triage = await self.request(
                    client,
                    "POST",
                    "/v1/triage",
                    self.threatlens_url,
                    self.threatlens_key,
                    json={
                        "alert": representative,
                        "normalized": True,
                    },
                )

                # ---------------------------------------------------------
                # 6. Complete
                # ---------------------------------------------------------
                session.update(
                    status="completed",
                    stage="Complete",
                    triage=self.clean_triage(triage),
                    evidence=result,
                )

        except asyncio.CancelledError:
            session.update(
                status="failed",
                stage="Failed",
                error="Demonstration cancelled",
            )
            raise

        except (
            httpx.HTTPError,
            TimeoutError,
            ValueError,
            TypeError,
        ) as exc:
            log.warning(
                "demo_failed session_id=%s reason=%s",
                session_id,
                type(exc).__name__,
            )

            session.update(
                status="failed",
                stage="Failed",
                error=self.safe_error(exc),
            )

        except (RuntimeError, OSError) as exc:
            log.warning(
                "demo_failed session_id=%s reason=%s",
                session_id,
                type(exc).__name__,
            )

            session.update(
                status="failed",
                stage="Failed",
                error="The demonstration could not be completed",
            )

        finally:
            if len(self.sessions) > MAX_SESSIONS:
                oldest = next(iter(self.sessions))

                if oldest != session_id:
                    self.sessions.pop(oldest, None)

            self.active.release()

    async def poll_scan(
        self,
        client: httpx.AsyncClient,
        session: dict[str, Any],
        scan_id: str,
    ) -> dict[str, Any]:

        deadline = time.monotonic() + self.timeout

        while time.monotonic() < deadline:
            scan = await self.request(
                client,
                "GET",
                f"/api/v1/scans/{scan_id}",
                self.reconix_url,
                self.reconix_key,
            )

            status = scan.get("status")

            valid_statuses = {
                "queued",
                "starting",
                "running",
                *TERMINAL,
            }

            if status not in valid_statuses:
                raise ValueError(
                    "invalid scan status response"
                )

            if status == "completed":
                session["stage"] = "Findings"
            else:
                session["stage"] = "Reconix"

            if status in {"failed", "cancelled"}:
                raise ValueError(
                    "Reconix scan did not complete"
                )

            if status == "completed":
                result = await self.request(
                    client,
                    "GET",
                    f"/api/v1/scans/{scan_id}/results",
                    self.reconix_url,
                    self.reconix_key,
                )

                if not self.valid_result(result, scan_id):
                    raise ValueError(
                        "invalid Reconix result response"
                    )

                return result

            await asyncio.sleep(self.poll_interval)

        raise TimeoutError("Reconix scan timed out")

    async def request(
        self,
        client: httpx.AsyncClient,
        method: str,
        path: str,
        base: str,
        key: str,
        **kwargs: Any,
    ) -> dict[str, Any]:

        headers = (
            {"Authorization": f"Bearer {key}"}
            if key
            else {}
        )

        response = await client.request(
            method,
            f"{base}{path}",
            headers=headers,
            **kwargs,
        )

        if response.status_code >= 400:
            raise httpx.HTTPStatusError(
                "upstream request failed",
                request=response.request,
                response=response,
            )

        payload = response.json()

        if not isinstance(payload, dict):
            raise TypeError(
                "upstream response was not an object"
            )

        return payload

    @staticmethod
    def valid_result(
        result: dict[str, Any],
        scan_id: str,
    ) -> bool:

        return (
            result.get("schema_version") == "1.0"
            and result.get("scan_id") == scan_id
            and isinstance(
                result.get("findings"),
                list,
            )
        )

    @staticmethod
    def find_id(
        payload: dict[str, Any],
        *names: str,
    ) -> str | None:

        for name in names:
            value = payload.get(name)

            if isinstance(value, str) and value:
                return value

        return None

    @staticmethod
    def representative(
        alert: dict[str, Any],
    ) -> dict[str, Any]:

        if isinstance(alert.get("normalized"), dict):
            return alert["normalized"]

        if isinstance(alert.get("alert"), dict):
            return alert["alert"]

        return alert

    @staticmethod
    def clean_triage(
        triage: dict[str, Any],
    ) -> dict[str, Any]:

        keys = (
            "classification",
            "severity",
            "confidence",
            "summary",
            "evidence",
            "mitre_attack",
            "mitre_attack_mapping",
            "recommended_action",
            "recommended_actions",
            "human_review_required",
            "automated_action_executed",
        )

        return {
            key: triage[key]
            for key in keys
            if key in triage
        }

    @staticmethod
    def safe_error(exc: Exception) -> str:
        if isinstance(exc, TimeoutError):
            return (
                "The demonstration timed out before "
                "the pipeline completed"
            )

        if isinstance(exc, httpx.HTTPStatusError):
            return (
                "An upstream service rejected the "
                "demonstration request"
            )

        safe_messages = {
            "Reconix scan did not complete",
            "invalid scan response",
            "invalid Reconix result response",
            "invalid ThreatLens alert response",
            "ThreatLens ingestion returned no alert ID",
        }

        if str(exc) in safe_messages:
            return str(exc)

        return "The demonstration could not be completed"


service = DemoService()


@asynccontextmanager
async def lifespan(
    _: FastAPI,
) -> AsyncIterator[None]:

    if not service.target:
        log.warning("demo_target_missing")

    yield


app = FastAPI(
    title="Reconix ThreatLens Demo",
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None,
)


@app.get("/")
async def index() -> FileResponse:
    return FileResponse(
        Path(__file__).parent
        / "static"
        / "index.html"
    )


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/demo/start", status_code=202)
async def start(
    request: Request,
) -> dict[str, Any]:

    client = (
        request.client.host
        if request.client
        else "unknown"
    )

    return await service.start(client)


@app.get("/api/demo/{session_id}")
async def status(
    session_id: str,
) -> dict[str, Any]:

    return service.get(session_id)
