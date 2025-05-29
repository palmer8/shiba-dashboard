"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { CouponDisplay, CouponFilter } from "@/types/coupon";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import {
  formatKoreanDateTime,
  hasAccess,
} from "@/lib/utils";
import AddCouponDialog from "@/components/dialog/add-coupon-dialog";
import {
  deleteCouponAction,
  getCouponCodesAction,
  downloadSelectedCouponsZipAction,
} from "@/actions/coupon-action";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MoreHorizontal,
  Trash,
  Edit2,
  Plus,
  Eye,
  Package,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRole } from "@prisma/client";
import EditCouponDialog from "@/components/dialog/edit-coupon-dialog";
import Empty from "@/components/ui/empty";
import { Session } from "next-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CouponExpandedRow } from "./coupon-expanded-row";
import JSZip from "jszip";

interface CouponTableProps {
  data: { coupons: CouponDisplay[]; metadata: any };
  page: number;
  session: Session;
  filters: CouponFilter;
}

export function CouponTable({ data, page, session, filters }: CouponTableProps) {
  const [selectedCoupon, setSelectedCoupon] = useState<CouponDisplay | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCodesDialogOpen, setIsCodesDialogOpen] = useState(false);
  const [couponCodes, setCouponCodes] = useState<string[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputPage, setInputPage] = useState((page + 1).toString());
  const tableContainerRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    setInputPage((page + 1).toString());
  }, [page]);

  useEffect(() => {
    if (tableContainerRef.current && tableContainerRef.current.parentElement) {
      tableContainerRef.current.parentElement.scrollTop = 0;
    }
  }, [page]);

  const handleViewCodes = async (coupon: CouponDisplay) => {
    setSelectedCoupon(coupon);
    setLoadingCodes(true);
    setIsCodesDialogOpen(true);
    
    try {
      const result = await getCouponCodesAction(coupon.id);
      if (result.success && result.data) {
        setCouponCodes(result.data);
      } else {
        toast({
          title: "쿠폰 코드 조회 실패",
          description: result.error || "잠시 후 다시 시도해주세요",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "쿠폰 코드 조회 실패",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    } finally {
      setLoadingCodes(false);
    }
  };

  const handleDownloadSelectedZip = async () => {
    const selectedRowIds = table.getSelectedRowModel().rows.map(row => row.original.id);
    
    if (selectedRowIds.length === 0) {
      toast({
        title: "선택된 쿠폰이 없습니다",
        description: "다운로드할 쿠폰을 선택해주세요",
        variant: "destructive",
      });
      return;
    }

    setDownloadingZip(true);
    try {
      const result = await downloadSelectedCouponsZipAction(selectedRowIds);
      
      if (result.success && result.data && result.filename) {
        // ZIP 파일 생성
        const zip = new JSZip();
        
        // 각 CSV 파일을 ZIP에 추가
        result.data.files.forEach((file: { name: string; content: string }) => {
          zip.file(file.name, file.content);
        });

        // ZIP 파일 생성 및 다운로드
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(zipBlob);
        link.setAttribute("href", url);
        link.setAttribute("download", result.filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "ZIP 다운로드 완료",
          description: `${result.data.totalCoupons}개 쿠폰, ${result.data.totalCodes}개 코드가 다운로드되었습니다.`,
        });
      } else {
        toast({
          title: "ZIP 다운로드 실패",
          description: result.error || "잠시 후 다시 시도해주세요",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "ZIP 다운로드 실패",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    } finally {
      setDownloadingZip(false);
    }
  };

  const columns: ColumnDef<CouponDisplay>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          onClick={(e) => e.stopPropagation()}
          checked={row.getIsSelected()}
          onCheckedChange={() => row.toggleSelected()}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "쿠폰명",
    },
    {
      accessorKey: "type",
      header: "타입",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.type === "퍼블릭" ? "default" : "secondary"
          }
        >
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "_count.codes",
      header: "발급 수",
      cell: ({ row }) => {
        const count = row.original._count?.codes || 0;
        return count > 0 ? count.toLocaleString() + "개" : "0개";
      },
    },
    {
      accessorKey: "_count.usedCodes",
      header: "사용 수",
      cell: ({ row }) => {
        if (row.original.type === "퍼블릭") {
          return <span className="text-muted-foreground">-</span>;
        }
        
        const usedCount = row.original._count?.usedCodes || 0;
        const totalCount = row.original._count?.codes || 0;
        return (
          <div className="flex flex-col">
            <span>{usedCount.toLocaleString()}개</span>
            {totalCount > 0 && (
              <span className="text-xs text-muted-foreground">
                ({((usedCount / totalCount) * 100).toFixed(1)}%)
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "maxcount",
      header: "사용 제한",
      cell: ({ row }) =>
        row.original.maxcount ? row.original.maxcount + "번" : "무제한",
    },
    {
      accessorKey: "start_time",
      header: "시작일",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatKoreanDateTime(row.original.start_time)}
        </span>
      ),
    },
    {
      accessorKey: "end_time",
      header: "종료일",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatKoreanDateTime(row.original.end_time)}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "생성일",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatKoreanDateTime(row.original.created_at)}
        </span>
      ),
    },
    {
    id: "actions",
      cell: ({ row }) => {
        const canModify = hasAccess(session?.user!.role, UserRole.SUPERMASTER);

        if (!canModify) return null;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem
                onClick={() => handleViewCodes(row.original)}
              >
                <Eye className="mr-2 h-4 w-4" />
                <span>코드 보기</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCoupon(row.original);
                  setIsEditDialogOpen(true);
                }}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                <span>수정</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  if (
                    confirm(
                      "정말로 이 쿠폰을 삭제하시겠습니까?\n쿠폰 코드와 로그도 모두 삭제됩니다."
                    )
                  ) {
                    const result = await deleteCouponAction(row.original.id);
                    if (result.success) {
                      toast({
                        title: "쿠폰 삭제 완료",
                      });
                    } else {
                      toast({
                        title: "쿠폰 삭제 실패",
                        description: result.error || "잠시 후 다시 시도해주세요",
                        variant: "destructive",
                      });
                    }
                  }
                }}
                className="text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>삭제</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data.coupons,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowCanExpand: () => true,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.replace(`/coupon?${params.toString()}`, { scroll: false });
  };

  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center gap-2">
        <Button
          onClick={handleDownloadSelectedZip}
          variant="outline"
          className="gap-2"
          size="sm"
          disabled={downloadingZip || selectedCount === 0}
        >
          <Package className="h-4 w-4" />
          {downloadingZip 
            ? "압축 중..." 
            : selectedCount > 0 
              ? `CSV 다운로드 (${selectedCount}개)`
              : "CSV 다운로드"
          }
        </Button>
        
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2" size="sm">
          <Plus className="h-4 w-4" />
          쿠폰 추가
        </Button>
      </div>
      
      <Table ref={tableContainerRef}>
        <TableHeader className="z-20">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <TableRow 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => row.toggleExpanded()}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {row.getIsExpanded() && (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="bg-muted/30">
                      <CouponExpandedRow coupon={row.original} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <Empty description="데이터가 존재하지 않습니다." />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {data.coupons.length > 0 && (
        <div className="flex items-center justify-between py-2">
          <div className="text-sm text-muted-foreground">
            총 {data.metadata.totalCount.toLocaleString()}개 중 {page * 50 + 1}-
            {Math.min((page + 1) * 50, data.metadata.totalCount)}개 표시
            {selectedCount > 0 && (
              <span className="ml-4 font-medium">
                ({selectedCount}개 선택됨)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
            >
              이전
            </Button>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                onBlur={(e) => {
                  let newPage = parseInt(e.target.value) - 1;
                  if (isNaN(newPage) || newPage < 0) {
                    newPage = 0;
                    setInputPage("1");
                  } else if (newPage >= data.metadata.totalPages) {
                    newPage = data.metadata.totalPages - 1;
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
              onClick={() => handlePageChange(page + 1)}
              disabled={!data || page >= data.metadata.totalPages - 1}
            >
              다음
            </Button>
          </div>
        </div>
      )}

      <AddCouponDialog open={isAddDialogOpen} setOpen={setIsAddDialogOpen} />
      
      {selectedCoupon && (
        <EditCouponDialog
          open={isEditDialogOpen}
          setOpen={setIsEditDialogOpen}
          coupon={selectedCoupon}
        />
      )}

      <Dialog open={isCodesDialogOpen} onOpenChange={setIsCodesDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              쿠폰 코드 목록 - {selectedCoupon?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {loadingCodes ? (
              <div className="text-center py-4">로딩 중...</div>
            ) : couponCodes.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                {couponCodes.map((code, index) => (
                  <div
                    key={index}
                    className="p-2 bg-muted rounded text-sm font-mono text-center"
                  >
                    {code}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                생성된 코드가 없습니다.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
