"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Menu } from "lucide-react";
import { NavLinks } from "./nav-links";
import { NavAdminLinks } from "./nav-admin-links";
import { NavUser } from "./nav-user";
import { getUserByIdAction } from "@/actions/user-action";
import { User, UserRole } from "@prisma/client";
import { hasAccess } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function MobileSheet() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<Omit<
    User,
    "hashedPassword" | "isPermissive"
  > | null>(null);

  useEffect(() => {
    const getUser = async () => {
      if (session?.user?.id) {
        const result = await getUserByIdAction(session.user.id);
        if (result.success) {
          setUser(result.data);
        }
      }
    };
    getUser();
  }, [session]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed right-4 top-4 z-40 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0">
        <SheetHeader className="p-4">
          <VisuallyHidden>
            <SheetTitle>어디로 이동하시겠어요?</SheetTitle>
          </VisuallyHidden>
          <div className="flex justify-center">
            <Image
              priority
              src="/logo.webp"
              alt="logo"
              width={100}
              height={100}
              className="h-[100px] w-[100px]"
            />
          </div>
        </SheetHeader>
        <div className="flex h-[calc(100vh-132px)] flex-col justify-between">
          <div className="no-scrollbar flex-1 overflow-y-auto px-2">
            <NavLinks session={session} />
            {user && hasAccess(user?.role, UserRole.MASTER) && (
              <NavAdminLinks session={session} />
            )}
          </div>
          <div className="border-t p-2">
            {session?.user && <NavUser session={session} />}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
