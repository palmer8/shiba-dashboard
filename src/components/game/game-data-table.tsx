"use client";

import { GameDataType } from "@/types/game";
import { CompanyTable } from "./tables/company-table";
import { InstagramTable } from "./tables/instagram-table";
import { DataTable } from "./tables/data-table";
import { Session } from "next-auth";
import { IpTable } from "./tables/ip-table";

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

  switch (queryType) {
    case "COMPANY":
      return (
        <CompanyTable
          data={{
            records: data?.data || [],
            metadata,
          }}
          session={session}
        />
      );
    case "INSTAGRAM":
      return (
        <InstagramTable
          data={{
            records: data?.data || [],
            metadata,
          }}
          session={session}
        />
      );
    case "IP":
      return <IpTable data={data.data} session={session} />;
    default:
      return (
        <DataTable
          queryType={queryType}
          data={{
            records: data?.data || [],
            metadata,
          }}
          session={session}
        />
      );
  }
}
