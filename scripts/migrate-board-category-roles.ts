import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateBoardCategoryRoles() {
  try {
    // 모든 BoardCategory 레코드 조회
    const categories = await prisma.boardCategory.findMany({
      select: {
        id: true,
        role: true,
      },
    });

    console.log(`총 ${categories.length}개의 카테고리 마이그레이션 시작`);

    // 트랜잭션으로 일괄 처리
    await prisma.$transaction(async (tx) => {
      for (const category of categories) {
        if (category.role) {
          await tx.boardCategory.update({
            where: { id: category.id },
            data: {
              roles: [category.role], // 단일 role을 배열로 변환
            },
          });
        }
      }
    });

    console.log("마이그레이션 완료");
  } catch (error) {
    console.error("마이그레이션 실패:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 롤백 함수도 준비
async function rollbackBoardCategoryRoles() {
  try {
    const categories = await prisma.boardCategory.findMany({
      select: {
        id: true,
        roles: true,
      },
    });

    await prisma.$transaction(async (tx) => {
      for (const category of categories) {
        if (category.roles && category.roles.length > 0) {
          await tx.boardCategory.update({
            where: { id: category.id },
            data: {
              role: category.roles[0], // 배열의 첫 번째 값을 단일 값으로 저장
            },
          });
        }
      }
    });

    console.log("롤백 완료");
  } catch (error) {
    console.error("롤백 실패:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
migrateBoardCategoryRoles().catch(console.error);
