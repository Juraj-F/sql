import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(`
      SELECT
        current_database(),
        current_user,
        version()
    `);
    console.log("database",result.rows[0])
    return Response.json(result.rows[0]);
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}