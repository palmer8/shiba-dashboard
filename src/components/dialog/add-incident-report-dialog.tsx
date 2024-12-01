"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AddIncidentReportData } from "@/types/report";

export default function AddIncidentReportDialog() {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<AddIncidentReportData>();

  const onSubmit = async (data: AddIncidentReportData) => {
    // TODO: API 연동
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>보고서 작성</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>사건 처리 보고서 등록</DialogTitle>
          <DialogDescription>사건 처리 보고서를 작성합니다.</DialogDescription>
        </DialogHeader>
        {/* TODO: 폼 구현 */}
      </DialogContent>
    </Dialog>
  );
}
