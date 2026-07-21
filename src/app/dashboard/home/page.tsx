"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "~/lib/auth-context";
import { RoleGuard } from "~/lib/role-guard";
import { ProductCard } from "~/ui/components/product-card";
import { CatalogsCarousel } from "~/ui/components/catalogs-carousel";
import { PromotionsBanner } from "~/ui/components/promotions-banner";
import { Button } from "~/ui/primitives/button";
import { Input } from "~/ui/primitives/input";
import { Badge } from "~/ui/primitives/badge";
import {
  ArrowRight,
  CalendarClock,
  Heart,
  Package,
  Search,
} from "lucide-react";

interface HomeOrder {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  items: number;
  createdAt: string;
}

interface HomeMeeting {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  subject: string | null;
  status: "pendente" | "aprovado" | "rejeitado" | "cancelado";
}

const statusColors: Record<string, string> = {
  processamento: "bg-blue-100 text-blue-800",
  preparacao: "bg-yellow-100 text-yellow-800",
  enviado: "bg-purple-100 text-purple-800",
  entregue: "bg-green-100 text-green-800",
};

const statusLabels: Record<string, string> = {
  processamento: "Em Processamento",
  preparacao: "Em Preparação",
  enviado: "Enviada",
  entregue: "Entregue",
};

function greetingForNow() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 20) return "Boa tarde";
  return "Boa noite";
}

