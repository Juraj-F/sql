import { query } from "@/lib/db";

export async function findUserByEmail(data) {

const isInDb = await query(
  `
  SELECT id, email, clerk_user_id, auth_status 
  FROM users
  WHERE email=$1
  `,[data],
)
  return isInDb.rows[0] ?? null;
}

export async function setUserAsOrphaned(data) {
  console.log("data structure ",data)

const updatedUser = await query(`
  UPDATE users
  SET
    auth_status = 'ORPHANED',
    attempted_clerk_user_id = $1
  
  WHERE email = $2
  RETURNING *;
  `,[data.attemptedClerkUserId,data.emailToCheck]
)
console.log("updatedUser data",updatedUser.rows)
  return updatedUser.rows[0] ?? null;
}


export async function upsertClerkUserByEmail(data) {
  const primaryEmail =
    data.email_addresses?.find(
      (email) => email.id === data.primary_email_address_id,
    )?.email_address ?? null;

console.log("user clerk  id, email, first name, last name",
  data.id,
  data.email_addresses[0].email_address,
  data.first_name,
  data.last_name,
)
const emailAddress =data.email_addresses[0].email_address

const clerkUserId = data?.id
const normalizedEmail = emailAddress?.trim().toLowerCase()
const normalizedFirstName = data.first_name?.trim()
const normalizedLastName = data.last_name?.trim()

  if (
    !clerkUserId ||
    !normalizedEmail ||
    !normalizedFirstName ||
    !normalizedLastName
  ) {
    throw new Error("Missing required Clerk user data");
  }

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