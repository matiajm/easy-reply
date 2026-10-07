import { Dashboard } from "@/components/Dashboard";
import { getTriagedInbox } from "@/lib/inbox";

export const dynamic = "force-dynamic";

export default async function Home() {
  const emails = await getTriagedInbox();
  return <Dashboard emails={emails} />;
}
