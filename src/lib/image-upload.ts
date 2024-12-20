import imageCompression from "browser-image-compression";
import { createImageUpload } from "novel/plugins";
import { toast } from "@/hooks/use-toast";
import { FIVEMANAGE_API_URL, FIVEMANAGE_API_KEY } from "@/constant/constant";

const API_URL = FIVEMANAGE_API_URL;
const API_KEY = FIVEMANAGE_API_KEY;

const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 20,
    maxWidthOrHeight: 3840,
    useWebWorker: true,
    initialQuality: 0.6,
  };

  try {
    const compressedFile = await imageCompression(file, options);

    // 압축 후에도 20MB 초과시
    if (compressedFile.size > 20 * 1024 * 1024) {
      toast({
        title: "이미지 용량 초과",
        description:
          "20MB 이하로 압축이 불가능합니다. 다른 이미지를 사용해주세요.",
        variant: "destructive",
      });
      throw new Error("Image too large even after compression");
    }

    const savedSize = ((file.size - compressedFile.size) / 1024 / 1024).toFixed(
      1
    );
    toast({
      title: "이미지 최적화 완료",
      description: `약 ${savedSize}MB 용량이 감소되었습니다.`,
    });

    return compressedFile;
  } catch (error) {
    console.error("이미지 압축 실패:", error);
    toast({
      title: "이미지 최적화 실패",
      description: "이미지 처리 중 오류가 발생했습니다.",
      variant: "destructive",
    });
    throw error;
  }
};

const onUpload = async (file: File) => {
  try {
    if (!file.type.includes("image/")) {
      toast({
        title: "잘못된 파일 형식",
        description: "이미지 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      throw new Error("Invalid file type");
    }

    // 압축 시도
    const compressedFile = await compressImage(file);

    const formData = new FormData();
    formData.append("file", compressedFile);
    formData.append(
      "metadata",
      JSON.stringify({
        name: file.name,
        description: "Uploaded from SHIBA Dashboard",
      })
    );

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: API_KEY || "",
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();

    return new Promise((resolve) => {
      const imageUrl = data.url;
      const image = new Image();
      image.src = imageUrl;

      image.onload = () => {
        toast({
          title: "이미지 업로드 완료",
          description: "이미지가 성공적으로 업로드되었습니다.",
        });
        resolve(imageUrl);
      };

      image.onerror = () => {
        toast({
          title: "이미지 로드 실패",
          description: "업로드된 이미지를 불러올 수 없습니다.",
          variant: "destructive",
        });
        throw new Error("Image load failed");
      };
    });
  } catch (error) {
    console.error("Image upload error:", error);

    // 에러 종류별 다른 메시지 표시
    if (error instanceof Error && error.message.includes("too large")) {
      toast({
        title: "용량 초과",
        description: "20MB 이하의 이미지만 업로드 가능합니다.",
        variant: "destructive",
      });
    } else if (
      error instanceof Error &&
      error.message.includes("Invalid file type")
    ) {
      // 이미 위에서 처리됨
    } else if (error instanceof Error && error.message.includes("Network")) {
      toast({
        title: "네트워크 오류",
        description: "서버와의 연결이 원활하지 않습니다.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "업로드 실패",
        description: "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
    throw error;
  }
};

export const uploadFn = createImageUpload({
  onUpload,
  validateFn: (file) => {
    if (!file.type.includes("image/")) {
      return false;
    }
    // 초기 검사는 50MB로 여유있게 설정 (압축 가능성 고려)
    if (file.size / 1024 / 1024 > 50) {
      toast({
        title: "파일 크기 초과",
        description: "50MB 이하의 이미지만 선택 가능합니다.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  },
});
