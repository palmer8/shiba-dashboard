import { JSONContent } from "novel";

export const ROLE_OPTIONS = [
  { label: "스태프", value: "STAFF" },
  { label: "인게임 관리자", value: "INGAME_ADMIN" },
  { label: "마스터", value: "MASTER" },
];

const ROLE_LINKS = {
  dashboard: {
    name: "메인",
    role: ["MASTER", "SUPERMASTER", "STAFF", "INGAME_ADMIN"],
    routes: [
      {
        name: "대시보드",
        href: "/",
        role: ["INGAME_ADMIN", "MASTER", "STAFF", "SUPERMASTER"],
      },
      {
        name: "게시판",
        href: "/boards",
        role: ["INGAME_ADMIN", "MASTER", "STAFF", "SUPERMASTER"],
      },
    ],
  },
  realtime: {
    name: "실시간 조회",
    role: ["INGAME_ADMIN", "MASTER", "STAFF", "SUPERMASTER"],
    routes: [
      {
        name: "유저 조회",
        href: "/realtime/user",
        role: ["INGAME_ADMIN", "MASTER", "STAFF", "SUPERMASTER"],
      },
      {
        name: "그룹 조회",
        href: "/realtime/group",
        role: ["INGAME_ADMIN", "MASTER", "STAFF", "SUPERMASTER"],
      },
    ],
  },
  logs: {
    name: "로그",
    role: ["INGAME_ADMIN", "MASTER", "STAFF", "SUPERMASTER"],
    routes: [
      {
        name: "유저 로그 조회",
        href: "/log/user",
        role: ["INGAME_ADMIN", "MASTER", "STAFF", "SUPERMASTER"],
      },
      {
        name: "게임 데이터 조회",
        href: "/log/game",
        role: ["INGAME_ADMIN", "MASTER", "SUPERMASTER", "STAFF"],
      },
      {
        name: "스태프 로그 조회",
        href: "/log/staff",
        role: ["INGAME_ADMIN", "MASTER", "SUPERMASTER", "STAFF"],
      },
      {
        name: "레시피 로그 조회",
        href: "/log/recipe",
        role: ["INGAME_ADMIN", "MASTER", "SUPERMASTER", "STAFF"],
      },
    ],
  },
  game: {
    name: "게임 관리",
    role: ["INGAME_ADMIN", "MASTER", "STAFF", "SUPERMASTER"],
    routes: [
      {
        name: "이모지 관리",
        href: "/game/emoji",
        role: ["INGAME_ADMIN", "MASTER", "SUPERMASTER", "STAFF"],
      },
      {
        name: "재화 지급/회수",
        href: "/game/credit",
        role: ["STAFF", "INGAME_ADMIN", "MASTER", "SUPERMASTER"],
      },
      {
        name: "아이템 지급/회수",
        href: "/game/item",
        role: ["INGAME_ADMIN", "MASTER", "STAFF", "SUPERMASTER"],
      },
      {
        name: "개인 우편",
        href: "/game/mail",
        role: ["MASTER", "SUPERMASTER"],
      },
      {
        name: "단체 우편",
        href: "/game/group-mail",
        role: ["MASTER", "SUPERMASTER"],
      },
    ],
  },
  payment: {
    name: "결제 관리",
    role: ["SUPERMASTER"],
    routes: [
      {
        name: "결제 조회",
        href: "/payment",
        role: ["SUPERMASTER"],
      },
    ],
  },
  coupon: {
    name: "쿠폰 관리",
    role: ["INGAME_ADMIN", "MASTER", "STAFF", "SUPERMASTER"],
    routes: [
      {
        name: "쿠폰 발급",
        href: "/coupon",
        role: ["SUPERMASTER"],
      },
      {
        name: "쿠폰 사용 조회",
        href: "/coupon/log",
        role: ["INGAME_ADMIN", "MASTER", "STAFF", "SUPERMASTER"],
      },
    ],
  },
  block: {
    name: "제재 관리",
    role: ["STAFF", "INGAME_ADMIN", "MASTER", "SUPERMASTER"],
    routes: [
      {
        name: "사건처리 보고서",
        href: "/block/report",
        role: ["STAFF", "INGAME_ADMIN", "MASTER", "SUPERMASTER"],
      },
      {
        name: "IP 관리",
        href: "/block/ip",
        role: ["STAFF", "INGAME_ADMIN", "MASTER", "SUPERMASTER"],
      },
      {
        name: "사건처리 보고 승인",
        href: "/admin/report",
        role: ["INGAME_ADMIN", "MASTER", "SUPERMASTER"],
      },
    ],
  },
};

export const ADMIN_LINKS = {
  audit: {
    name: "감사 로그",
    role: ["MASTER", "SUPERMASTER", "INGAME_ADMIN"],
    routes: [
      {
        name: "어드민 관리",
        href: "/admin",
        role: ["MASTER", "SUPERMASTER", "INGAME_ADMIN"],
      },
      {
        name: "운영툴 조회 로그",
        href: "/admin/log",
        role: ["MASTER", "SUPERMASTER"],
      },
      {
        name: "카테고리 관리",
        href: "/admin/category",
        role: ["MASTER", "SUPERMASTER"],
      },
      {
        name: "근태 관리",
        href: "/admin/attendance",
        role: ["MASTER", "SUPERMASTER"],
      },
      {
        name: "그룹 관리",
        href: "/admin/group",
        role: ["SUPERMASTER"],
      },
    ],
  },
};

export const TOTAL_LINKS = {
  ...ROLE_LINKS,
  ...ADMIN_LINKS,
};

const PENALTY_TYPE = {
  WARNING: "경고",
  GAME_BAN: "게임정지",
  VERBAL_WARNING: "구두경고",
  UNBAN: "정지해제",
};

const WHITELIST_STATUS = {
  0: "화이트리스트",
  1: "블랙리스트",
  2: "모니터링",
};

const reasonOptions = [
  "부적절한 언어 사용",
  "NON-RP",
  "배드 RP",
  "행동 NON-RP",
  "RP중 디컨",
  "시스템 악용",
  "알피법률 미숙지",
  "서버법률 미숙지",
  "서버 내 분쟁",
  "이유 없는 살인",
  "현금 거래",
];

export const DEFAULT_EDITOR_CONTENT: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [],
    },
  ],
};

export const GAME_DATA_TYPE = {
  ITEM: "아이템",
  CREDIT: "크레딧",
  CREDIT2: "크레딧2",
  WALLET: "현금",
  BANK: "계좌",
  MILEAGE: "마일리지",
  REGISTRATION: "차량번호",
  CURRENT_CASH: "보유 캐시",
  ACCUMULATED_CASH: "누적 캐시",
};

export const FIVEMANAGE_API_URL =
  process.env.NEXT_PUBLIC_FIVEMANAGE_API_URL + "/api/image";
export const FIVEMANAGE_API_KEY = process.env.NEXT_PUBLIC_FIVEMANAGE_API_KEY;
export { ROLE_LINKS, PENALTY_TYPE, reasonOptions, WHITELIST_STATUS };
