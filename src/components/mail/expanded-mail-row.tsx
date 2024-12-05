import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatKoreanNumber } from "@/lib/utils";
import { PersonalMail } from "@/types/mail";

interface ExpandedMailRowProps {
  row: PersonalMail;
}

export function ExpandedMailRow({ row }: ExpandedMailRowProps) {
  const getRewardTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      ITEM: "아이템",
      MONEY: "현금",
      BANK: "계좌",
    };
    return typeMap[type];
  };

  return (
    <div className="space-y-4 p-4 bg-muted/50">
      <div className="space-y-2">
        <h4 className="font-bold text-lg">내용</h4>
        <div className="text-sm whitespace-pre-wrap">{row.content}</div>
      </div>

      {row.rewards && row.rewards.length > 0 && (
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
      )}

      {row.needItems && row.needItems.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold text-lg">��요 아이템 목록</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">아이템 유형</TableHead>
                <TableHead>아이템 정보</TableHead>
                <TableHead className="text-right">수량/금액</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {row.needItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{getRewardTypeLabel(item.type)}</TableCell>
                  <TableCell>
                    {item.type === "ITEM" ? (
                      <div className="flex flex-col">
                        <span>ID: {item.itemId}</span>
                        <span className="text-muted-foreground">
                          {item.itemName}
                        </span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.type === "ITEM"
                      ? `${formatKoreanNumber(parseInt(item.amount))}개`
                      : `${formatKoreanNumber(parseInt(item.amount))}원`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
