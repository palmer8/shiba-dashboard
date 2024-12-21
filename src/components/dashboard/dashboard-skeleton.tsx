"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* 상단 통계 카드 섹션 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mt-2" />
              {i === 1 && (
                <div className="mt-2">
                  <Skeleton className="h-4 w-48" />
                </div>
              )}
              {i === 2 && (
                <div className="mt-2">
                  <Skeleton className="h-4 w-32" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 게시판 섹션 */}
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="h-[500px] flex flex-col">
            <CardHeader className="flex-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {[...Array(6)].map((_, j) => (
                <div
                  key={j}
                  className="flex items-center justify-between py-3 group"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    {i === 1 && (
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-6" />
                        <Skeleton className="h-4 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
