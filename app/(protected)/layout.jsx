import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { findUserByClerkId } from "@/lib/users/findUserByClerkId";

export default async function ProtectedLayout({ children }) {
  const { userId } = await auth();
  console.log("userid", userId)

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await findUserByClerkId(userId);
  console.log("user found", user.rows[0])

  if (!user) {
    redirect("/account-error");
  }

  if (user.rows[0].auth_status?.toUpperCase() !== "ACTIVE") {
    redirect("/account-error");
  }

  return children;
}