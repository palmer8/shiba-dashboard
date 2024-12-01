import { auth } from "@/lib/auth-config";
import { userService } from "@/service/user-service";
import { redirect } from "next/navigation";

export default async function AdminLogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;

  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  return <main>AdminLogPage</main>;
}
