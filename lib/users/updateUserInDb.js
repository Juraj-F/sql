import { query } from "@/lib/db";
import { departmentOptions } from "../company-dashboard/departments";

export async function updateUserInDb(data) {

  const {currentUserId, user} = data

  console.log("departmentOptions",departmentOptions)

  const result = 

  await query(`
      UPDATE users
      SET
      name = $1,
      last_name = $2,
      role = $3,
      department_id = $4,
      salary= $5,
      updated_at= NOW()
      WHERE id = $6
      RETURNING *
    `,[user.name,
       user.lastName,
       user.role,
       user.department_id,
       user.salary,
       currentUserId])
         
       return result.rows[0];
}