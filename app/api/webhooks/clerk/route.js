import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { upsertUserFromClerk } from "@/lib/users/upsertUserFromClerk";
import { deleteUserFromClerk } from "@/lib/users/deleteUserFromClerk";

export async function POST(request) {
  console.log("clerk webhooks triggered", request)
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

  console.log("event from webhook", event)

  try {
    if (
      event.type === "user.created" ||
      event.type === "user.updated"
    ) {
      await upsertUserFromClerk(event.data);
    }

    if(
      event.data.id
    ){await upsertUserFromClerk(event.data);}

    if (
      event.type === "user.deleted" &&
      event.data.id
    ) {
      await deleteUserFromClerk(event.data.id);
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