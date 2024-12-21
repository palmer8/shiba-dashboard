import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import Image from "next/image";
import { LogoutText } from "@/components/global/logout-text";

export default async function PendingPage() {
  const session = await auth();
  if (!session || !session.user) return redirect("/login");
  if (session.user && session.user.isPermissive) return redirect("/404");

  return (
    <div className="w-screen h-screen flex flex-col gap-8 items-center justify-center">
      <Image src="/logo.webp" alt="logo" width={320} height={320} />
      <div className="w-full max-w-md p-4 grid gap-2 place-items-center">
        <h1 className="text-2xl font-semibold">
          해당 계정은 활성화되지 않았습니다.
        </h1>
        <p className="text-center mb-4">
          관리자에게 문의하여 활성화 후 다시 로그인해주세요
        </p>
        <Button
          variant="default"
          size="lg"
          className="w-full animate-gradient text-white hover:scale-105 transition-transform"
        >
          <Mail className="mr-2 h-4 w-4" />
          관리자에게 문의하기
        </Button>
        <p className="text-destructive font-bold text-center text-sm mt-4">
          만약, 활성화 후에도 해당 페이지로 돌아온다면
          <br />
          <LogoutText>로그아웃</LogoutText> 후 다시 로그인해주세요
        </p>
      </div>
    </div>
  );
}
