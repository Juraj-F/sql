import { getDb } from "@/lib/db";
import { validateReadOnlyQuery } from "@/lib/sql-safety";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Neplatný JSON v tele požiadavky." },
      { status: 400 }
    );
  }

  const validation = validateReadOnlyQuery(body?.sql);

  if (!validation.ok) {
    return Response.json({ error: validation.reason }, { status: 400 });
  }

  const client = await getDb().connect();
  const startedAt = performance.now();

  try {
    await client.query("BEGIN READ ONLY");
    await client.query("SET LOCAL statement_timeout = '10s'");
    const result = await client.query(validation.sql);
    await client.query("COMMIT");

    return Response.json({
      columns: result.fields.map((field) => field.name),
      rows: result.rows,
      row_count: result.rowCount ?? result.rows.length,
      ms: Math.round(performance.now() - startedAt),
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    return Response.json(
      { error: `SQL chyba: ${error.message}` },
      { status: 400 }
    );
  } finally {
    client.release();
  }
}
