"use client";

import { GameDataType } from "@/types/game";
import { CompanyTable } from "./tables/company-table";
import { InstagramTable } from "./tables/instagram-table";
import { DataTable } from "./tables/data-table";

interface GameDataTableProps {
  data: any;
  currentPage: number;
  totalPages: number;
  queryType: GameDataType;
}

export function GameDataTable({
  data,
  currentPage,
  totalPages,
  queryType,
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
        />
      );
    case "INSTAGRAM":
      return (
        <InstagramTable
          data={{
            records: data?.data || [],
            metadata,
          }}
        />
      );
    default:
      return (
        <DataTable
          queryType={queryType}
          data={{
            records: data?.data || [],
            metadata,
          }}
        />
      );
  }
}
