import { query } from "@/lib/db"


export async function GET() {
  
    const criticalities = await 
    query(`
      SELECT DISTINCT
        criticality AS value,
        criticality AS label
      FROM components
      ORDER BY criticality
    `)

  return Response.json({criticalities:criticalities.rows})
}