import asyncio
import unittest
from unittest.mock import AsyncMock

from fastapi import HTTPException

from app.main import DemoService


class DemoServiceTests(unittest.IsolatedAsyncioTestCase):
    def service(self) -> DemoService:
        service = DemoService()
        service.target = "demo.example"
        service.poll_interval = 0
        service.timeout = 2
        return service

    async def test_concurrent_demo_protection(self) -> None:
        service = self.service()
        started = asyncio.Event()
        release = asyncio.Event()

        async def blocked(_: str) -> None:
            started.set()
            await release.wait()

        service.run = blocked  # type: ignore[method-assign]
        await service.start("client")
        await started.wait()
        with self.assertRaises(HTTPException) as error:
            await service.start("client-2")
        self.assertEqual(error.exception.status_code, 429)
        release.set()
        await asyncio.sleep(0)

    async def test_scan_failure_is_sanitized(self) -> None:
        service = self.service()
        service.request = AsyncMock(side_effect=[
            {"scan_id": "scan_1"},
            {"scan_id": "scan_1", "status": "failed"},
        ])  # type: ignore[method-assign]
        await service.start("client")
        await asyncio.sleep(0.01)
        session = service.get(next(iter(service.sessions)))
        self.assertEqual(session["status"], "failed")
        self.assertEqual(session["error"], "Reconix scan did not complete")

    async def test_invalid_scan_response_fails_cleanly(self) -> None:
        service = self.service()
        service.request = AsyncMock(return_value={"status": "queued"})  # type: ignore[method-assign]
        await service.start("client")
        await asyncio.sleep(0.01)
        session = service.get(next(iter(service.sessions)))
        self.assertEqual(session["error"], "invalid scan response")

    async def test_successful_end_to_end_orchestration(self) -> None:
        service = self.service()
        result = {"schema_version": "1.0", "scan_id": "scan_1", "target": "demo.example", "findings": [{"title": "Open port"}]}
        service.request = AsyncMock(side_effect=[
            {"scan_id": "scan_1"},
            {"scan_id": "scan_1", "status": "completed"},
            result,
            {"alert_id": "alert_1", "alert": {"id": "alert_1", "severity": "medium"}},
            {"classification": "suspicious", "severity": "medium", "confidence": 0.91,
             "evidence": ["port 443"], "mitre_attack_mapping": ["T1046"],
             "recommended_action": "Review exposure", "human_review_required": True,
             "automated_action_executed": False},
        ])  # type: ignore[method-assign]
        initial = await service.start("client")
        await asyncio.sleep(0.02)
        session = service.get(initial["session_id"])
        self.assertEqual(session["status"], "completed")
        self.assertEqual(session["triage"]["classification"], "suspicious")
        self.assertTrue(session["triage"]["human_review_required"])
        triage_call = service.request.await_args_list[-1]
        self.assertEqual(triage_call.kwargs["json"]["normalized"], True)

    async def test_secrets_are_not_disclosed(self) -> None:
        service = self.service()
        secret = "reconix-secret-value"
        service.reconix_key = secret
        service.request = AsyncMock(side_effect=RuntimeError(secret))  # type: ignore[method-assign]
        await service.start("client")
        await asyncio.sleep(0.01)
        session = service.get(next(iter(service.sessions)))
        self.assertNotIn(secret, str(session))
        self.assertNotIn(secret, service.safe_error(RuntimeError(secret)))


if __name__ == "__main__":
    unittest.main()
