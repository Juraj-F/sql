import { auth, clerkClient } from "@clerk/nextjs/server";
import { upsertEmployeeFromClerk } from "@/lib/employees/upsertEmployeeFromClerk";
import { updateEmployee } from "@/lib/employees/updateEmployee";
import { redirect } from "next/dist/server/api-utils";

export async function POST(request) {
  const { userId } = await auth();
  console.log("raw request", request)

  if (!userId) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const data = await request.json();

    console.log("json data", data)

    const employee = await upsertEmployeeFromClerk(data);

    if(!employee) return
    
    const clerk = await clerkClient();

      const invitation = await clerk.invitations.createInvitation({
            emailAddress: employee.email,
            // redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
      })
      console.log("invitation", invitation)

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