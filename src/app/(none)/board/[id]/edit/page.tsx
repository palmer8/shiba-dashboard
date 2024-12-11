import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { boardService } from "@/service/board-service";
import BoardEditForm from "@/components/boards/board-edit-form";
import { JSONContent } from "novel";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BoardEditPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) return redirect("/login");

  const awaitParams = await params;

  const result = await boardService.getBoardById(awaitParams.id);
  if (!result.success || !result.data) {
    return redirect("/boards");
  }

  if (
    result.data.registrant.id !== session.user.id &&
    session.user.role !== "SUPERMASTER"
  ) {
    return redirect("/boards");
  }

  const initialData = {
    title: result.data.title,
    content: result.data.content,
    categoryId: result.data.category.id,
    isNotice: result.data.isNotice,
  };

  return (
    <div className="flex flex-col gap-6 justify-center items-center p-6 w-screen h-screen">
      <BoardEditForm
        initialData={{
          title: result.data.title,
          content: result.data.content as JSONContent,
          categoryId: result.data.category.id,
          isNotice: result.data.isNotice,
        }}
        boardId={awaitParams.id}
      />
    </div>
  );
}
