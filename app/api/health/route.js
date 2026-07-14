import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await query("SELECT NOW() AS now");
    return Response.json({ ok: true, now: result.rows[0].now });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message },
      { status: 503 }
    );
  }
}
