import { BoardCategory } from "@/types/board";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Link, ArrowLeft } from "lucide-react";
import { JSONContent } from "novel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MarkdownConverterDialog } from "@/components/dialog/markdown-converter-dialog";

interface CommonFormLayoutProps {
  children: React.ReactNode;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitText: string;
  backHref: string;
  title: string;
  setTitle: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories: BoardCategory[];
  isNotice?: boolean;
  onNoticeChange?: (checked: boolean) => void;
  showNoticeOption?: boolean;
  onMarkdownConvert: (content: JSONContent) => void;
}

export function CommonFormLayout({
  children,
  onBack,
  onSubmit,
  isSubmitting,
  submitText,
  backHref,
  title,
  setTitle,
  category,
  onCategoryChange,
  categories,
  isNotice,
  onNoticeChange,
  showNoticeOption,
  onMarkdownConvert,
}: CommonFormLayoutProps) {
  return (
    <div className="w-full h-full mx-auto max-w-[1200px]">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        {/* 모바일 헤더 */}
        <div className="block sm:hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <Link
              href={backHref}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>돌아가기</span>
            </Link>
            <Button onClick={onSubmit} disabled={isSubmitting} size="sm">
              {isSubmitting ? `${submitText} 중...` : submitText}
            </Button>
          </div>
          <div className="px-4 py-3 flex flex-col gap-3">
            <Input
              type="text"
              value={title}
              autoFocus
              minLength={5}
              maxLength={30}
              className="text-2xl"
              placeholder="제목을 입력해주세요"
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <Select value={category} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showNoticeOption && onNoticeChange && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isNotice-mobile"
                    checked={isNotice}
                    onCheckedChange={(checked) =>
                      onNoticeChange(checked as boolean)
                    }
                  />
                  <label
                    htmlFor="isNotice-mobile"
                    className="text-sm font-medium leading-none"
                  >
                    공지사항
                  </label>
                </div>
              )}
              <MarkdownConverterDialog onConvert={onMarkdownConvert} />
            </div>
          </div>
        </div>

        {/* 데스크톱 헤더 */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between p-4 h-16">
            <Link
              href={backHref}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>돌아가기</span>
            </Link>
            <div className="flex items-center gap-4">
              <Select value={category} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showNoticeOption && onNoticeChange && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isNotice"
                    checked={isNotice}
                    onCheckedChange={(checked) =>
                      onNoticeChange(checked as boolean)
                    }
                  />
                  <label
                    htmlFor="isNotice"
                    className="text-sm font-medium leading-none"
                  >
                    공지사항
                  </label>
                </div>
              )}
              <MarkdownConverterDialog onConvert={onMarkdownConvert} />
              <Button onClick={onSubmit} disabled={isSubmitting}>
                {isSubmitting ? `${submitText} 중...` : submitText}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 본문 영역 */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="hidden sm:block mb-4">
          <Input
            type="text"
            value={title}
            autoFocus
            minLength={5}
            maxLength={30}
            className="font-medium border-0 px-0 focus-visible:ring-0 text-2xl md:text-2xl"
            placeholder="제목을 입력해주세요"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        {children}
      </div>
    </div>
  );
}
