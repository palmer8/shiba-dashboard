// /app/api/items/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function POST(request: Request) {
  try {
    const jsonData: Record<string, any> = await request.json();

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

    // 데이터 변환: key를 itemId, value를 itemName으로 매핑
    const itemEntries = Object.entries(jsonData).map(([itemId, value]) => {
      // value가 객체인 경우 (isTradable 포함 가능)
      if (typeof value === 'object' && value !== null) {
        return {
          itemId,
          itemName: value.itemName,
          // isTradable 값이 있으면 사용, 없으면 true로 설정
          isTradable: value.isTradable !== undefined ? value.isTradable : true,
          updatedAt: new Date(),
        };
      }

      // value가 문자열인 경우 (기존 형식)
      return {
        itemId,
        itemName: value,
        isTradable: true, // 기본값은 true
        updatedAt: new Date(),
      };
    });

    // 배치 크기 제한 (최대 100개)
    if (itemEntries.length > 100) {
      return NextResponse.json(
        { error: "한 번에 최대 100개의 아이템만 처리할 수 있습니다." },
        { status: 400 }
      );
    }

    if (itemEntries.length === 0) {
      return NextResponse.json(
        { message: "처리할 아이템이 없습니다." },
        { status: 200 }
      );
    }

    // 트랜잭션으로 처리
    await prisma.$transaction(
      itemEntries.map((item) =>
        prisma.items.upsert({
          where: { itemId: item.itemId },
          update: {
            itemName: item.itemName,
            isTradable: item.isTradable,
            updatedAt: new Date(),
          },
          create: {
            itemId: item.itemId,
            itemName: item.itemName,
            isTradable: item.isTradable,
            updatedAt: new Date(),
          },
        })
      )
    );

    return NextResponse.json(
      { message: "아이템이 성공적으로 처리되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("아이템 처리 중 오류 발생:", error);
    return NextResponse.json({ error: "서버 오류입니다." }, { status: 500 });
  }
}
