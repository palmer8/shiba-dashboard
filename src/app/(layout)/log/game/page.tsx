import { GlobalTitle } from "@/components/global/global-title";
import { auth } from "@/lib/auth-config";
import { realtimeService } from "@/service/realtime-service";
import GameDataFilter from "@/components/game/game-data-filter";
import { ComparisonOperator, GameDataType } from "@/types/game";
import { PageBreadcrumb } from "@/components/global/page-breadcrumb";
import { redirect } from "next/navigation";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";

interface LogGamePageProps {
  searchParams: Promise<{
    type?: string;
    itemId?: string;
    value?: string;
    condition?: string;
    page?: string;
  }>;
}

export default async function LogGamePage({ searchParams }: LogGamePageProps) {
  const session = await auth();

  if (!session || !session.user) return redirect("/login");

  if (!hasAccess(session.user.role, UserRole.INGAME_ADMIN))
    return redirect("/");

  const params = await searchParams;

  let data = null;
  let error = null;

  try {
    const { type, itemId, value, condition, page = "1" } = params;

    if (type === "ITEM" && itemId && value && condition) {
      data = await realtimeService.getGameDataByItemType({
        itemId,
        value: Number(value),
        condition: condition as ComparisonOperator,
        page: Number(page),
      });
    } else if (
      ["CREDIT", "CREDIT2"].includes(type || "") &&
      value &&
      condition
    ) {
      data = await realtimeService.getGameDataByCredit({
        creditType: type as "CREDIT" | "CREDIT2",
        value: Number(value),
        condition: condition as ComparisonOperator,
        page: Number(page),
      });
    } else if (["BANK", "WALLET"].includes(type || "") && value && condition) {
      data = await realtimeService.getGameDataByMoney({
        moneyType: type as "WALLET" | "BANK",
        value: Number(value),
        condition: condition as ComparisonOperator,
        page: Number(page),
      });
    } else if (type === "REGISTRATION" && value) {
      data = await realtimeService.getGameDataByRegistration({
        value,
        page: Number(page),
      });
    } else if (type === "MILEAGE" && value && condition) {
      data = await realtimeService.getGameDataByMileage({
        value: Number(value),
        condition: condition as ComparisonOperator,
        page: Number(page),
      });
    } else if (
      ["CURRENT_CASH", "ACCUMULATED_CASH"].includes(type || "") &&
      value &&
      condition
    ) {
      data = await realtimeService.getGameDataByCash({
        cashType: type as "CURRENT_CASH" | "ACCUMULATED_CASH",
        value: Number(value),
        condition: condition as ComparisonOperator,
        page: Number(page),
      });
    }
  } catch (e) {
    error =
      e instanceof Error
        ? e.message
        : "데이터를 불러오는 중 오류가 발생했습니다.";
    console.error("페이지 로드 에러:", e);
  }

  return (
    <main>
      <PageBreadcrumb />
      <GlobalTitle
        title="게임 데이터 조회"
        description="게임 데이터를 통해 조건에 맞는 유저를 조회합니다."
      />
      <GameDataFilter
        error={error}
        type={params.type as GameDataType}
        data={data}
        currentPage={Number(params.page) || 1}
      />
    </main>
  );
}
