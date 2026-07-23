import { query } from "@/lib/db";

export async function createUserInDb(data) {

  const authStatus = 'created'

try{const result = await query(
    `   INSERT INTO users (
        email,
        name,
        last_name,
        role,
        hire_date,
        auth_status
      )
      VALUES ($1, $2, $3, $4, CURRENT_DATE, $5)`,
    [
      data.email ?? null,
      data.firstName ?? null,
      data.lastName ?? null,
      data.role,
      authStatus,
    ],
  );

  return result.rows[0];}
  catch(err){
    console.error("sql error",err)}
  
}