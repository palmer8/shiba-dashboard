import { createImageUpload } from "novel/plugins";
import { toast } from "@/hooks/use-toast";

const onUpload = async (file: File): Promise<string> => {
  try {
    if (!file.type.includes("image/")) {
      toast({
        title: "잘못된 파일 형식",
        description: "이미지 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      throw new Error("Invalid file type");
    }

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

    console.log(data); // 디버깅용 로그 제거 또는 주석 처리

    toast({ title: "이미지 업로드 완료" });
    return data.url;
  } catch (error) {
    console.error("Image upload error:", error);

    toast({
      title: "업로드 실패",
      description:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
      variant: "destructive",
    });
    throw error;
  }
};

export const uploadFn = createImageUpload({
  onUpload: onUpload,
  validateFn: (file) => {
    if (!file.type.includes("image/")) {
      toast({ title: "잘못된 파일 형식", variant: "destructive" });
      return false;
    }
    if (file.size / 1024 / 1024 > 20) {
      toast({
        title: "파일 크기 초과",
        description: "20MB 이하의 이미지만 선택 가능합니다.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  },
});
