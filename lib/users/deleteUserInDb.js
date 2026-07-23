
import { query } from "@/lib/db";

export async function deleteUserInDb(clerkEmployeeId) {

  await query(
    `
      UPDATE users
      SET
        status = 'deleted',
        email = NULL,
        name = NULL,
        last_name = NULL,
        deleted_at = NOW(),
        updated_at = NOW()
      WHERE clerk_user_id = $1
    `,
    [clerkEmployeeId],
  );
}