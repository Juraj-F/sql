import { query } from "@/lib/db";

export async function checkEmailInDb(data) {
console.log("data in check the email",data)
const isInDb = await query(
  `
  SELECT * FROM users
  WHERE email=$1
  RETURNING *
  `,[data]
)
  console.log("isInDb query outcome", isInDb)
  if(isInDb) {Response.json({
    inDb:true
  })

  }
  else{ Response.json({
    inDb:false
  })}
}


export async function upsertClerkUserByEmail(data) {
  const primaryEmail =
    data.email_addresses?.find(
      (email) => email.id === data.primary_email_address_id,
    )?.email_address ?? null;

  const result = await query(
    `
      INSERT INTO users (
        clerk_user_id,
        email,
        name,
        last_name,
        role,
        hire_date,
        auth_status
      )
      VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6)

     ON CONFLICT (email)
     DO UPDATE SET
     clerk_user_id = EXCLUDED.clerk_user_id,
     name = EXCLUDED.name,
     last_name = EXCLUDED.last_name,
     auth_status = EXCLUDED.auth_status
     RETURNING *;
    `,
    [
      data.id,
      primaryEmail,
      data.first_name ?? null,
      data.last_name ?? null,
      "user",
      "active",
    ],
  );

  return result.rows[0];
}