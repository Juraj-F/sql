
import { query } from "@/lib/db"


export async function GET() {
  
    const orderStatuses= await 
    query(`
      SELECT DISTINCT status AS value, status AS label
      FROM orders
      ORDER BY status
    `)

  return Response.json({orderStatuses:orderStatuses.rows})
}