import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";

export default async function PendingPage() {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && session.user.isPermissive) return redirect("/");

  return <div className="w-screen h-screen"></div>;
}
