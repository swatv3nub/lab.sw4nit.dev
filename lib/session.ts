import "server-only";
import { getServerSession as getNextAuthServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export function getServerSession() {
  return getNextAuthServerSession(authOptions);
}
