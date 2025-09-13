import { memo, useEffect } from "react";
import { Badge, Collapse } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import Menu from "../../Menu.js";
import { setCollapse } from "../../store/sidebar";

function Sidebar() {
  let location = useLocation();
  const dispatch = useDispatch();
  const collapse = useSelector((state) => state?.sidebarReducer?.collapse);
  const userType = localStorage.getItem("permissions")?.split(',') || [];
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = userData?.isAdmin === true;
  //  console.log(userType, "userType")
  //  console.log(userData, "userData")
  //  console.log(isAdmin, "isAdmin")

  const filteredMenu = Menu.filter(item => {
    // If user is admin, show all menus
    if (isAdmin) return true;
    
    // If userType exists, only show menus for that userType
    if (userType && userType.length > 0) {
      // If item has no permissions, don't show it
      if (!item.permissions) return false;
      
      // For non-admin users, show menus that match any of their permissions
      return item.permissions.some(permission => userType.includes(permission));
    }
    
    // If no userType, show all menus
    return true;
  });
   //console.log(filteredMenu, "filteredMenu")


  // const filteredMenu = Menu.filter(item => {
  //   if (userType) {
  //     if (!item.permissions) return false; 
  //     if (isAdmin) return true;           
  //     return item.permissions.includes(userType);
  //   }
  //   return true;
  // });
  // console.log(filteredMenu, "filteredMenu") 
  
  useEffect(() => {
    // Only update collapse if it's different from current state
    let newcollapse = JSON.parse(JSON.stringify(collapse));
    let hasChanges = false;

    Menu.filter(({ heading }) => !heading).forEach(
      ({ name, path, submenu }) => {
        const isActive = routeActive(
          submenu ? submenu.map(({ path }) => path) : path
        );
        if (newcollapse[name] !== isActive) {
          newcollapse[name] = isActive;
          hasChanges = true;
        }
      }
    );

    // Only dispatch if there are actual changes
    if (hasChanges) {
      dispatch(setCollapse(newcollapse));
    }
  }, [location.pathname]); // Only depend on location.pathname

  /** Component to display headings on sidebar */
  const SidebarItemHeader = ({ item }) => {
    // console.log(item)
    return (
      <li className="nav-heading">
        <span>{item.heading}</span>
      </li>
    );
  };

  /** Normal items for the sidebar */
  const SidebarItem = ({ item, isActive }) => {
    // console.log(item)
    return (
      <li className={isActive ? "active" : ""}>
        <Link to={item.path} title={item.name}>
          {item.label && (
            <Badge tag="div" className="float-right" color={item.label.color}>
              {item.label.value}
            </Badge>
          )}
          {item.icon && <em className={item.icon}></em>}
          <span>{item.name}</span>
        </Link>
      </li>
    );
  };

  /** Build a sub menu with items inside and attach collapse behavior */
  const SidebarSubItem = ({ item, isActive, handler, children, isOpen }) => {
    // console.log(item, "item")

    return (
      <li className={isActive ? "active" : ""}>
        <div className="nav-item" onClick={handler}>
          {item.label && (
            <Badge tag="div" className="float-right" color={item.label.color}>
              {item.label.value}
            </Badge>
          )}
          {item.icon && <em className={item.icon}></em>}
          <span>{item.name}</span>
        </div>

        <Collapse>
          <ul
            id={item.path}
            className={`sidebar-nav sidebar-subnav ${isOpen ? "show" : ""}`}
          >
            {children}
          </ul>
        </Collapse>
      </li>
    );
  };

  /** Component used to display a header on menu when using collapsed/hover mode */
  const SidebarSubHeader = ({ item }) => {
    return <li className="sidebar-subnav-header"><span>{item.name}</span></li>;
  };

  /** map menu config to string to determine which element to render */
  const itemType = (item) => {
    if (item.heading) return "heading";
    if (!item.submenu) return "menu";
    if (item.submenu) return "submenu";
  };

  const routeActive = (paths) => {
    paths = Array.isArray(paths) ? paths : [paths];
    // console.log(paths)
    return paths.some((p) => location.pathname.indexOf(p) > -1);
  };

  const toggleItemCollapse = (stateName) => {
    let newcollapse = JSON.parse(JSON.stringify(collapse));
    for (let c in newcollapse) {
      if (newcollapse[c] === true && c !== stateName) {
        newcollapse[c] = false;
      }
    }

    newcollapse[stateName] = !newcollapse[stateName];
    dispatch(setCollapse(newcollapse));
  };

  const getSubRoutes = (item) => item.submenu.map(({ path }) => path);

  return (
    <>
      <aside className="aside-container">
        <div className="aside-inner">
          <nav data-sidebar-anyclick-close="" className="sidebar">
            <ul className="sidebar-nav">
              <li className="has-user-block">
                {/* <SidebarUserBlock />{" "} */}
              </li>

              {filteredMenu.map((item, i) => {
                if (itemType(item) === "heading")
                  return <SidebarItemHeader item={item} key={i} />;
                else {
                  if (itemType(item) === "menu")
                    return (
                      <SidebarItem
                        isActive={routeActive(item.path)}
                        item={item}
                        key={i}
                      />
                    );
                  if (itemType(item) === "submenu")
                    return [
                      <SidebarSubItem
                        item={item}
                        isOpen={collapse[item.name]}
                        handler={() => toggleItemCollapse(item.name)}
                        isActive={routeActive(getSubRoutes(item))}
                        key={i}
                      >
                        <SidebarSubHeader item={item} key={i} />
                        {item.submenu.map((subitem, i) => (
                          <SidebarItem
                            key={i}
                            item={subitem}
                            isActive={routeActive(subitem.path)}
                          />
                        ))}
                      </SidebarSubItem>,
                    ];
                }
                return null;
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}

export default memo(Sidebar);
