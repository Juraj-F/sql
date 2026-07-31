import { query } from "@/lib/db";
import { updateUserInDb } from "@/lib/users/updateUserInDb";
import {auth, clerkClient } from "@clerk/nextjs/server";
import { departmentOptions } from "@/lib/company-dashboard/departments";

async function findClerkUserId(currentUserId) {
  const response = await query(
    `
    SELECT clerk_user_id FROM users
    WHERE id = $1
    `,[currentUserId]
  )

  return response.rows[0]
}

export async function POST(request, {params}) {


  const clerk = await clerkClient()
  const {userId} =await auth()
  if(!userId) throw new Error("User id is missing")

  const {currentUserId} = await params

  const datas =await request.json()

  const depId = Object.values(departmentOptions)
  .find((item)=>item.value===datas.department)


const user = {
  name:datas.firstName,
  lastName: datas.lastName,
  role: datas.role,
  department_id: depId.id,
  salary: datas.salary
}

try{
  const clerkUserId = await findClerkUserId(currentUserId)
  const {clerk_user_id} = clerkUserId
  
    await clerk.users.updateUser(clerk_user_id, {
      firstName: datas.firstName,
      lastName: datas.lastName,
    });

const dbResponse = await updateUserInDb({currentUserId, user})

    return Response.json(
      { user },
      { status: 201 },
    );

} catch(err){
      console.error("User creation failed:", err);

    return Response.json(
      { error: "Could not update user" },
      { status: 500 },
    );
}

}