export default function DashboardHomePage() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<HomeOrder[]>([]);
  const [meetings, setMeetings] = useState<HomeMeeting[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // Reutiliza os filtros guardados do catálogo (/products lê isto ao montar).
  const goToCatalog = (filters: Record<string, unknown>) => {
    try {
      localStorage.setItem("productFilters", JSON.stringify(filters));
    } catch {
      /* ignora */
    }
    router.push("/products");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    try {
      localStorage.setItem("productFilters", JSON.stringify({ searchTerm: q }));
    } catch {
      /* ignora */
    }
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  };

  useEffect(() => {
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

    const load = async () => {
      try {
        const [matRes, catRes] = await Promise.all([
          fetch("/api/materials?limit=50&variants=false"),
          fetch("/api/categories?hierarchy=true"),
        ]);

        const matData = (await matRes.json()) as any;
        setFeaturedProducts(
          (matData.data || [])
            .filter((m: any) => m.isFeatured === true)
            .slice(0, 8)
            .map((m: any) => ({
              id: m.id.toString(),
              name: m.name,
              category: m.category?.name || "Diversos",
              price: m.price,
              image: m.image || "/images/placeholder-product.jpg",
              inStock: m.stock > 0,
            })),
        );

        const catData = (await catRes.json()) as any;
        const catList = Array.isArray(catData?.data)
          ? catData.data
          : Array.isArray(catData)
            ? catData
            : [];
        setCategories(
          catList
            .filter((c: any) => !c.parentCategoryId && c.isActive !== false)
            .slice(0, 6)
            .map((c: any) => ({
              id: c.id,
              name: c.name,
              image: c.image || "/images/placeholder-product.jpg",
            })),
        );

        const [ordersRes, meetingsRes] = await Promise.all([
          fetch("/api/customer/orders", { headers: authHeaders, credentials: "include" }),
          fetch("/api/meetings/requests", { credentials: "include" }),
        ]);
        if (ordersRes.ok) {
          const d = (await ordersRes.json()) as { data?: HomeOrder[] };
          setOrders(Array.isArray(d.data) ? d.data : []);
        }
        if (meetingsRes.ok) {
          const d = (await meetingsRes.json()) as { data?: HomeMeeting[] };
          setMeetings(Array.isArray(d.data) ? d.data : []);
        }
      } catch (err) {
        console.error("Erro ao carregar a página inicial:", err);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [token]);

  const recentOrders = orders.slice(0, 3);

  const nextMeeting = meetings
    .filter((m) => {
      if (m.status === "rejeitado" || m.status === "cancelado") return false;
      const d = new Date(m.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return d >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <RoleGuard allowedRoles={["cliente"]}>
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-primary to-indigo-600">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="relative container mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
            <h1 className="text-3xl font-bold text-white md:text-5xl">
              {greetingForNow()}, {user?.name?.split(" ")[0] ?? "cliente"}!
            </h1>
            <p className="mt-3 max-w-xl text-base text-white/85 md:text-lg">
              Encontre os materiais que precisa para a sua obra — entrega em todo o
              país e ao estrangeiro, e orçamentos sem complicações.
            </p>

            <form onSubmit={handleSearch} className="mt-6 flex max-w-xl gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Procurar materiais..."
                  className="h-11 pl-9"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-11 bg-white text-primary shadow-sm hover:bg-white/90"
              >
                Procurar
              </Button>
            </form>

            {/* Acessos rápidos (sem métricas) */}
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/dashboard/my-orders"
                className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-white"
              >
                <Package className="h-4 w-4 text-blue-600" /> As minhas encomendas
              </Link>
              <Link
                href="/dashboard/meetings"
                className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-white"
              >
                <CalendarClock className="h-4 w-4 text-amber-600" /> Reuniões
              </Link>
              <Link
                href="/dashboard/favorites"
                className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-white"
              >
                <Heart className="h-4 w-4 text-rose-600" /> Favoritos
              </Link>
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6 lg:px-8">
          {/* Próxima reunião (faixa fina, só se existir) */}
          {nextMeeting && (
            <Link
              href="/dashboard/meetings"
              className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 transition-colors hover:bg-amber-100"
            >
              <CalendarClock className="h-5 w-5 shrink-0" />
              <span>
                <strong>Próxima reunião:</strong>{" "}
                {new Date(nextMeeting.date).toLocaleDateString("pt-PT", {
                  day: "2-digit",
                  month: "long",
                  timeZone: "UTC",
                })}{" "}
                às {nextMeeting.startTime}
                {nextMeeting.status === "pendente" && " (a aguardar aprovação)"}
              </span>
            </Link>
          )}

          {/* Promoções */}
          <PromotionsBanner />

          {/* Catálogos */}
          <CatalogsCarousel />

          {/* Categorias */}
          {categories.length > 0 && (
            <section>
              <div className="mb-5 text-center">
                <h2 className="text-2xl font-bold md:text-3xl">Explore por categoria</h2>
                <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => goToCatalog({ selectedCategories: [category.id] })}
                    aria-label={`Ver produtos de ${category.name}`}
                    className="group overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <Image
                        alt={category.name}
                        className="object-cover transition duration-300 group-hover:scale-105"
                        fill
                        sizes="(max-width: 768px) 50vw, 16vw"
                        src={category.image}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <p className="absolute inset-x-0 bottom-0 truncate p-3 text-sm font-semibold text-white">
                        {category.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Produtos em destaque */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold md:text-3xl">Em destaque</h2>
                <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
              </div>
              <Link
                href="/products"
                className="text-sm font-medium text-primary hover:underline"
              >
                Ver todos
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
                ))}
              </div>
            ) : featuredProducts.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                Sem produtos em destaque de momento.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>

          {/* Encomendas recentes (leve, só se existir) */}
          {!loading && recentOrders.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">As suas encomendas recentes</h2>
                <Link
                  href="/dashboard/my-orders"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Ver todas
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href="/dashboard/my-orders"
                    className="rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{order.orderNumber}</p>
                      <Badge variant="outline" className={statusColors[order.status] ?? ""}>
                        {statusLabels[order.status] ?? order.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("pt-PT")} ·{" "}
                      {order.items} artigo(s)
                    </p>
                    <p className="mt-1 font-semibold">€{Number(order.total).toFixed(2)}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-primary to-indigo-600 p-8 text-center text-white md:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <h2 className="relative text-2xl font-bold md:text-3xl">
              Precisa de ajuda com a sua obra?
            </h2>
            <p className="relative mt-3 text-white/85">
              Explore o catálogo ou marque uma reunião com a nossa equipa.
            </p>
            <div className="relative mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/products">
                <Button size="lg" className="h-12 bg-white px-8 text-primary hover:bg-white/90">
                  Explorar catálogo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/meetings">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 border-white/70 bg-transparent px-8 text-white hover:bg-white/10 hover:text-white"
                >
                  Agendar reunião
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </RoleGuard>
  );
}
