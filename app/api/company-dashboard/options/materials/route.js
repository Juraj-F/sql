import { query } from "@/lib/db"


export async function GET() {
  
    const materials= await 
    query(`
      SELECT DISTINCT material AS value, material AS label
      FROM components
      ORDER BY material
    `)

  return Response.json({materials:materials.rows})
}