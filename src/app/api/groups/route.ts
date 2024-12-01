// /app/api/groups/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function POST(request: Request) {
  try {
    const jsonData: Record<string, string> = await request.json();

    // 데이터가 객체인지 확인 (배열이나 null이 아닌지)
    if (
      typeof jsonData !== "object" ||
      Array.isArray(jsonData) ||
      jsonData === null
    ) {
      return NextResponse.json(
        { error: "유효하지 않은 데이터 형식입니다." },
        { status: 400 }
      );
    }

    const groupEntries = Object.entries(jsonData).map(
      ([groupId, groupName]) => ({
        groupId,
        groupBoolean: Boolean(groupName),
        updatedAt: new Date(), // 업데이트 시간 추가 (옵션)
      })
    );

    // 배치 크기 제한 (최대 100개)
    if (groupEntries.length > 100) {
      return NextResponse.json(
        { error: "한 번에 최대 100개의 그룹만 처리할 수 있습니다." },
        { status: 400 }
      );
    }

    if (groupEntries.length === 0) {
      return NextResponse.json(
        { message: "처리할 그룹이 없습니다." },
        { status: 200 }
      );
    }

    // Prisma를 사용한 배치 upsert 수행
    await prisma.groups.createMany({
      data: groupEntries.map((group) => ({
        groupId: group.groupId,
        groupBoolean: Boolean(group.groupBoolean),
        updatedAt: group.updatedAt,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json(
      { message: "그룹이 성공적으로 처리되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("그룹 처리 중 오류 발생:", error);
    return NextResponse.json(
      { error: "내부 서버 오류입니다." },
      { status: 500 }
    );
  }
}
