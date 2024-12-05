import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatKoreanNumber } from "@/lib/utils";
import { GroupMail } from "@/types/mail";

interface ExpandedGroupMailRowProps {
  row: GroupMail;
}

export function ExpandedGroupMailRow({ row }: ExpandedGroupMailRowProps) {
  const getRewardTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      ITEM: "아이템",
      MONEY: "현금",
      BANK: "계좌",
      CREDIT: "무료 캐시",
      CREDIT2: "유료 캐시",
    };
    return typeMap[type];
  };

  return (
    <div className="space-y-2 p-4 bg-muted/50">
      <div className="space-y-2">
        <h4 className="font-bold text-lg">내용</h4>
        <div className="text-sm whitespace-pre-wrap">{row.content}</div>
      </div>
      <div className="space-y-2">
        <h4 className="font-bold text-lg">보상 목록</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">보상 유형</TableHead>
              <TableHead>아이템 정보</TableHead>
              <TableHead className="text-right">수량/금액</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {row.rewards.map((reward, index) => (
              <TableRow key={index}>
                <TableCell>{getRewardTypeLabel(reward.type)}</TableCell>
                <TableCell>
                  {reward.type === "ITEM" ? (
                    <div className="flex flex-col">
                      <span>ID: {reward.itemId}</span>
                      <span className="text-muted-foreground">
                        {reward.itemName}
                      </span>
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {reward.type === "ITEM"
                    ? `${formatKoreanNumber(parseInt(reward.amount))}개`
                    : `${formatKoreanNumber(parseInt(reward.amount))}원`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
