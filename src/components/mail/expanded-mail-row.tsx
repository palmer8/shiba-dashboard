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
  return (
    <div className="space-y-4 p-4 bg-muted/50">
      <div className="space-y-2">
        <h4 className="font-bold text-lg">우편 정보</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">유저 ID:</span> {row.user_id}
          </div>
          <div>
            <span className="font-medium">닉네임:</span> {row.nickname || "알 수 없음"}
          </div>
          <div>
            <span className="font-medium">생성일:</span> {new Date(row.created_at).toLocaleString('ko-KR')}
          </div>
        </div>
      </div>

      {Object.keys(row.reward_items).length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold text-lg">보상 아이템</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>아이템 코드</TableHead>
                <TableHead className="text-right">수량</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(row.reward_items).map(([itemCode, count]) => (
                <TableRow key={itemCode}>
                  <TableCell>{itemCode}</TableCell>
                  <TableCell className="text-right">
                    {formatKoreanNumber(count)}개
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {Object.keys(row.need_items).length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold text-lg">필요 아이템</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>아이템 코드</TableHead>
                <TableHead className="text-right">수량</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(row.need_items).map(([itemCode, count]) => (
                <TableRow key={itemCode}>
                  <TableCell>{itemCode}</TableCell>
                  <TableCell className="text-right">
                    {formatKoreanNumber(count)}개
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
