"use client";

import { UploadCloud, X } from "lucide-react";
import { Button } from "./button";

interface ImageUploadProps {
  value?: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  onRemove?: () => void;
  isRemove?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  disabled,
  onUploadStart,
  onUploadEnd,
  onRemove = () => {},
  isRemove = true,
}: ImageUploadProps) {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      onUploadStart?.();

      const formData = new FormData();
      formData.append("files", file);

      // 내부 프록시 API 엔드포인트 사용
      const uploadUrl = "/api/upload";
      /*
      const uploadUrl = process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL;
      if (!uploadUrl) {
        console.error("Image upload URL is not configured.");
        throw new Error("Upload configuration error");
      }
      */

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown upload error" }));
        console.error("Upload failed:", response.status, errorData);
        throw new Error(
          errorData.error || `Upload failed with status ${response.status}`
        );
      }

      const data = await response.json();
      if (!data.url) {
        console.error("Upload response missing URL:", data);
        throw new Error("Invalid upload response");
      }
      onChange(data.url);
    } catch (error) {
      console.error("Upload error:", error);
      // 사용자에게 에러 표시 (예: toast 사용)
      // import { toast } from "@/hooks/use-toast";
      // toast({ title: "업로드 실패", description: error.message, variant: "destructive" });
    } finally {
      onUploadEnd?.();
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => document.getElementById("imageUploadInput")?.click()}
      >
        <UploadCloud className="h-4 w-4 mr-2" />
        이미지 업로드
      </Button>
      <input
        id="imageUploadInput"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        disabled={disabled}
      />
      {value && isRemove && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            onChange("");
            onRemove();
          }}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
