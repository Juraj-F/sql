import { auth, clerkClient } from "@clerk/nextjs/server";
import { createUserInDb } from "@/lib/users/createUserInDb";
import { departmentOptions } from "@/lib/company-dashboard/departments";


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

    console.log("data received after refactoring and department", data, data.department)
      const matchedDepartment = Object.values(departmentOptions)
      .find(value => value.label === data.department);


    if (matchedDepartment) {
        departmentId=matchedDepartment.id;
      }

    const user = await createUserInDb({data, departmentId});

    if(!user) return
    const {email}=user[0]

    console.log("user in return in route", user)
    console.log("user email", email)
    
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
    console.error("Employee creation failed:", error);

    return Response.json(
      { error: "Could not create employee" },
      { status: 500 },
    );
  }
}