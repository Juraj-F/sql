import { query } from "@/lib/db"


export async function GET() {
  
    const customerCountries = await 
    query(`
      SELECT DISTINCT country AS value, country AS label
      FROM customers
      ORDER BY country
    `)

  return Response.json({customerCountries:customerCountries.rows})
}