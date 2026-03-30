import {
  FiGrid,
  FiUsers,
  FiUser,
  FiMusic,
  FiBook,
  FiBookOpen,
  FiHome,
  FiFileText,
  FiCalendar,
  FiBell,
  FiAward,
  FiLayers,
  FiGlobe,
  FiStar,      // 👈 for Premium Plans
  FiCrown,     // 👈 not in fi, use FiStar as fallback
  FiUserCheck, // 👈 for Premium Users
} from "react-icons/fi";

const Menu = [
  { heading: "Main Navigation" },
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: FiGrid,
    permissions: ["admin"],
  },
  {
    name: "God-Master",
    path: "/godmaster",
    icon: FiUsers,
    permissions: ["admin", "users"],
  },
    {
    name: "Chat",
    path: "/chats",
    icon: FiUsers,
    permissions: ["admin", "users"],
  },
  {
    name: "Image Url",
    path: "/imgurl",
    icon: FiFileText,
    permissions: ["admin", "users"],
  },
  {
    name: "Wallpaper",
    path: "/wallpaper",
    icon: FiFileText,
    permissions: ["admin", "users"],
  },
  {
    name: "God",
    path: "/god",
    icon: FiUser,
    permissions: ["admin", "users"],
  },
  {
    name: "Users",
    path: "/users",
    icon: FiUsers,
    permissions: ["admin", "users"],
  },
  {
    name: "Events",
    path: "/events",
    icon: FiCalendar,
    permissions: ["admin", "users"],
  },

  // ── PREMIUM ───────────────────────────────────
  { heading: "Premium" },
  {
    name: "Premium Plans",
    path: "/premium",
    icon: FiStar,
    permissions: ["admin"],
  },
  {
    name: "Premium Users",
    path: "/premium/users",
    icon: FiUserCheck,
    permissions: ["admin"],
  },
  {
    name: "Order",
    path: "/orders",
    icon: FiUserCheck,
    permissions: ["admin"],
  },
  {
    name: "Grant Premium",
    path: "/premium/grant",
    icon: FiAward,
    permissions: ["admin"],
  },

  // ── CONTENT ───────────────────────────────────
  { heading: "Content" },
  {
    name: "Daily Log",
    path: "/dailylog",
    icon: FiFileText,
    permissions: ["admin", "users"],
  },
  {
    name: "Posts",
    path: "/post",
    icon: FiFileText,
    permissions: ["admin", "users"],
  },
  {
    name: "Aarti",
    path: "/aarti",
    icon: FiMusic,
    permissions: ["admin", "users"],
  },
  {
    name: "Mantra",
    path: "/mantra",
    icon: FiBook,
    permissions: ["admin", "users"],
  },
  {
    name: "Bhajan",
    path: "/bhajan",
    icon: FiMusic,
    permissions: ["admin", "users"],
  },
  {
    name: "Sloka",
    path: "/sloka",
    icon: FiBookOpen,
    permissions: ["admin", "users"],
  },
  {
    name: "Stuti",
    path: "/stuti",
    icon: FiBookOpen,
    permissions: ["admin", "users"],
  },
  {
    name: "Articles",
    path: "/articles",
    icon: FiFileText,
    permissions: ["admin", "users"],
  },
  {
    name: "Story",
    path: "/story",
    icon: FiLayers,
    permissions: ["admin", "users"],
  },
  {
    name: "News",
    path: "/news",
    icon: FiGlobe,
    permissions: ["admin", "users"],
  },

  // ── OTHERS ────────────────────────────────────
  { heading: "Others" },
  {
    name: "Temple",
    path: "/temple",
    icon: FiHome,
    permissions: ["admin", "users"],
  },
  {
    name: "Festival",
    path: "/festival",
    icon: FiCalendar,
    permissions: ["admin", "users"],
  },
  {
    name: "Quiz",
    path: "/quiz",
    icon: FiAward,
    permissions: ["admin", "users"],
  },
  {
    name: "Ringtones",
    path: "/ringtones",
    icon: FiBell,
    permissions: ["admin", "users"],
  },
  {
    name: "Badges",
    path: "/badges",
    icon: FiAward,
    permissions: ["admin", "users"],
  },
  {
    name: "Notifications",
    path: "/sendNotification",
    icon: FiBell,
    permissions: ["admin"],
  },
];

export default Menu;