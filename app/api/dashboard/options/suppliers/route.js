
import { query } from "@/lib/db"


export async function GET() {
  
    const suppliers= await 
    query(`
      SELECT id AS value, name AS label
      FROM suppliers
      ORDER BY name
    `)

  return Response.json({suppliers:suppliers.rows})
}