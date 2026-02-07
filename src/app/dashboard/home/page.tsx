"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "~/lib/auth-context";
import { RoleGuard } from "~/lib/role-guard";
import { ProductCard } from "~/ui/components/product-card";
import { CatalogsCarousel } from "~/ui/components/catalogs-carousel";
import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";
import { ArrowRight, Clock, ShoppingBag, Star, Truck } from "lucide-react";

const featuresWhyChooseUs = [
  {
    description:
      "Entrega rápida em todo o país. Rastreamento em tempo real e confiabilidade garantida.",
    icon: <Truck className="h-6 w-6 text-primary" />,
    title: "Entrega Rápida",
  },
  {
    description:
      "Suas informações de pagamento são sempre seguras. Utilizamos encriptação de nível industrial.",
    icon: <ShoppingBag className="h-6 w-6 text-primary" />,
    title: "Checkout Seguro",
  },
  {
    description:
      "Nosso tim de suporte está sempre disponível para ajudar com qualquer dúvida.",
    icon: <Clock className="h-6 w-6 text-primary" />,
    title: "Suporte 24/7",
  },
  {
    description:
      "Garantimos a qualidade de todos os produtos. Satisfação garantida ou dinheiro de volta.",
    icon: <Star className="h-6 w-6 text-primary" />,
    title: "Garantia de Qualidade",
  },
];

// Categorias removidas - agora são dinâmicas

