import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    message: "API routes are working!",
    env: {
      hasDatabase: !!process.env.DATABASE_URL,
      hasSecret: !!process.env.BETTER_AUTH_SECRET,
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
    }
  });
}
