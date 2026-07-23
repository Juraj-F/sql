

import { query } from "@/lib/db"


export async function GET() {
  
    const departments= await 
    query(`
      SELECT id AS value, name AS label
      FROM departments
      ORDER BY name
    `)

  return Response.json({departments:departments.rows})
}