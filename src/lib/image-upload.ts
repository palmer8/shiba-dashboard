import { createImageUpload } from "novel/plugins";
import { toast } from "@/hooks/use-toast";

const API_URL = process.env.NEXT_PUBLIC_FIVEMANAGE_API_URL + "/api/image";
const API_KEY = process.env.NEXT_PUBLIC_FIVEMANAGE_API_KEY;

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
    console.log(error);
    console.error("Image upload error:", error);
    toast({
      title: "이미지 업로드에 실패했습니다.",
      description: "잠시 후에 다시 시도해주세요",
      variant: "destructive",
    });
    throw error;
  }
};

export const uploadFn = createImageUpload({
  onUpload,
  validateFn: (file) => {
    if (!file.type.includes("image/")) {
      return false;
    }
    if (file.size / 1024 / 1024 > 20) {
      return false;
    }
    return true;
  },
});
