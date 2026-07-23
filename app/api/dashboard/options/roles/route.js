
import { query } from "@/lib/db"


export async function GET() {
  
    const roles= await 
    query(`
      SELECT DISTINCT role AS value, role AS label
      FROM users
      ORDER BY role
    `)

  return Response.json({roles:roles.rows})
}