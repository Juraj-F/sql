import { query } from "../db";
export async function findUserByClerkId(clerkUserId) {
    const result = query(
    `
      SELECT *
      FROM users
      WHERE clerk_user_id = $1
    `,
    [clerkUserId]
  );

  return result

}