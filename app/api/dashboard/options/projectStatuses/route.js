import { query } from "@/lib/db"


export async function GET() {
  
    const projects= await 
    query(`
      SELECT DISTINCT status AS value, status AS label
      FROM projects
      ORDER BY status
    `)

  return Response.json({projects:projects.rows})
}