export default function DashboardHomePage() {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
          // Fetch produtos em destaque
        const response = await fetch("/api/materials?limit=50");
        const data = (await response.json()) as any;
        const featured = (data.data || [])
          .filter((m: any) => m.isFeatured === true)
          .slice(0, 8)
          .map((m: any) => ({
            id: m.id.toString(),
            name: m.name,
            category: m.category?.name || "Diversos",
            price: m.price,
            image: m.image || "https://via.placeholder.com/400x400?text=" + m.name,
            inStock: m.stock > 0,
            rating: 4.5,
          }));
        setFeaturedProducts(featured);

              // Fetch categorias principais
              const categoriesRes = await fetch('/api/categories?hierarchy=true');
              const categoriesData = await categoriesRes.json() as any;
              
              // Handle multiple response formats: { data: [...] } or [...]
              const categoriesList = Array.isArray(categoriesData?.data) ? categoriesData.data : 
                                     Array.isArray(categoriesData) ? categoriesData : [];
        
              if (categoriesList.length > 0) {
                // Pegar apenas categorias principais (sem pai) marcadas como featured
                const mainCategories = categoriesList
                  .filter((cat: any) => !cat.parentCategoryId && cat.isFeatured === true)
                  .slice(0, 4)
                  .map((cat: any) => ({
                    id: cat.id,
                    name: cat.name,
                    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
                    productCount: 0,
                  }));
          
                setCategories(mainCategories);
              }
      } catch (err) {
        console.error("Error fetching featured products:", err);
      } finally {
        setLoading(false);
      }
    };
    void fetchFeaturedProducts();
  }, []);

  return (
    <RoleGuard allowedRoles={["cliente"]}>
      <main
        className={`
          flex min-h-screen flex-col gap-y-16 bg-gradient-to-b from-muted/50
          via-muted/25 to-background
        `}
      >
        {/* Welcome header (replaces public hero) */}
        <section className="py-16">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900">
                Bem-vindo, {user?.name}! 👋
              </h1>
            </div>
          </div>
        </section>

        {/* Catalogs Carousel */}
        <section className="py-8">
          <div className="container mx-auto max-w-7xl px-4">
            <CatalogsCarousel />
          </div>
        </section>

        {/* Featured Categories */}
        <section className={`py-12 md:py-16`}>
          <div className={`container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`}>
            <div className="mb-8 flex flex-col items-center text-center">
              <h2 className={`font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl`}>
                Categorias Populares
              </h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
              <p className="mt-4 max-w-2xl text-center text-muted-foreground">
                Encontre os melhores materiais nas nossas categorias curadas
              </p>
            </div>
            <div className={`grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6`}>
              {categories.map((category) => (
                <Link
                  aria-label={`Explorar produtos de ${category.name}`}
                  className={`group relative flex flex-col space-y-4 overflow-hidden rounded-2xl border bg-card shadow transition-all duration-300 hover:shadow-lg`}
                  href={`/dashboard/products?categoryId=${category.id}`}
                  key={category.name}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <div className={`absolute inset-0 z-10 bg-gradient-to-t from-background/80 to-transparent`} />
                    <Image
                      alt={category.name}
                      className={`object-cover transition duration-300 group-hover:scale-105`}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                      src={category.image}
                    />
                  </div>
                  <div className="relative z-20 -mt-6 p-4">
                    <div className="mb-1 text-lg font-medium">{category.name}</div>
                    {category.productCount > 0 && (
                      <p className="text-sm text-muted-foreground">{category.productCount} produtos</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className={`bg-muted/50 py-12 md:py-16`}>
          <div className={`container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`}>
            <div className="mb-8 flex flex-col items-center text-center">
              <h2 className={`font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl`}>
                Produtos em Destaque
              </h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
              <p className="mt-4 max-w-2xl text-center text-muted-foreground">
                Confira nossos materiais mais populares e bem avaliados
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando produtos...</p>
              </div>
            ) : (
              <>
                <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}>
                  {featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <div className="mt-10 flex justify-center">
                  <Link href="/dashboard/products">
                    <Button className="group h-12 px-8" size="lg" variant="outline">
                      Ver Todos os Produtos
                      <ArrowRight className={`ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1`} />
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className={`py-12 md:py-16`} id="features">
          <div className={`container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`}>
            <div className="mb-8 flex flex-col items-center text-center">
              <h2 className={`font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl`}>
                Por Que Nos Escolher
              </h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
              <p className={`mt-4 max-w-2xl text-center text-muted-foreground md:text-lg`}>
                Oferecemos a melhor experiência com recursos premium
              </p>
            </div>
            <div className={`grid gap-8 md:grid-cols-2 lg:grid-cols-4`}>
              {featuresWhyChooseUs.map((feature) => (
                <Card className={`rounded-2xl border-none bg-background shadow transition-all duration-300 hover:shadow-lg`} key={feature.title}>
                  <CardHeader className="pb-2">
                    <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10`}>
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className={`bg-muted/50 py-12 md:py-16`}>
          <div className={`container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`}>
            <div className="mb-8 flex flex-col items-center text-center">
              <h2 className={`font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl`}>
                O Que Nossos Clientes Dizem
              </h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
              <p className="mt-4 max-w-2xl text-center text-muted-foreground">
                Resultados reais de profissionais que usam Comfilar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    "Comfilar revolucionou como gerencio meus pedidos. Ganho 10 horas por semana!",
                  author: "João Silva",
                  role: "Empreiteiro",
                },
                {
                  quote:
                    "Os preços são ótimos e o atendimento é excelente. Recomendo para todos.",
                  author: "Maria Santos",
                  role: "Arquiteta",
                },
                {
                  quote:
                    "Plataforma intuitiva e confiável. Meus projetos correm muito mais rápido agora.",
                  author: "Carlos Oliveira",
                  role: "Gestor de Obras",
                },
              ].map((testimonial, idx) => (
                <Card key={idx} className="border-none bg-background shadow">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground italic mb-4">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={`py-12 md:py-16`}>
          <div className={`container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`}>
            <div className={`relative overflow-hidden rounded-xl bg-primary/10 p-8 shadow-lg md:p-12`}>
              <div className={`bg-grid-white/[0.05] absolute inset-0 bg-[length:16px_16px]`} />
              <div className="relative z-10 mx-auto max-w-2xl text-center">
                <h2 className={`font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl`}>
                  Pronto para Continuar?
                </h2>
                <p className={`mt-4 text-lg text-muted-foreground md:text-xl`}>
                  Explore o catálogo e faça seu pedido com facilidade.
                </p>
                <div className={`mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row`}>
                  <Link href="/dashboard/products">
                    <Button className="h-12 px-8 transition-colors duration-200" size="lg">
                      Explorar Catálogo
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </RoleGuard>
  );
}
