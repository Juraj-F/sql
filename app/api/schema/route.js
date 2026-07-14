import { query } from "@/lib/db";
import { TABLES } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const columnsResult = await query(
      `SELECT
         table_name,
         column_name AS name,
         data_type AS type,
         ordinal_position
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = ANY($1::text[])
       ORDER BY table_name, ordinal_position`,
      [TABLES]
    );

    const countSelects = TABLES.map(
      (table) =>
        `SELECT '${table}'::text AS table_name, COUNT(*)::integer AS row_count FROM "${table}"`
    ).join(" UNION ALL ");

    const countsResult = await query(countSelects);
    const schema = Object.fromEntries(
      TABLES.map((table) => [table, { columns: [], row_count: 0 }])
    );

    for (const column of columnsResult.rows) {
      schema[column.table_name].columns.push({
        name: column.name,
        type: column.type,
      });
    }

    for (const count of countsResult.rows) {
      schema[count.table_name].row_count = count.row_count;
    }

    return Response.json(schema);
  } catch (error) {
    console.error("Schema route failed:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
