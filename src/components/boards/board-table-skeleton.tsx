"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BoardTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* 상단 버튼 영역 스켈레톤 */}
      <div className="flex items-center justify-end">
        <Skeleton className="h-9 w-[70px]" />
      </div>

      {/* 공지사항 스켈레톤 */}
      <div className="space-y-2">
        {[...Array(2)].map((_, i) => (
          <Card key={`notice-${i}`} className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-5 w-12" /> {/* 공지 뱃지 */}
                  <Skeleton className="h-5 w-20" /> {/* 카테고리 뱃지 */}
                </div>
                <Skeleton className="h-6 w-3/4 mb-2" /> {/* 제목 */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" /> {/* 아바타 */}
                    <Skeleton className="h-4 w-20" /> {/* 닉네임 */}
                  </div>
                  <Skeleton className="h-4 w-24" /> {/* 날짜 */}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {[...Array(3)].map((_, j) => (
                  <Skeleton
                    key={j}
                    className="h-4 w-8"
                  /> /* 조회수/댓글/좋아요 */
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 일반 게시글 스켈레톤 */}
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <Card key={`post-${i}`} className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-5 w-20" /> {/* 카테고리 뱃지 */}
                  <Skeleton className="h-4 w-8" /> {/* 번호 */}
                </div>
                <Skeleton className="h-6 w-3/4 mb-2" /> {/* 제목 */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" /> {/* 아바타 */}
                    <Skeleton className="h-4 w-20" /> {/* 닉네임 */}
                  </div>
                  <Skeleton className="h-4 w-24" /> {/* 날짜 */}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {[...Array(3)].map((_, j) => (
                  <Skeleton
                    key={j}
                    className="h-4 w-8"
                  /> /* 조회수/댓글/좋아요 */
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 페이지네이션 스켈레톤 */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <Skeleton className="h-9 w-16" /> {/* 이전 버튼 */}
        <Skeleton className="h-9 w-20" /> {/* 페이지 정보 */}
        <Skeleton className="h-9 w-16" /> {/* 다음 버튼 */}
      </div>
    </div>
  );
}
