"use client";

import { IncidentReport } from "@/types/report";
import { formatKoreanDateTime } from "@/lib/utils";
import Image from "next/image";

interface IncidentReportExpandedRowProps {
  incidentReport: IncidentReport;
}

export const IncidentReportExpandedRow: React.FC<
  IncidentReportExpandedRowProps
> = ({ incidentReport }) => {
  return (
    <div className="p-8 space-y-8 bg-muted/30 rounded-lg">
      {/* 보고서 헤더 */}
      <div className="flex justify-between items-start border-b border-border/50 pb-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">
            {incidentReport.reason || "정보 없음"}
          </h3>
          <p className="text-sm text-muted-foreground">
            발생 일자: {formatKoreanDateTime(incidentReport.incident_time)}
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>
            처리자:{" "}
            <span className="text-foreground font-medium">
              {incidentReport.admin || "정보 없음"}
            </span>
          </p>
        </div>
      </div>

      {/* 보고서 본문 */}
      <div className="grid gap-8">
        {/* 처거 자료 섹션 - 상단으로 이동 */}
        <div className="p-4 bg-background/50 rounded-lg">
          <h4 className="text-sm font-semibold mb-3">증거 자료</h4>
          {incidentReport.image ? (
            <div className="relative h-[400px] w-full">
              <Image
                src={incidentReport.image}
                alt="증거 사진"
                fill
                className="object-contain rounded-md"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">첨부된 이미지 없음</p>
          )}
        </div>

        {/* 처벌 정보 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-background/50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              처벌 유형
            </h4>
            <p className="font-medium">
              {incidentReport.penalty_type || "정보 없음"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              경고 횟수
            </h4>
            <p className="font-medium">
              {incidentReport.warning_count
                ? `${incidentReport.warning_count}회`
                : "정보 없음"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              정지 기간
            </h4>
            <p className="font-medium">
              {incidentReport.ban_duration_hours === -1
                ? "영구 정지"
                : incidentReport.ban_duration_hours
                ? `${incidentReport.ban_duration_hours}시간`
                : "정보 없음"}
            </p>
          </div>
          {incidentReport.detention_time_minutes ? (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                구금 시간
              </h4>
              <p className="font-medium">
                {`${incidentReport.detention_time_minutes}분`}
              </p>
            </div>
          ) : null}
        </div>

        {/* 관련자 정보 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="w-full p-4 bg-background/80 rounded-lg">
            <h4 className="text-sm font-semibold mb-3">대상자 정보</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">고유번호</span>
                <span className="font-medium">
                  {incidentReport.target_user_id || "정보 없음"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">닉네임</span>
                <span className="font-medium">
                  {incidentReport.target_user_nickname || "정보 없음"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-background/50 rounded-lg">
            <h4 className="text-sm font-semibold mb-3">신고자 정보</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">고유번호</span>
                <span className="font-medium">
                  {incidentReport.reporting_user_id || "정보 없음"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">닉네임</span>
                <span className="font-medium">
                  {incidentReport.reporting_user_nickname || "정보 없음"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 상세 내용 섹션 */}
        <div className="p-4 bg-background/50 rounded-lg">
          <h4 className="text-sm font-semibold mb-3">상세 내용</h4>
          <div className="text-sm whitespace-pre-wrap leading-relaxed">
            {incidentReport.incident_description || "정보 없음"}
          </div>
        </div>
      </div>
    </div>
  );
};
