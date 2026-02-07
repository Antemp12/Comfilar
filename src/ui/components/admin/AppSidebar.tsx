"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "~/context/SidebarContext";
import { useAuth } from "~/lib/auth-context";
import { Button } from "~/ui/primitives/button";
import {
  GridIcon,
  PackageIcon,
  UsersIcon,
  ShoppingCartIcon,
  ChartIcon,
  SettingsIcon,
  StarIcon,
  FileTextIcon,
  CalendarIcon,
  ChevronDownIcon,
} from "~/ui/icons/admin-icons";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/admin/dashboard",
  },
  {
    icon: <PackageIcon />,
    name: "Materiais",
    path: "/admin/materials",
  },
  {
    icon: <UsersIcon />,
    name: "Utilizadores",
    path: "/admin/users",
  },
  {
    icon: <ShoppingCartIcon />,
    name: "Encomendas",
    path: "/admin/orders",
  },
  {
    icon: <FileTextIcon />,
    name: "Orçamentos",
    path: "/admin/quotes",
  },
  {
    icon: <CalendarIcon />,
    name: "Reuniões",
    path: "/admin/meetings",
  },
];

const othersItems: NavItem[] = [
  {
    icon: <StarIcon />,
    name: "Destaques",
    subItems: [
      { name: "Imagens de Categorias", path: "/admin/categorias" },
      { name: "Categorias Destaque", path: "/admin/categorias-destaque" },
      { name: "Produtos Destaque", path: "/admin/produtos-destaque" },
      { name: "Catálogos (Carrossel)", path: "/admin/catalogs" },
    ],
  },
  {
    icon: <ChartIcon />,
    name: "Relatórios",
    path: "/admin/reports",
  },
  {
    icon: <SettingsIcon />,
    name: "Configurações",
    path: "/admin/configuracoes",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (navItems: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-2">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              } ${!isExpanded && !isHovered ? "lg:justify-center" : ""}`}
            >
              <span
                className={`${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "text-primary"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="flex-1 text-left">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "rotate-180"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(nav.path)
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                } ${!isExpanded && !isHovered ? "lg:justify-center" : ""}`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "text-primary"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 ml-9 space-y-1">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive(subItem.path)
                          ? "text-primary font-medium"
                          : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                      }`}
                    >
                      {subItem.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 ${
          isExpanded || isMobileOpen
            ? "w-[270px]"
            : isHovered
            ? "w-[270px]"
            : "w-[80px]"
        } ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`flex py-6 px-5 ${!isExpanded && !isHovered ? "lg:justify-center" : ""}`}>
          <Link href="/admin" className="flex items-center gap-2">
            {isExpanded || isHovered || isMobileOpen ? (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
                  <span className="text-sm font-bold text-white">C</span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Comfilar Admin
                </span>
              </>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
                <span className="text-sm font-bold text-white">C</span>
              </div>
            )}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4">
          <nav className="space-y-6">
            <div>
              <h2
                className={`mb-3 text-xs font-semibold uppercase text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:text-center" : ""
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Menu" : "•••"}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            <div>
              <h2
                className={`mb-3 text-xs font-semibold uppercase text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:text-center" : ""
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Outros" : "•••"}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </nav>
        </div>

        {/* Logout Button */}
        <div className="border-t border-gray-200 p-5 dark:border-gray-800">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            {isExpanded || isHovered || isMobileOpen ? "Sair" : "Sair"}
          </Button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
