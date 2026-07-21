import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CompanyDashboard from "@/components/companyDashboard";

export default async function CompanyDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <CompanyDashboard />;
}