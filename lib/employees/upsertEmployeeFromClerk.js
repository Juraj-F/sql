import { query } from "@/lib/db";

export async function upsertEmployeeFromClerk(data) {

    console.log("data in upsertEmployee", data)
    console.log("firstname in upsertEmployee", data.firstName)
    console.log("lastname in upsertEmployee", data.lastName)
    
  // const primaryEmail =
  //   data.email_addresses?.find(
  //     (email) => email.id === data.primary_email_address_id,
  //   )?.email_address ?? null;

  const authStatus = 'created'

try{const result = await query(
    `   INSERT INTO employees (
        email,
        name,
        last_name,
        role,
        hire_date,
        auth_status
      )
      VALUES ($1, $2, $3, $4, CURRENT_DATE, $5)

      ON CONFLICT (clerk_user_id)
      DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role,
        hire_date = EXCLUDED.hire_date,
        auth_status = EXCLUDED.auth_status

      RETURNING *
    `,
    [
      data.email ?? null,
      data.firstName ?? null,
      data.lastName ?? null,
      data.role,
      // data.imageUrl ?? null,
      authStatus,
    ],
  );

  return result.rows[0];}
  catch(err){
    console.error("sql error",err)}
  
}