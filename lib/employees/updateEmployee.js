import { query } from "@/lib/db";

export async function updateEmployee(data) {

    console.log("data in upsertEmployee", data)
    
  const primaryEmail =
    data.email_addresses?.find(
      (email) => email.id === data.primary_email_address_id,
    )?.email_address ?? null;

  const result = await query(
    `
      INSERT INTO employees (
        email,
        first_name,
        last_name,
        image_url
      )
      VALUES ($1, $2, $3, $4, $5)

      ON CONFLICT (clerk_user_id)
      DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        image_url = EXCLUDED.image_url,
        updated_at = NOW()

      RETURNING *
    `,
    [
      primaryEmail,
      data.first_name ?? null,
      data.last_name ?? null,
      data.image_url ?? null,
    ],
  );

  return result.rows[0];
}