import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { updateUserInDb } from "@/lib/users/updateUserInDb";
import { upsertClerkUserByEmail, findUserByEmail, setUserAsOrphaned } from "@/lib/users/upsertClerkUserByEmail";
import { insertClerkIdIntoDb } from "@/lib/users/insertClerkIdIntoDb";
import { deleteUserInDb } from "@/lib/users/deleteUserInDb";

export async function POST(request) {
  let event;

  console.log("request in webhook",request)

  if(request)return

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

      const existingUser=await findUserByEmail(emailToCheck)

      console.log("creating user in db started")
    if (!existingUser) {
          await upsertClerkUserByEmail(event.data);
          return Response.json({
            received: true,
            message: "User added to database"
          })
      }

      console.log("adding clerk user in db started")
    if(!existingUser.clerk_user_id) {
          await insertClerkIdIntoDb(event.data);
          return Response.json({
            received: true,
            message: "Clerk id successfully added to database"
          })
      }
      
      console.log("comparing user ids in db started")
    if(existingUser.clerk_user_id===event.data.id){
      return Response.json({
            received: true,
            message: "Clerk id is the same as the id in database"
          })
    }

    console.log("starting orphaned function")
    await setUserAsOrphaned({
          emailToCheck,
          attemptedClerkUserId: event.data.id,
          });
          
    return Response.json({
          received: true,
          message: "User marked as orphaned",
  });
      }

    if (
      event.type === "user.updated" &&
      event.data.id
    ) {
      console.log("update starts")
      console.log("user updated with event data", event.data)
      if(event)return
      await updateUserInDb(event.data);
    }

    if (
      event.type === "user.deleted" &&
      event.data?.id
    ) {
      await deleteUserInDb(event.data.id);
      return Response.json({
            received: true,
            message: "User removed from database"
          })
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