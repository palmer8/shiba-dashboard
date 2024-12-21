import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="w-screen h-screen flex flex-col gap-4 items-center justify-center">
      <Image src="/logo.webp" alt="logo" width={240} height={240} />
      <h1 className="text-4xl font-bold">404 Not Found!</h1>
      <p className="text-md text-muted-foreground">
        페이지를 찾을 수 없습니다.
      </p>
      <Link href="/">
        <Button
          variant="outline"
          size="lg"
          className="animate-shine hover:animate-pulse-border"
        >
          <Home className="mr-2 h-4 w-4" />
          메인으로 돌아가기
        </Button>
      </Link>
    </div>
  );
}
