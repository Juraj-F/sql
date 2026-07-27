import { query } from "@/lib/db";
import { departmentOptions } from "../company-dashboard/departments";
import { rolesOptions } from "../company-dashboard/rolesOptions";

export async function createUserInDb({data, departmentId}) {
console.log("departments options", departmentOptions)
console.log("roles", rolesOptions)
console.log("department id create user", departmentId)
console.log("data in create user", data)
  const authStatus = 'created'

const allowedKeys=[
  "firstName",
  "lastName",
  "role",
  "department",
  "hiteDate",
  "email",
  "salary",
  "hireDate",
]

  const notAllowedKeys = Object.keys(data).filter(item=>!allowedKeys.includes(item))
  console.log("notAllowedKeys", notAllowedKeys)

  if(notAllowedKeys.length>0){
    return Response.json({
      error:"This request includes not allowed keys",
    },
  {
    status:400,
  })
  }
  
  const user={
    email:data.email,
    department_id:departmentId,
    name:data.firstName,
    last_name: data.lastName,
    role: data.role,
    hire_date: data.hireDate,
    auth_status:authStatus,
  }
console.log("user", user)

try{const result = await query(
    `   INSERT INTO users (
        email,
        name,
        last_name,
        department_id,
        role,
        hire_date,
        auth_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
    [
      user.email,
      user.name,
      user.last_name,
      user.department_id,
      user.role,
      user.hire_date,
      user.auth_status
    ],
  );
  console.log("result after query",result.rows)
  return result.rows;
}
  catch(err){
    console.error("sql error",err)}
  
}