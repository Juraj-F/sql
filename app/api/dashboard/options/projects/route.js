import { query } from "@/lib/db"


export async function GET() {
  
    const projects= await 
    query(`
      SELECT id AS value, name AS label
      FROM projects
      ORDER BY name
    `)

  return Response.json({projects:projects.rows})
}
