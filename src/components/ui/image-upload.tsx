"use client";

import { UploadCloud } from "lucide-react";
import { Button } from "./button";
import { FIVEMANAGE_API_KEY, FIVEMANAGE_API_URL } from "@/constant/constant";

interface ImageUploadProps {
  value?: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
}

export function ImageUpload({
  value,
  onChange,
  disabled,
  onUploadStart,
  onUploadEnd,
}: ImageUploadProps) {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      onUploadStart?.();

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(FIVEMANAGE_API_URL, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: FIVEMANAGE_API_KEY || "",
        },
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      onChange(data.url);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      onUploadEnd?.();
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => document.getElementById("imageUpload")?.click()}
      >
        <UploadCloud className="h-4 w-4 mr-2" />
        이미지 업로드
      </Button>
      <input
        id="imageUpload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        disabled={disabled}
      />
    </div>
  );
}
