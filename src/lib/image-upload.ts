import { createImageUpload } from "novel/plugins";
import { toast } from "sonner";

const API_URL = process.env.FIVEMANAGE_API_URL + "/api/image";
const API_KEY = process.env.FIVEMANAGE_API_KEY;

const onUpload = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  formData.append(
    "metadata",
    JSON.stringify({
      name: file.name,
      description: "Uploaded from SHIBA Dashboard",
    })
  );

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: API_KEY || "",
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();

    return new Promise((resolve) => {
      const imageUrl = data.url;
      const image = new Image();
      image.src = imageUrl;
      image.onload = () => {
        resolve(imageUrl);
      };
    });
  } catch (error) {
    console.error("Image upload error:", error);
    toast.error("이미지 업로드에 실패했습니다.");
    throw error;
  }
};

export const uploadFn = createImageUpload({
  onUpload,
  validateFn: (file) => {
    if (!file.type.includes("image/")) {
      toast.error("이미지 파일만 업로드 가능합니다.");
      return false;
    }
    if (file.size / 1024 / 1024 > 20) {
      toast.error("파일 크기는 20MB를 초과할 수 없습니다.");
      return false;
    }
    return true;
  },
});
