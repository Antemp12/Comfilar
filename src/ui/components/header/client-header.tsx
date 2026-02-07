'use client';

import { LogOut, Menu, X, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '~/lib/auth-context';
import { cn } from '~/lib/cn';
import { Button } from '~/ui/primitives/button';
import { Skeleton } from '~/ui/primitives/skeleton';

import { NotificationsWidget } from '../notifications/notifications-widget';
import { ThemeToggle } from '../theme-toggle';
import { Cart } from '~/ui/components/cart';

export function ClientHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const clientNavigation = [
    { href: '/dashboard/home', name: 'Início' },
    { href: '/dashboard/products', name: 'Produtos' },
    { href: '/dashboard/my-orders', name: 'Minhas Encomendas' },
    { href: '/dashboard/favorites', name: 'Favoritos' },
    { href: '/dashboard/meetings', name: 'Agenda' },
  ];

  const renderContent = () => (
    <header
      className={`
        sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur
        supports-[backdrop-filter]:bg-background/60
      `}
    >
      <div
        className={`
          container mx-auto max-w-7xl px-4
          sm:px-6
          lg:px-8
        `}
      >
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link className="flex items-center gap-2" href="/dashboard/home">
              <Image
                src="/images/logotipoteste.png"
                alt="Comfilar Logo"
                width={110}
                height={62}
                priority
                sizes="(max-width: 768px) 85px, 110px"
              />
            </Link>

            {/* Navigation */}
            <nav
              className={`
                hidden
                md:flex
              `}
            >
              <ul className="flex items-center gap-6">
                {clientNavigation.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== '/dashboard/home' && pathname?.startsWith(item.href));

                      return (
                        <li key={item.name}>
                          <Link
                            className={cn(
                              `
                                text-sm font-medium transition-colors
                                hover:text-primary
                              `,
                              isActive
                                ? 'font-semibold text-primary'
                                : 'text-muted-foreground',
                            )}
                            href={item.href}
                          >
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
              </ul>
            </nav>
          </div>

          {/* Right side - Cart, Notifications, User, Theme, Logout */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Cart />

            {/* Notifications */}
            <NotificationsWidget />

            {/* User Info & Logout */}
            <div
              className={`
                hidden
                md:flex
                md:items-center
                md:gap-4
              `}
            >
              <Link href="/dashboard/profile" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
              </Link>

              <Button
                onClick={handleLogout}
                size="sm"
                variant="ghost"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile menu button */}
            <Button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              size="icon"
              variant="ghost"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 border-b px-4 py-3">
            {clientNavigation.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard/home' && pathname?.startsWith(item.href));

                  return (
                    <Link
                      className={cn(
                        'block rounded-md px-3 py-2 text-base font-medium',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : `
                            text-foreground
                            hover:bg-muted/50 hover:text-primary
                          `,
                      )}
                      href={item.href}
                      key={item.name}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  );
                })}
          </div>

          {/* Mobile User Info */}
          <div className="border-b px-4 py-3 space-y-3">
            {user && (
              <>
                <div className="text-sm">
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  size="sm"
                  variant="ghost"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );

  return renderContent();
}
