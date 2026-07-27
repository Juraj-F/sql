import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { updateUserInDb } from "@/lib/users/updateUserInDb";
import { upsertClerkUserByEmail, checkEmailInDb } from "@/lib/users/upsertClerkUserByEmail";
import { insertClerkIdIntoDb } from "@/lib/users/insertClerkIdIntoDb";

export async function POST(request) {
  let event;

  try {
        console.log("Starting webhook verification");
    event = await verifyWebhook(request);
  } catch (error) {
    console.error("Invalid Clerk webhook:", error);

    return Response.json(
      { error: "Invalid webhook" },
      { status: 400 },
    );
  }

  try {
    console.log("event type", event.type)

    if(
      event.type === "user.created"
    ){
      const emailToCheck = event.data.email_addresses[0].email_address
      console.log("email is in DB",emailToCheck)
      const emailInDb=await checkEmailInDb(emailToCheck)

      console.log("email is in DB",emailInDb)

    if (emailInDb) {
          await insertClerkIdIntoDb(event.data);
      } else {
          await upsertClerkUserByEmail(event.data);
      }
          }

    if (
      event.type === "user.updated" &&
      event.data.id
    ) {
      await updateUserInDb(event.data);
    }

    if (
      event.type === "user.deleted" &&
      event.data.id
    ) {
      await deleteUserInDb(event.data.id);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error(`Failed to process ${event.type}:`, error);

    return Response.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}