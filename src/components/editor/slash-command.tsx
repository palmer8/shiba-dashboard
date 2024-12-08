import {
  CheckSquare,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  List,
  ListOrdered,
  MessageSquarePlus,
  Text,
  TextQuote,
} from "lucide-react";
import { createSuggestionItems } from "novel/extensions";
import { Command, renderItems } from "novel/extensions";
import { uploadFn } from "../../lib/image-upload";

export const suggestionItems = createSuggestionItems([
  {
    title: "텍스트",
    description: "일반 텍스트를 입력합니다.",
    searchTerms: ["p", "paragraph", "텍스트", "문단"],
    icon: <Text size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
  },
  {
    title: "할 일 목록",
    description: "체크박스가 있는 할 일 목록을 만듭니다.",
    searchTerms: ["todo", "task", "list", "check", "checkbox", "할일", "체크"],
    icon: <CheckSquare size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "제목 1",
    description: "큰 제목을 추가합니다.",
    searchTerms: ["title", "big", "large", "제목", "큰제목"],
    icon: <Heading1 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "제목 2",
    description: "중간 크기의 제목을 추가합니다.",
    searchTerms: ["subtitle", "medium", "제목", "중간제목"],
    icon: <Heading2 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "제목 3",
    description: "작은 제목을 추가합니다.",
    searchTerms: ["subtitle", "small", "제목", "작은제목"],
    icon: <Heading3 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "글머리 기호",
    description: "글머리 기호가 있는 목록을 만듭니다.",
    searchTerms: ["unordered", "point", "bullet", "목록", "기호"],
    icon: <List size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "번호 목록",
    description: "번호가 매겨진 목록을 만듭니다.",
    searchTerms: ["ordered", "number", "번호", "목록"],
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "인용구",
    description: "인용문을 추가합니다.",
    searchTerms: ["blockquote", "quote", "인용", "인용구"],
    icon: <TextQuote size={18} />,
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .toggleBlockquote()
        .run(),
  },
  {
    title: "코드",
    description: "코드 블록을 추가합니다.",
    searchTerms: ["codeblock", "code", "코드"],
    icon: <Code size={18} />,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "이미지",
    description: "컴퓨터에서 이미지를 업로드합니다.",
    searchTerms: ["photo", "picture", "media", "이미지", "사진"],
    icon: <ImageIcon size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      // upload image
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        if (input.files?.length) {
          const file = input.files[0];
          const pos = editor.view.state.selection.from;
          uploadFn(file, editor.view, pos);
        }
      };
      input.click();
    },
  },
]);

export const slashCommand = Command.configure({
  suggestion: {
    items: () => suggestionItems,
    render: renderItems,
  },
});
