
import { query } from "@/lib/db"


export async function GET() {
  
    const customers = await 
    query(`
      SELECT id AS value, name AS label
      FROM customers
      ORDER BY name
    `)

  return Response.json({customers:customers.rows})
}