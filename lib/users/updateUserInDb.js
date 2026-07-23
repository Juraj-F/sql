import { query } from "@/lib/db";

export async function updateUserInDb(data) {

  const primaryEmail =
    data.email_addresses?.find(
      (email) => email.id === data.primary_email_address_id,
    )?.email_address ?? null;

    if(!primaryEmail)  throw new Error("email is missing", primaryEmail)

  const clerkUserId=data.id
  const result = await query(
    `
      INSERT INTO users (
        clerk_user_id,
        email,
        first_name,
        last_name,
        updated_at
      )
      VALUES ($1, $2, $3, $4, NOW())

      ON CONFLICT (clerk_user_id)
      DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        updated_at = NOW()

      RETURNING *
    `,
    [clerkUserId,
      primaryEmail,
      data.first_name ?? null,
      data.last_name ?? null,
    ],
  );

  return result.rows[0];
}