import { getDashboardData, DashboardQueryError } from "@/lib/company-dashboard/getDashboardData";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const queryParams = Object.fromEntries(searchParams.entries());

    const result = await getDashboardData(queryParams);

    return Response.json(result);
    
  } catch (error) {
    console.error("Company dashboard request failed:", error);

    if (error instanceof DashboardQueryError) {
      return Response.json(
        { error: error.message },
        { status: error.status },
      );
    }

    return Response.json(
      { error: "Failed to load dashboard data" },
      { status: 500 },
    );
  }
}