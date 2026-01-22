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
} from "react-icons/fi";

const Menu = [
  {
    heading: "Main Navigation",
  },
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
    name: "SendNotificationPage",
    path: "/sendNotification",
    icon: FiUsers,
    permissions: ["admin", "users"],
  },
  {
    name: "Dayly Log",
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
    name: "Temple",
    path: "/temple",
    icon: FiHome,
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
    name: "Festival",
    path: "/festival",
    icon: FiCalendar,
    permissions: ["admin", "users"],
  },
  {
    name: "Ringtones",
    path: "/ringtones",
    icon: FiBell,
    permissions: ["admin", "users"],
  },
  {
    name: "Quiz",
    path: "/quiz",
    icon: FiAward,
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
];

export default Menu;
