
import { query } from "@/lib/db";

export async function deleteUserFromClerk(clerkUserId) {
  await query(
    `
      UPDATE app_users
      SET
        status = 'deleted',
        email = NULL,
        first_name = NULL,
        last_name = NULL,
        image_url = NULL,
        deleted_at = NOW(),
        updated_at = NOW()
      WHERE clerk_user_id = $1
    `,
    [clerkUserId],
  );
}