"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { TOTAL_LINKS } from "@/constant/constant";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

interface BreadcrumbPath {
  name: string;
  isLast: boolean;
}

export function PageBreadcrumb() {
  const pathname = usePathname();
  const normalizedPath = pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;

  const findBreadcrumbPath = (path: string): BreadcrumbPath[] => {
    const breadcrumbs: BreadcrumbPath[] = [];

    // TOTAL_LINKS에서 현재 경로와 일치하는 route 찾기
    for (const [key, item] of Object.entries(TOTAL_LINKS)) {
      // 메인 메뉴 이름 추가
      if (path.includes(key)) {
        breadcrumbs.push({
          name: item.name,
          isLast: false,
        });
      }

      // 하위 route 찾기
      const matchedRoute = item.routes.find((route) => route.href === path);
      if (matchedRoute) {
        breadcrumbs.push({
          name: matchedRoute.name,
          isLast: true,
        });
        break;
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = findBreadcrumbPath(normalizedPath);

  if (breadcrumbs.length === 0) return null;

  return (
    <Breadcrumb className={cn("mb-4 md:mb-6")}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>홈</BreadcrumbPage>
        </BreadcrumbItem>
        {breadcrumbs.map((breadcrumb, index) => (
          <Fragment key={index}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {breadcrumb.isLast ? (
                <BreadcrumbPage>{breadcrumb.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbPage>{breadcrumb.name}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
