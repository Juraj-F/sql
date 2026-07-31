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
    let departmentId

    // console.log("data received after refactoring and department", data, data.department)
    //   const matchedDepartment = Object.values(departmentOptions)
    //   .find(value => value.label === data.department);

    const user = await createUserInDb({data, departmentId});

    if(!user) return
    const {email}=user[0]
    
    const clerk = await clerkClient();
    
    await clerk.invitations.createInvitation({
            emailAddress: email,
            redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
      })

    return Response.json(
      { user },
      { status: 201 },
    );
  } catch (error) {
    console.error("User creation failed:", error);

    return Response.json(
      { error: "Could not create user" },
      { status: 500 },
    );
  }
}