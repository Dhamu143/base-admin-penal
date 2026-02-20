// import { memo, useEffect } from "react";
// import { Badge } from "react-bootstrap";
// import { useDispatch, useSelector } from "react-redux";
// import { Link, useLocation } from "react-router-dom";
// import Menu from "../../Menu.js";
// import { setCollapse } from "../../store/sidebar";

// function Sidebar() {
//   let location = useLocation();
//   const dispatch = useDispatch();
//   const collapse = useSelector((state) => state?.sidebarReducer?.collapse);

//   useEffect(() => {
//     dispatch(setCollapse({}));
//     let newcollapse = JSON.parse(JSON.stringify(collapse));
//     Menu.filter(({ heading }) => !heading).forEach(
//       ({ name, path, submenu }) => {
//         newcollapse[name] = routeActive(
//           submenu ? submenu.map(({ path }) => path) : path
//         );
//       }
//     );
//     dispatch(setCollapse(newcollapse));
//   }, []);

//   /** Component to display headings on sidebar */
//   const SidebarItemHeader = ({ item }) => {
//     return (
//       <li className="nav-heading">
//         <span>{item.heading}</span>
//       </li>
//     );
//   };

//   const SidebarItem = ({ item, isActive }) => {
//     return (
//       <li className={isActive ? "active" : ""}>
//         <Link to={item.path} title={item.name}>
//           {item.label && (
//             <Badge tag="div" className="float-right" color={item.label.color}>
//               {item.label.value}
//             </Badge>
//           )}
//           {item.icon && <item.icon className="mr-3" size={18} />}
//           <span className="align-middle">{item.name}</span>
//         </Link>
//       </li>
//     );
//   };

//   /** Build a sub menu with items inside and attach collapse behavior */
//   const SidebarSubItem = ({ item, isActive, handler, children, isOpen }) => {
//     return (
//       <li className={isActive ? "active" : ""}>
//         <div className="nav-item" onClick={handler}>
//           {item.label && (
//             <Badge tag="div" className="float-right" color={item.label.color}>
//               {item.label.value}
//             </Badge>
//           )}
//           {item.icon && <item.icon className="me-2" />}
//           <span>{item.name}</span>
//         </div>

//         {/* collapse submenu logic stays same */}
//       </li>
//     );
//   };

//   /** Component used to display a header on menu when using collapsed/hover mode */
//   const SidebarSubHeader = ({ item }) => {
//     return <li className="sidebar-subnav-header">{item.name}</li>;
//   };

//   /** map menu config to string to determine which element to render */
//   const itemType = (item) => {
//     if (item.heading) return "heading";
//     if (!item.submenu) return "menu";
//     if (item.submenu) return "submenu";
//   };

//   const routeActive = (paths) => {
//     paths = Array.isArray(paths) ? paths : [paths];
//     return paths.some((p) => location.pathname === p);
//   };

//   const toggleItemCollapse = (stateName) => {
//     let newcollapse = JSON.parse(JSON.stringify(collapse));

//     for (let c in newcollapse) {
//       if (newcollapse[c] === true && c !== stateName) {
//         newcollapse[c] = false;
//       }
//     }

//     newcollapse[stateName] = !newcollapse[stateName];
//     dispatch(setCollapse(newcollapse));
//   };

//   const getSubRoutes = (item) => item.submenu.map(({ path }) => path);

//   return (
//     <>
//       <aside className="aside-container">
//         <div className="aside-inner">
//           <nav data-sidebar-anyclick-close="" className="sidebar">
//             <ul className="sidebar-nav">
//               <li className="has-user-block">
//                 {/* <SidebarUserBlock />{" "} */}
//               </li>

//               {Menu.map((item, i) => {
//                 if (itemType(item) === "heading")
//                   return <SidebarItemHeader item={item} key={i} />;
//                 else {
//                   if (itemType(item) === "menu")
//                     return (
//                       <SidebarItem
//                         isActive={routeActive(item.path)}
//                         item={item}
//                         key={i}
//                       />
//                     );
//                   if (itemType(item) === "submenu")
//                     return [
//                       <SidebarSubItem
//                         item={item}
//                         isOpen={collapse[item.name]}
//                         handler={() => toggleItemCollapse(item.name)}
//                         isActive={routeActive(getSubRoutes(item))}
//                         key={i}
//                       >
//                         <SidebarSubHeader item={item} key={i} />
//                         {item.submenu.map((subitem, i) => (
//                           <SidebarItem
//                             key={i}
//                             item={subitem}
//                             isActive={routeActive(subitem.path)}
//                           />
//                         ))}
//                       </SidebarSubItem>,
//                     ];
//                 }
//                 return null; // unrecognized item
//               })}
//             </ul>
//           </nav>
//         </div>
//       </aside>
//     </>
//   );
// }

