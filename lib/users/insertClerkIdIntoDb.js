import { query } from "@/lib/db";

export async function isnerClerkIdIntoDb(data) {

    console.log("data in createuser", data)
    const clerkId = data.id
    console.log("clerk id", clerkId)
    
  const primaryEmail =
    data.email_addresses?.find(
      (email) => email.id === data.primary_email_address_id,
    )?.email_address ?? null;

    console.log("primary email address", primaryEmail)

  const authStatus = 'active'

try{
    const result = await query(
    `   UPDATE users
        SET
        clerk_user_id = $1,
        auth_status = $2,
        updated_at = NOW()
      WHERE email = $3
      RETURNING *
    `,
    [
        clerkId,
        authStatus,
        primaryEmail,
    ]
  );

  if (result.rows.length === 0) {
  throw new Error("This email is not in database");
}

  return result.rows[0];}
  catch(err){
    console.error("sql error",err)}
  
}