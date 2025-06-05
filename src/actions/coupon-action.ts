"use server";

import * as couponService from "@/service/coupon-service";
import { CouponCreateValues, CouponEditValues } from "@/lib/validations/coupon";
import { revalidatePath } from "next/cache";
import { CouponApiResponse } from "@/types/coupon";
import { CouponFilter } from "@/types/coupon";

// Date 객체를 MySQL datetime 형식으로 변환하는 함수
function formatDateForMySQL(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export async function createCouponAction(
  values: CouponCreateValues
): Promise<CouponApiResponse> {
  try {
    // Date 객체를 MySQL datetime 형식으로 변환
    const processedValues = {
      ...values,
      start_time: formatDateForMySQL(values.start_time),
      end_time: formatDateForMySQL(values.end_time),
    };
    
    const result = await couponService.createCoupon(processedValues as any);
    revalidatePath("/coupon");
    return { success: true, data: result };
  } catch (error) {
    console.error("Create coupon action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "쿠폰 생성에 실패했습니다.",
    };
  }
}

export async function updateCouponAction(
  id: number,
  values: CouponEditValues
): Promise<CouponApiResponse> {
  try {
    // Date 객체를 MySQL datetime 형식으로 변환
    const processedValues = {
      ...values,
      start_time: formatDateForMySQL(values.start_time),
      end_time: formatDateForMySQL(values.end_time),
    };
    
    const result = await couponService.updateCoupon(id, processedValues as any);
    revalidatePath("/coupon");
    return { success: true, data: result };
  } catch (error) {
    console.error("Update coupon action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "쿠폰 수정에 실패했습니다.",
    };
  }
}

export async function deleteCouponAction(id: number): Promise<CouponApiResponse> {
  try {
    await couponService.deleteCoupon(id);
    revalidatePath("/coupon");
    return { success: true };
  } catch (error) {
    console.error("Delete coupon action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "쿠폰 삭제에 실패했습니다.",
    };
  }
}

export async function getCouponCodesAction(
  couponId: number
): Promise<CouponApiResponse<string[]>> {
  try {
    const result = await couponService.getCouponCodes(couponId);
    return { success: true, data: result };
  } catch (error) {
    console.error("Get coupon codes action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "쿠폰 코드 조회에 실패했습니다.",
    };
  }
}

export async function downloadCouponListCSVAction(filter: CouponFilter) {
  try {
    const coupons = await couponService.getCouponListForCSV(filter);
    
    // 실제 DB 컬럼명을 사용한 CSV 헤더
    const headers = [
      "id",
      "name", 
      "type",
      "reward_items",
      "maxcount",
      "start_time",
      "end_time",
      "created_at",
      "total_codes",
      "used_codes"
    ];

    // 원본 데이터 구조 그대로 CSV 데이터 변환
    const csvData = coupons.map(coupon => [
      coupon.id,
      coupon.name,
      coupon.type, // 원본 DB 값 (general, public)
      coupon.reward_items, // 원본 JSON 문자열
      coupon.maxcount,
      coupon.start_time,
      coupon.end_time,
      coupon.created_at,
      coupon.total_codes,
      coupon.used_codes
    ]);

    // CSV 문자열 생성
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => 
        row.map(cell => 
          typeof cell === 'string' && cell.includes(',') 
            ? `"${cell.replace(/"/g, '""')}"` 
            : cell
        ).join(",")
      )
    ].join("\n");

    // BOM 추가 (한글 깨짐 방지)
    const csvWithBOM = "\uFEFF" + csvContent;

    return {
      success: true,
      data: csvWithBOM,
      filename: `쿠폰목록_${new Date().toISOString().slice(0, 10)}.csv`,
      error: null,
    };
  } catch (error) {
    console.error("Download coupon list CSV error:", error);
    return {
      success: false,
      data: null,
      filename: null,
      error: error instanceof Error ? error.message : "CSV 다운로드 중 오류가 발생했습니다.",
    };
  }
}

export async function downloadSelectedCouponsZipAction(couponIds: number[]) {
  try {
    if (couponIds.length === 0) {
      return {
        success: false,
        data: null,
        filename: null,
        error: "선택된 쿠폰이 없습니다.",
      };
    }

    // 쿠폰 데이터와 코드 데이터를 병렬로 가져오기
    const [coupons, couponCodesData] = await Promise.all([
      couponService.getSelectedCouponsForCSV(couponIds),
      couponService.getSelectedCouponCodesForCSV(couponIds),
    ]);

    const zipFiles: { name: string; content: string }[] = [];

    // 1. 쿠폰 정보 CSV 생성 - 실제 DB 컬럼명 사용
    const couponHeaders = [
      "id",
      "name", 
      "type",
      "reward_items",
      "maxcount",
      "start_time",
      "end_time",
      "created_at",
      "total_codes",
      "used_codes"
    ];

    // 원본 데이터 구조 그대로 사용
    const couponCsvData = coupons.map(coupon => [
      coupon.id,
      coupon.name,
      coupon.type, // 원본 DB 값 (general, public)
      coupon.reward_items, // 원본 JSON 문자열
      coupon.maxcount,
      coupon.start_time,
      coupon.end_time,
      coupon.created_at,
      coupon.total_codes,
      coupon.used_codes
    ]);

    const couponCsvContent = [
      couponHeaders.join(","),
      ...couponCsvData.map(row => 
        row.map(cell => 
          typeof cell === 'string' && cell.includes(',') 
            ? `"${cell.replace(/"/g, '""')}"` 
            : cell
        ).join(",")
      )
    ].join("\n");

    // BOM 추가 (한글 깨짐 방지)
    const couponCsvWithBOM = "\uFEFF" + couponCsvContent;
    zipFiles.push({
      name: "쿠폰목록.csv",
      content: couponCsvWithBOM
    });

    // 2. 각 쿠폰별 코드 CSV 생성 - 실제 DB 컬럼명 사용
    couponCodesData.forEach(({ couponId, couponName, codes }) => {
      if (codes.length > 0) {
        const codesHeaders = ["coupon_idx", "code"];
        const codesCsvContent = [
          codesHeaders.join(","),
          ...codes.map(codeData => [
            codeData.coupon_idx,
            `"${codeData.code}"`
          ].join(","))
        ].join("\n");
        
        const codesCsvWithBOM = "\uFEFF" + codesCsvContent;
        // 파일명에서 특수문자 제거
        const sanitizedCouponName = couponName.replace(/[<>:"/\\|?*]/g, '_');
        zipFiles.push({
          name: `쿠폰코드_${couponId}_${sanitizedCouponName}.csv`,
          content: codesCsvWithBOM
        });
      }
    });

    // ZIP 파일 정보 반환 (실제 ZIP 생성은 클라이언트에서)
    return {
      success: true,
      data: {
        files: zipFiles,
        totalCoupons: coupons.length,
        totalCodes: couponCodesData.reduce((sum, item) => sum + item.codes.length, 0)
      },
      filename: `쿠폰데이터_${new Date().toISOString().slice(0, 10)}.zip`,
      error: null,
    };
  } catch (error) {
    console.error("Download selected coupons zip error:", error);
    return {
      success: false,
      data: null,
      filename: null,
      error: error instanceof Error ? error.message : "ZIP 다운로드 중 오류가 발생했습니다.",
    };
  }
}