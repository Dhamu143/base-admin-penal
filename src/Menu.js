const Menu = [
  {
    heading: "Main Navigation",
    translate: "sidebar.heading.HEADER",
  },
  {
    name: "Dashboard",
    translate: "sidebar.nav.SUBMENU",
    path: "/dashboard",
    icon: "icon-grid",
    permissions: ["admin"]
  },
  {
    name: "Community Management",
    path: "/hub-management",
    icon: "icon-cup",
    permissions: ["admin", "community"],
    submenu: [
      {
        name: "Religion",
        path: "/religion",
      },
      {
        name: "Native Place(state)",
        path: "/native-place",
      },
      {
        name: "Mother Tounge(Language)",
        path: "/language",
      },
      {
        name: "Caste",
        path: "/caste",
      },
      {
        name: "Community Setup",
        path: "/community-setup",
        permissions: ["community"],
      },
      {
        name: "Community & Caste Requested",
        path: "/hub-requested",
      },
    ],
  },
  {
    name: "Users",
    translate: "sidebar.nav.SUBMENU",
    path: "/user",
    icon: "icon-people",
    permissions: ["admin", "users"]
  },
  {
    name: "Sanstha",
    translate: "sidebar.nav.SUBMENU",
    path: "/sanstha",
    icon: "icon-list",
    permissions: ["admin", "sanstha"]
  },
  {
    name: "Sponsors and Advertisements",
    translate: "sidebar.nav.SUBMENU",
    path: "/sponsor",
    icon: "icon-layers",
    permissions: ["admin", "sponsor"]
  },
    {
    name: "Posts",
    translate: "sidebar.nav.SUBMENU",
    path: "/post",
    icon: "icon-list",
    permissions: ["admin", "post"]
  },
   {
    name: "Social Project",
    path: "",
    icon: "icon-list",
    permissions: ["admin", "Social Project"],
    submenu: [
      {
        name: "Social project category",
        path: "/project-category",
      },
      {
        name: "Social project",
        path: "/social-project",
      },
    ],
  },
   {
    name: "Events",
    translate: "sidebar.nav.SUBMENU",
    path: "/event",
    icon: "icon-layers",
    permissions: ["admin", "Events"]
  },
  {
    name: "Fundraising (Donation)",
    path: "/fundraising",
    icon: "icon-cup",
    permissions: ["admin", "Fundraising (Donation)"],
    submenu: [
      {
        name: "Facility Booking",
        path: "/facility-booking",
      },
      {
        name: "Contribution",
        path: "/contribution",
      },
      {
        name: "Members Waiting for Approval",
        path: "/requsteduser",
      },
      {
        name: "Social Project Donation",
        path: "/socialproject-donation",
      },
        {
        name: "Boli Booking",
        path: "/boli-booking",
      },
    ],
  },
  {
    name: "Payment History",
    translate: "sidebar.nav.SUBMENU",
    path: "/payment-history",
    icon: "icon-cup",
    permissions: ["admin", "Payment History"]
  },
  {
    name: "Teams",
    translate: "sidebar.nav.SUBMENU",
    path: "/teams",
    icon: "icon-speedometer",
    permissions: ["admin", "teams"]
  },
  {
    name: "Payment Settings",
    translate: "sidebar.nav.SUBMENU",
    path: "/payment-settings",
    icon: "icon-layers",
    permissions: ["admin", "payment"]
  },
  {
    name: "Compliance Date",
    translate: "sidebar.nav.SUBMENU",
    path: "/compliance",
    icon: "icon-layers",
    permissions: ["admin", "compliance"]
  },
  {
    name: "Faq",
    translate: "sidebar.nav.SUBMENU",
    path: "/faq",
    icon: "icon-grid",
    permissions: ["admin", "faq"]
  },
  {
    name: "Support",
    translate: "sidebar.nav.SUBMENU",
    path: "/support",
    icon: "icon-cup",
    permissions: ["admin", "support"]
  },
  {
    name: "Announcement",
    translate: "sidebar.nav.SUBMENU",
    path: "/announcement",
    icon: "icon-people",
    permissions: ["admin", "announcement"]
  },
  // {
  //   name: "Payment Gateways",
  //   translate: "sidebar.nav.SUBMENU",
  //   path: "/payment",
  //   icon: "icon-grid",
  //   permissions: ["admin", "payment"]
  // },
  {
    name: "Plans & Offers",
    translate: "sidebar.nav.SUBMENU",
    path: "/offer",
    icon: "icon-speedometer",
    permissions: ["admin", "offer"]
  },
  // {   
  //   name: "Products",
  //   path: "/admin/products",
  //   icon: "icon-grid",
  //   translate: "sidebar.nav.SINGLEVIEW",
  //   submenu: [
  //     {
  //       name: "Categories",
  //       translate: "sidebar.nav.SUBMENU",
  //       path: "/admin/categories/1",
  //     },
  //     {
  //       name: "Sub Categories",
  //       translate: "sidebar.nav.SUBMENU",
  //       path: "/admin/subcategories",
  //     },
  //     {
  //       name: "Products",
  //       translate: "sidebar.nav.SUBMENU",
  //       path: "/admin/products/1",
  //     },
  //     {
  //       name: "Choices & Addons",
  //       translate: "sidebar.nav.SUBMENU",
  //       path: "/admin/option-group",
  //     },
  //   ],
  // },
  // {
  //   name: "Users",
  //   translate: "sidebar.nav.MENU",
  //   path: "/admin/users/1",
  //   icon: "icon-people",
  //   submenu: [
  //     {
  //       name: "Customer",
  //       translate: "sidebar.nav.SUBMENU",
  //       path: "/admin/users/1",
  //     },
  //     {
  //       name: "Kitchen Staff",
  //       translate: "sidebar.nav.SUBMENU",
  //       path: "/admin/restaurant-user/1",
  //     },
  //   ],
  // },
  // {
  //   name: "Orders",
  //   translate: "sidebar.nav.SUBMENU",
  //   path: "/admin/orders/1",
  //   icon: "icon-list",
  // },
  // {
  //   name: "Configurations",
  //   path: "/admin/configuration",
  //   icon: "icon-speedometer",
  //   translate: "sidebar.nav.MENU",
  //   submenu: [
  //     {
  //       name: "Coupons",
  //       translate: "sidebar.nav.MENU",
  //       path: "/admin/coupons",
  //     },
  //     {
  //       name: "Delivery Time Selector",
  //       translate: "sidebar.nav.MENU",
  //       path: "/admin/delivery-time-selector",
  //     },
  //     {
  //       name: "General Settings",
  //       translate: "sidebar.nav.SUBMENU",
  //       path: "/admin/general-settings",
  //     },
  //     {
  //       name: "Taxes",
  //       translate: "sidebar.nav.SUBMENU",
  //       path: "/admin/taxes",
  //     },
  //     {
  //       name: "Pickup Address",
  //       translate: "sidebar.nav.SUBMENU",
  //       path: "/admin/pickup",
  //     },
  //     {
  //       name: "Delivery Estimate",
  //       translate: "sidebar.nav.SUBMENU",
  //       path: "/admin/delivery_estimate/1",
  //     },
  //   ],
  // },
];

export default Menu;
