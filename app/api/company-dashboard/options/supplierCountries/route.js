import { query } from "@/lib/db"


export async function GET() {
  
    const supplierCountries= await 
    query(`
      SELECT DISTINCT country AS value, country AS label
      FROM suppliers
      ORDER BY country
    `)

  return Response.json({supplierCountries:supplierCountries.rows})
}