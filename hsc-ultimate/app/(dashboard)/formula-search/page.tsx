import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { FormulaSearchPage } from "@/components/formula-search/formula-search-page";

export default async function FormulaSearchRoute() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return <FormulaSearchPage />;
}
