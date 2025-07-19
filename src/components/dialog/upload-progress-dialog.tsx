"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadProgressDialogProps {
  open: boolean;
  progress: number; // 0 - 100
  totalItems?: number;
  processedItems?: number;
  currentStatus?: string;
  onCancel?: () => void;
}

export default function UploadProgressDialog({ 
  open, 
  progress, 
  totalItems, 
  processedItems, 
  currentStatus = "처리 중...",
  onCancel 
}: UploadProgressDialogProps) {
  const isIndeterminate = progress < 0;
  const displayProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="p-3 bg-blue-100 rounded-full">
              {isIndeterminate ? (
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-blue-600" />
              )}
            </div>
          </div>
          <DialogTitle className="text-lg font-semibold">CSV 업로드 진행 중</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {currentStatus}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 진행률 바 */}
          <div className="space-y-2">
            <Progress 
              value={isIndeterminate ? undefined : displayProgress} 
              className="w-full h-2" 
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {isIndeterminate ? "처리 중..." : `${displayProgress}%`}
              </span>
              {totalItems && (
                <span>
                  {processedItems || 0} / {totalItems} 항목
                </span>
              )}
            </div>
          </div>
          
          {/* 상세 정보 */}
          {totalItems && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                총 <span className="font-medium text-foreground">{totalItems}개</span> 항목을 처리하고 있습니다.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                잠시만 기다려주세요...
              </p>
            </div>
          )}
          
          {/* 취소 버튼 (옵션) */}
          {onCancel && (
            <div className="flex justify-center pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onCancel}
                className="text-xs"
              >
                취소
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
