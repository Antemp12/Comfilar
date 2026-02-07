"use client";
import { useSidebar } from "~/context/SidebarContext";
import { useAuth } from "~/lib/auth-context";
import { MenuIcon, CloseIcon } from "~/ui/icons/admin-icons";
import { Button } from "~/ui/primitives/button";
import { useRouter } from "next/navigation";

const AppHeader: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 flex w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex w-full items-center justify-between px-4 py-3 lg:px-6">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
          onClick={handleToggle}
          aria-label="Toggle Sidebar"
        >
          {isMobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.name || "Admin"}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {user?.email || ""}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
