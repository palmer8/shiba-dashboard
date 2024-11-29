"use client";

import { RealtimeGameUserData } from "@/types/user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatKoreanDateTime,
  hasAccess,
  parseCustomDateString,
} from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";

interface RealtimeUserInfoProps {
  data: RealtimeGameUserData;
}

export default function RealtimeUserInfo({ data }: RealtimeUserInfoProps) {
  const { data: session } = useSession();
  const isAdmin = hasAccess(session?.user?.role, UserRole.INGAME_ADMIN);

  return (
    <>
      {/* 모바일 뷰 */}
      <div className="md:hidden text-sm">
        <Tabs defaultValue="basic">
          <TabsList className="w-full">
            <TabsTrigger value="basic" className="flex-1">
              기본 정보
            </TabsTrigger>
            <TabsTrigger value="game" className="flex-1">
              게임 정보
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex-1">
                관리자 정보
              </TabsTrigger>
            )}
            <TabsTrigger value="ban" className="flex-1">
              제재 정보
            </TabsTrigger>
          </TabsList>
          <TabsContent value="basic">
            <BasicInfo data={data} />
          </TabsContent>
          <TabsContent value="game">
            <GameInfo data={data} />
          </TabsContent>
          {isAdmin && (
            <TabsContent value="admin">
              <AdminInfo data={data} />
            </TabsContent>
          )}
          <TabsContent value="ban">
            <BanInfo data={data} />
          </TabsContent>
        </Tabs>
      </div>

      {/* 데스크톱 뷰 */}
      <div className="hidden md:grid gap-4">
        <div className="grid grid-cols-1 gap-4">
          <BasicInfo data={data} />
          <GameInfo data={data} />
        </div>
        <div className="grid grid-cols-1 gap-4">
          {isAdmin && <AdminInfo data={data} />}
          <BanInfo data={data} />
        </div>
      </div>
    </>
  );
}

function BasicInfo({ data }: { data: RealtimeGameUserData }) {
  const items = [
    { label: "닉네임", value: data.last_nickname },
    { label: "직업", value: data.job },
    { label: "계좌번호", value: data.phone },
    {
      label: "최종 접속",
      value: data.last_datetime
        ? formatKoreanDateTime(parseCustomDateString(data.last_datetime))
        : "-",
    },
    { label: "가입일", value: data.first_join },
    { label: "유저 메모", value: data?.chunoreason || "-" },
    { label: "차량 번호", value: data?.registration || "-" },
    {
      label: "접속 상태",
      value: data.online ? (
        <Badge variant="outline">온라인</Badge>
      ) : (
        <Badge variant="secondary">오프라인</Badge>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>기본 정보</CardTitle>
        <CardDescription>유저의 기본적인 계정 정보입니다.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="whitespace-nowrap">
              {items.map((item) => (
                <TableHead key={item.label}>{item.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="whitespace-nowrap">
              {items.map((item) => (
                <TableCell key={item.label}>
                  {item.value || "정보 없음"}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function GameInfo({ data }: { data: RealtimeGameUserData }) {
  const items = [
    {
      label: "현금",
      value: Number(data.wallet || 0).toLocaleString() + "원",
    },
    {
      label: "계좌",
      value: Number(data.bank || 0).toLocaleString() + "원",
    },
    {
      label: "마일리지",
      value: Number(data.current_coin || 0).toLocaleString() + "P",
    },
    {
      label: "골드 박스",
      value: Number(data.credit || 0).toLocaleString() + "개",
    },
    {
      label: "프리미엄 박스",
      value: Number(data.credit2 || 0).toLocaleString() + "개",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>게임 정보</CardTitle>
        <CardDescription>유저의 게임 내 자산 정보입니다.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {items.map((item) => (
                <TableHead key={item.label}>{item.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="whitespace-nowrap">
              {items.map((item) => (
                <TableCell key={item.label}>{item.value}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AdminInfo({ data }: { data: RealtimeGameUserData }) {
  const items = [
    {
      label: "보유 캐시",
      value: Number(data.current_cash || 0).toLocaleString() + "원",
    },
    {
      label: "누적 캐시",
      value: Number(data.cumulative_cash || 0).toLocaleString() + "원",
    },
    { label: "등급", value: data.tier_reward || "-" },
    { label: "최종 IP", value: data.last_ip || "-" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>관리자 정보</CardTitle>
        <CardDescription>관리자만 볼 수 있는 정보입니다.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {items.map((item) => (
                <TableHead key={item.label}>{item.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="whitespace-nowrap">
              {items.map((item) => (
                <TableCell key={item.label}>{item.value}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function BanInfo({ data }: { data: RealtimeGameUserData }) {
  const items = [
    { label: "처리자", value: data.banadmin || "-" },
    { label: "사유", value: data.banreason || "-" },
    {
      label: "제재 시간",
      value: data.bantime ? data.banadmin : "-",
    },
    {
      label: "상태",
      value: data.banned ? (
        <Badge variant="destructive">정지</Badge>
      ) : (
        <Badge variant="outline">정상</Badge>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>제재 정보</CardTitle>
        <CardDescription>계정의 제재 관련 정보입니다.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {items.map((item) => (
                <TableHead key={item.label}>{item.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="whitespace-nowrap">
              {items.map((item) => (
                <TableCell key={item.label}>{item.value}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