// export default memo(Sidebar);

import { memo, useEffect, useCallback } from "react";
import { Badge } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import Menu from "../../Menu.js";
import { setCollapse } from "../../store/sidebar";

function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const collapse = useSelector((state) => state?.sidebarReducer?.collapse);

  /**
   * Check if route is active
   */
  const routeActive = useCallback(
    (paths) => {
      paths = Array.isArray(paths) ? paths : [paths];
      return paths.some((p) => location.pathname === p);
    },
    [location.pathname]
  );

  /**
   * Initialize / update collapse state when route changes
   */
  useEffect(() => {
    const newCollapse = {};

    Menu.filter(({ heading }) => !heading).forEach(
      ({ name, path, submenu }) => {
        newCollapse[name] = routeActive(
          submenu ? submenu.map(({ path }) => path) : path
        );
      }
    );

    dispatch(setCollapse(newCollapse));
  }, [dispatch, routeActive]);

  /**
   * Toggle submenu collapse
   */
  const toggleItemCollapse = (stateName) => {
    const newCollapse = { ...collapse };

    Object.keys(newCollapse).forEach((key) => {
      if (key !== stateName) newCollapse[key] = false;
    });

    newCollapse[stateName] = !newCollapse[stateName];
    dispatch(setCollapse(newCollapse));
  };

  const getSubRoutes = (item) => item.submenu.map(({ path }) => path);

  /**
   * Sidebar Header
   */
  const SidebarItemHeader = ({ item }) => (
    <li className="nav-heading">
      <span>{item.heading}</span>
    </li>
  );

  /**
   * Normal Menu Item
   */
  const SidebarItem = ({ item, isActive }) => (
    <li className={isActive ? "active" : ""}>
      <Link to={item.path} title={item.name}>
        {item.label && (
          <Badge bg={item.label.color} className="float-end">
            {item.label.value}
          </Badge>
        )}
        {item.icon && <item.icon className="me-2" size={18} />}
        <span className="align-middle">{item.name}</span>
      </Link>
    </li>
  );

  /**
   * Submenu Item
   */
  const SidebarSubItem = ({
    item,
    isActive,
    isOpen,
    handler,
    children,
  }) => (
    <li className={isActive ? "active" : ""}>
      <div
        className="nav-item d-flex align-items-center justify-content-between"
        onClick={handler}
        style={{ cursor: "pointer" }}
      >
        <div className="d-flex align-items-center">
          {item.icon && <item.icon className="me-2" size={18} />}
          <span>{item.name}</span>
        </div>
        <span>{isOpen ? "▾" : "▸"}</span>
      </div>

      {isOpen && <ul className="sidebar-subnav">{children}</ul>}
    </li>
  );

  /**
   * Detect item type
   */
  const itemType = (item) => {
    if (item.heading) return "heading";
    if (!item.submenu) return "menu";
    return "submenu";
  };

  return (
    <aside className="aside-container">
      <div className="aside-inner">
        <nav className="sidebar">
          <ul className="sidebar-nav">
            <li className="has-user-block"></li>

            {Menu.map((item, i) => {
              const type = itemType(item);

              if (type === "heading") {
                return <SidebarItemHeader item={item} key={i} />;
              }

              if (type === "menu") {
                return (
                  <SidebarItem
                    key={i}
                    item={item}
                    isActive={routeActive(item.path)}
                  />
                );
              }

              if (type === "submenu") {
                return (
                  <SidebarSubItem
                    key={i}
                    item={item}
                    isOpen={collapse?.[item.name]}
                    isActive={routeActive(getSubRoutes(item))}
                    handler={() => toggleItemCollapse(item.name)}
                  >
                    {item.submenu.map((subitem, idx) => (
                      <SidebarItem
                        key={idx}
                        item={subitem}
                        isActive={routeActive(subitem.path)}
                      />
                    ))}
                  </SidebarSubItem>
                );
              }

              return null;
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

export default memo(Sidebar);
