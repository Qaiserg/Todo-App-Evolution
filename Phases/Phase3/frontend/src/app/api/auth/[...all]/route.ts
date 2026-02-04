import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Force dynamic rendering for auth routes
export const dynamic = 'force-dynamic';

export const { GET, POST } = toNextJsHandler(auth);
