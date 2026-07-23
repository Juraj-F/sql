import { query } from "@/lib/db"


export async function GET() {
  
    const customerSegments = await 
    query(`
      SELECT DISTINCT segment AS value, segment AS label
      FROM customers
      ORDER BY segment
    `)

  return Response.json({customerSegments:customerSegments.rows})
}