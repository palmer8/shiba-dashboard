"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface UploadResult {
  row: number; // 1-based row index in CSV (excluding header)
  userId: number | null;
  title: string;
  status: "성공" | "실패";
  message?: string;
}

interface UploadResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: UploadResult[];
}

export default function UploadResultDialog({
  open,
  onOpenChange,
  results,
}: UploadResultDialogProps) {
  const successCount = results.filter((r) => r.status === "성공").length;
  const failureCount = results.filter((r) => r.status === "실패").length;
  const successRate = results.length > 0 ? Math.round((successCount / results.length) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] w-[95vw] sm:w-full">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-xl font-semibold">CSV 업로드 결과</DialogTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                성공: {successCount}개
              </Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <XCircle className="w-3 h-3 mr-1" />
                실패: {failureCount}개
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                성공률: {successRate}%
              </Badge>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              총 {results.length}개 항목 처리 완료
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] w-full">
          {/* 모바일용 카드 레이아웃 */}
          <div className="block sm:hidden space-y-3">
            {results.map((res) => (
              <div
                key={res.row}
                className={cn(
                  "p-4 rounded-lg border",
                  res.status === "실패" 
                    ? "bg-red-50 border-red-200" 
                    : "bg-green-50 border-green-200"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{res.row}
                    </span>
                    {res.status === "성공" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <Badge 
                      variant={res.status === "성공" ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {res.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div><span className="font-medium">유저 ID:</span> {res.userId ?? "-"}</div>
                  <div><span className="font-medium">제목:</span> {res.title}</div>
                  {res.message && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">메시지:</span> {res.message}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 데스크톱용 테이블 레이아웃 */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">No</TableHead>
                  <TableHead className="w-24">유저 ID</TableHead>
                  <TableHead className="min-w-[200px]">제목</TableHead>
                  <TableHead className="w-20">결과</TableHead>
                  <TableHead className="min-w-[250px]">메시지</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((res) => (
                  <TableRow 
                    key={res.row} 
                    className={cn(
                      "hover:bg-muted/50",
                    )}
                  >
                    <TableCell className="font-medium">{res.row}</TableCell>
                    <TableCell>{res.userId ?? "-"}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="max-w-[200px] truncate cursor-help">
                              {res.title}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs break-words">{res.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {res.status === "성공" ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <Badge 
                          variant={res.status === "성공" ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {res.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {res.message ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 cursor-help">
                                <AlertCircle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                                <span className="max-w-[250px] truncate text-sm">
                                  {res.message}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs break-words">{res.message}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
