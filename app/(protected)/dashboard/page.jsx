import CompanyDashboard from "@/components/companyDashboard";

export default async function CompanyDashboardPage({
  searchParams,
}) {
  const params = await searchParams;

  return (
    <CompanyDashboard initialParams={params} />
  );
}