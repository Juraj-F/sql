import { EXAMPLE_QUERIES } from "@/lib/constants";

export async function GET() {
  return Response.json(EXAMPLE_QUERIES);
}
