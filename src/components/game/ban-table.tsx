"use client";

import { BanRecord } from "@/service/ban-service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCallback, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import Empty from "@/components/ui/empty";
import EditBanDialog from "@/components/game/edit-ban-dialog";
import BanIdentifiersDialog from "@/components/game/ban-identifiers-dialog";
import { deleteBanDirectlyFromDbAction } from "@/actions/ban-action";
import { toast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { hasAccess } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import AddBanDialog from "./add-ban-dialog";

interface BanTableProps {
  data: {
    records: BanRecord[];
    metadata: {
      total: number;
      page: number;
      totalPages: number;
    };
  };
}

export default function BanTable({ data }: BanTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputPage, setInputPage] = useState(data.metadata.page.toString());
  const { data: session } = useSession();
  const isMaster = session?.user && hasAccess(session.user.role, UserRole.MASTER);
  const tableContainerRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    setInputPage(data.metadata.page.toString());
  }, [data.metadata.page]);

  useEffect(() => {
    if (tableContainerRef.current && tableContainerRef.current.parentElement) {
      tableContainerRef.current.parentElement.scrollTop = 0;
    }
  }, [data.metadata.page]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleDelete = async (id: string) => {
    if (!confirm("정말로 이 하드밴을 해제하시겠습니까?")) return;
    const result = await deleteBanDirectlyFromDbAction(id);
    if (result.success) {
      toast({ title: "하드밴 해제 성공" });
    } else {
      toast({
        title: "하드밴 해제 실패",
        description: result.error || "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {isMaster && (
        <div className="flex justify-end items-center">
          <AddBanDialog />
        </div>
      )}
      <Table ref={tableContainerRef}>
        <TableHeader>
          <TableRow>
            <TableHead>id</TableHead>
            <TableHead>고유번호</TableHead>
            <TableHead>닉네임</TableHead>
            <TableHead>밴 사유</TableHead>
            <TableHead>식별자</TableHead>
            <TableHead>생성 일자</TableHead>
            {isMaster && <TableHead>관리</TableHead>}
          </TableRow>
        </TableHeader>
        {data.records.length > 0 ? (
          <TableBody>
            {data.records.map((row) => {
              return (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>
                    {row.user_id || (
                      <span className="text-muted-foreground">정보없음</span>
                    )}
                  </TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    <div
                      className="max-w-[200px] truncate"
                      title={row.banreason}
                    >
                      {row.banreason}
                    </div>
                  </TableCell>
                  <TableCell>
                    <BanIdentifiersDialog
                      banId={row.id}
                      currentUserId={row.user_id}
                      currentName={row.name}
                      currentBanreason={row.banreason}
                      initialIdentifiers={row.identifiers}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(row.created_at).toLocaleString("ko-KR")}
                  </TableCell>
                  {isMaster && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <EditBanDialog
                            id={row.id}
                            initialUserId={row.user_id}
                            initialName={row.name}
                            initialBanreason={row.banreason}
                            initialIdentifiers={row.identifiers}
                            trigger={
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>수정</span>
                              </DropdownMenuItem>
                            }
                          />
                          <DropdownMenuItem
                            onClick={() => handleDelete(row.id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            <span>해제</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        ) : (
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={isMaster ? 7 : 6}
                className="h-24 text-center"
              >
                <Empty description="데이터가 존재하지 않습니다." />
              </TableCell>
            </TableRow>
          </TableBody>
        )}
      </Table>

      {data.records.length > 0 && (
        <div className="flex items-center justify-between py-2">
          <div className="text-sm text-muted-foreground">
            총 {data.metadata.total}개 중 {(data.metadata.page - 1) * 50 + 1}-
            {Math.min(data.metadata.page * 50, data.metadata.total)}개 표시
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.metadata.page - 1)}
              disabled={data.metadata.page <= 1}
            >
              이전
            </Button>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                onBlur={(e) => {
                  let newPage = parseInt(e.target.value);
                  if (isNaN(newPage) || newPage < 1) {
                    newPage = 1;
                    setInputPage("1");
                  } else if (newPage > data.metadata.totalPages) {
                    newPage = data.metadata.totalPages;
                    setInputPage(data.metadata.totalPages.toString());
                  }
                  handlePageChange(newPage);
                }}
                className="w-12 rounded-md border border-input bg-background px-2 py-1 text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min={1}
                max={data.metadata.totalPages}
              />
              <span className="text-sm text-muted-foreground">
                / {data.metadata.totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.metadata.page + 1)}
              disabled={data.metadata.page >= data.metadata.totalPages}
            >
              다음
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
