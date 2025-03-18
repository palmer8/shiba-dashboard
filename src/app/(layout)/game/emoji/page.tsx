import { GlobalTitle } from "@/components/global/global-title";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { EmojiTable } from "@/components/emoji/emoji-table";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { emojiService } from "@/service/emoji-service";
import { EmojiTableData } from "@/types/emoji";

export default async function EmojiPage() {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && !session.user.isPermissive) return redirect("/pending");

  const result = await emojiService.getAllEmojis();

  const tableData: EmojiTableData =
    result.success && result.data ? { records: result.data } : { records: [] };

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="이모지 관리"
        description="SHIBA 이용자의 이모지를 관리합니다. 사용자 ID 기준으로 이모지를 추가하거나 제거할 수 있습니다."
      />
      <EmojiTable data={tableData} session={session} />
    </main>
  );
}
