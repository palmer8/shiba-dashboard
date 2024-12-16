import BoardWriteForm from "@/components/boards/board-write-form";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";

export default async function WritePage() {
  const session = await auth();

  if (!session || !session.user) return redirect("/login");

  if (session.user && !session.user.isPermissive) {
    return redirect("/pending");
  }

  return (
    <div className="flex flex-col gap-6 justify-center items-center p-6 w-screen h-screen">
      <BoardWriteForm />
    </div>
  );
}
