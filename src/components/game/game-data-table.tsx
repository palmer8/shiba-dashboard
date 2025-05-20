"use client";

import { GameDataType } from "@/types/game";
import { CompanyTable } from "./tables/company-table";
import { InstagramTable } from "./tables/instagram-table";
import { DataTable } from "./tables/data-table";
import { Session } from "next-auth";
import { IpTable } from "./tables/ip-table";
import Empty from "@/components/ui/empty";
import { VehicleTable } from "./tables/vehicle-table";

interface GameDataTableProps {
  data: any;
  currentPage: number;
  totalPages: number;
  queryType: GameDataType;
  session: Session;
}

export function GameDataTable({
  data,
  currentPage,
  totalPages,
  queryType,
  session,
}: GameDataTableProps) {
  const metadata = {
    total: data?.total || 0,
    page: currentPage,
    totalPages: totalPages,
  };

  // 데이터가 아직 조회되지 않은 경우
  if (!data) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Empty description="검색 조건을 입력하고 조회해주세요." />
      </div>
    );
  }

  // 데이터가 조회되었지만 결과가 없는 경우
  if (data.total === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Empty description="검색 조건에 맞는 데이터가 없습니다." />
      </div>
    );
  }

  switch (queryType) {
    case "COMPANY":
      return (
        <CompanyTable
          data={{
            records: data?.data || [],
            metadata: {
              total: data?.total || 0,
              page: data?.currentPage || currentPage,
              totalPages: data?.totalPages || totalPages,
            },
          }}
          session={session}
        />
      );
    case "INSTAGRAM":
      return (
        <InstagramTable
          data={{
            records: data?.data || [],
            metadata: {
              total: data?.total || 0,
              page: data?.currentPage || currentPage,
              totalPages: data?.totalPages || totalPages,
            },
          }}
          session={session}
        />
      );
    case "IP":
      return (
        <IpTable
          data={{
            records: data?.data?.records || [],
            metadata: {
              total: data?.data?.metadata?.total || 0,
              page: data?.data?.metadata?.page || currentPage,
              totalPages: data?.data?.metadata?.totalPages || totalPages,
            },
          }}
          session={session}
        />
      );
    case "VEHICLE":
      return (
        <VehicleTable
          data={{
            records: data?.data || [],
            metadata: {
              total: data?.total || 0,
              page: data?.currentPage || currentPage,
              totalPages: data?.totalPages || totalPages,
            },
          }}
          session={session}
        />
      );
    default:
      return (
        <DataTable
          queryType={queryType}
          data={{
            records: data?.data || [],
            metadata: {
              total: data?.total || 0,
              page: data?.currentPage || currentPage,
              totalPages: data?.totalPages || totalPages,
            },
          }}
          session={session}
        />
      );
  }
}
