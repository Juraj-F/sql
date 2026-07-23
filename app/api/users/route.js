import { auth, clerkClient } from "@clerk/nextjs/server";
import { createUserInDb } from "@/lib/users/createUserInDb";


export async function POST(request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const data = await request.json();

    const employee = await createUserInDb(data);

    if(!employee) return
    
    const clerk = await clerkClient();
    
    await clerk.invitations.createInvitation({
            emailAddress: employee.email,
            redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
      })

    return Response.json(
      { employee },
      { status: 201 },
    );
  } catch (error) {
    console.error("Employee creation failed:", error);

    return Response.json(
      { error: "Could not create employee" },
      { status: 500 },
    );
  }
}