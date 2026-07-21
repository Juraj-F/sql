// import { getDashboardData, DashboardQueryError } from "@/lib/company-dashboard/getDashboardData";

// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);

//     const queryParams = Object.fromEntries(searchParams.entries());

//     const result = await getDashboardData(queryParams);

//     return Response.json(result);
//   } catch (error) {
//     console.error("Company dashboard request failed:", error);

//     if (error instanceof DashboardQueryError) {
//       return Response.json(
//         { error: error.message },
//         { status: error.status },
//       );
//     }

//     return Response.json(
//       { error: "Failed to load dashboard data" },
//       { status: 500 },
//     );
//   }
// }





import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { query } from "@/lib/db";

export async function POST(request) {
  let event;

  try {
    event = await verifyWebhook(request);
  } catch (error) {
    console.error("Invalid Clerk webhook:", error);

    return Response.json(
      { error: "Invalid webhook" },
      { status: 400 },
    );
  }

  const { type, data } = event;
  console.log("clerk type", type)

  if (type === "user.created" || type === "user.updated") {
    const primaryEmail =
      data.email_addresses?.find(
        (email) => email.id === data.primary_email_address_id,
      )?.email_address ?? null;

    await query(
      `
        INSERT INTO users (
          clerk_user_id,
          email,
          first_name,
          last_name,
          image_url
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (clerk_user_id)
        DO UPDATE SET
          email = EXCLUDED.email,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          image_url = EXCLUDED.image_url,
          updated_at = NOW()
      `,
      [
        data.id,
        primaryEmail,
        data.first_name,
        data.last_name,
        data.image_url,
      ],
    );
  }

  if (type === "user.deleted" && data.id) {
    await query(
      `
        UPDATE users
        SET
          email = NULL,
          first_name = NULL,
          last_name = NULL,
          image_url = NULL,
          updated_at = NOW()
        WHERE clerk_user_id = $1
      `,
      [data.id],
    );
  }

  return Response.json({ received: true });
}