import { auth } from "@/lib/auth-config";
import { hasAccess } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { TebexRefreshButton } from "@/components/admin/tebex-refresh-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Shield } from "lucide-react";

export default async function SupermasterPage() {
  const session = await auth();

  // 권한 검증 - SUPERMASTER만 접근 가능
  if (!session?.user || !hasAccess(session.user.role, UserRole.SUPERMASTER)) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-3xl font-bold">슈퍼마스터 도구</h1>
          <p className="text-muted-foreground">
            시스템 관리 및 고급 도구 모음
          </p>
        </div>
      </div>

      <Tabs defaultValue="payment" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="payment">결제</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Tebex 관리
              </CardTitle>
              <CardDescription>
                Tebex 캐시 관리
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TebexRefreshButton />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}