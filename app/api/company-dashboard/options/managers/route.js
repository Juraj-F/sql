

import { query } from "@/lib/db"


export async function GET() {
  
    const managers= await 
    query(`
      SELECT id AS value, name AS label
      FROM employees
      ORDER BY name
    `)

  return Response.json({managers:managers.rows})
}