import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Menu } from "lucide-react";
export default function MobileSheet() {
  return (
    <Sheet>
      <SheetTrigger className="w-full bg-transparent fixed top-0 right-4 z-10 flex justify-end items-center h-12">
        <Menu />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>메뉴</SheetTitle>
          <SheetDescription>.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
