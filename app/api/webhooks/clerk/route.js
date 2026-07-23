import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { isnerClerkIdIntoDb } from "@/lib/users/insertClerkIdIntoDb";
import { updateUserInDb } from "@/lib/users/updateUserInDb";

export async function POST(request) {
  console.log("clerk webhook is triggered", request)
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

  console.log("event type from webhook", event.type)

  try {

    if(
      event.type === "user.created"
    ){
      await isnerClerkIdIntoDb(event.data)
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