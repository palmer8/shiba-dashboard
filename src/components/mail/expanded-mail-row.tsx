import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatKoreanNumber } from "@/lib/utils";
import { PersonalMailDisplay } from "@/types/mail";

interface ExpandedMailRowProps {
  row: PersonalMailDisplay;
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
            <span className="font-medium">제목:</span> {row.title}
          </div>
          <div>
            <span className="font-medium">생성일:</span> {new Date(row.created_at).toLocaleString('ko-KR')}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-bold text-lg">내용</h4>
        <div className="text-sm whitespace-pre-wrap p-3 bg-muted/30 rounded-lg">
          {row.content}
        </div>
      </div>

      {Object.keys(row.reward_items).length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold text-lg">보상 아이템</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>아이템명</TableHead>
                <TableHead>아이템 코드</TableHead>
                <TableHead className="text-right">수량</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(row.reward_items).map(([itemCode, itemInfo]) => (
                <TableRow key={itemCode}>
                  <TableCell className="font-medium">{itemInfo.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{itemCode}</TableCell>
                  <TableCell className="text-right">
                    {formatKoreanNumber(itemInfo.amount)}개
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
                <TableHead>아이템명</TableHead>
                <TableHead>아이템 코드</TableHead>
                <TableHead className="text-right">수량</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(row.need_items).map(([itemCode, itemInfo]) => (
                <TableRow key={itemCode}>
                  <TableCell className="font-medium">{itemInfo.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{itemCode}</TableCell>
                  <TableCell className="text-right">
                    {formatKoreanNumber(itemInfo.amount)}개
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
