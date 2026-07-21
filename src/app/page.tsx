'use client';

import { ArrowRight, Clock, ShoppingBag, Star, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from 'react';

import { HeroBadge } from "~/ui/components/hero-badge";
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

const featuresWhyChooseUs = [
  {
    description:
      "Entrega em todo o país e ao estrangeiro. Rastreamento em tempo real e confiabilidade garantida.",
    icon: <Truck className="h-6 w-6 text-primary" />,
    title: "Entrega Nacional e ao Estrangeiro",
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



export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        // Fetch produtos em destaque (filtrado e limitado no servidor)
        const response = await fetch('/api/materials?featured=true&limit=8&variants=false');
        if (!response.ok) {
          console.error('Failed to fetch materials:', response.status);
          setLoading(false);
          return;
        }
        const data = await response.json() as any;

        const featured = (data.data || [])
          .map((m: any) => ({
            id: m.id.toString(),
            name: m.name,
            category: m.category?.name || 'Diversos',
            price: m.price,
            image: m.image || 'https://via.placeholder.com/400x400?text=' + m.name,
            inStock: m.stock > 0,
            rating: 4.5,
          }));
        
        setFeaturedProducts(featured);

        // Fetch categorias principais
        const categoriesRes = await fetch('/api/categories?hierarchy=true');
        if (!categoriesRes.ok) {
          console.error('Failed to fetch categories:', categoriesRes.status);
          setLoading(false);
          return;
        }
        const categoriesData = await categoriesRes.json() as any;
        
        // Handle multiple response formats: { data: [...] } or [...]
        const categoriesList = Array.isArray(categoriesData?.data) ? categoriesData.data : 
                               Array.isArray(categoriesData) ? categoriesData : [];
  
        if (categoriesList.length === 0) {
          setCategories([]);
        } else {
          // Pegar apenas categorias principais (sem pai) marcadas como featured
          const mainCategories = categoriesList
            .filter((cat: any) => !cat.parentCategoryId && cat.isFeatured === true)
            .slice(0, 4)
            .map((cat: any) => ({
              id: cat.id,
              name: cat.name,
              image: cat.image || 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&auto=format&fit=crop&q=85&fm=webp',
              productCount: 0,
            }));
    
          setCategories(mainCategories);
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <main
      className={`
        flex min-h-screen flex-col gap-y-16 bg-gradient-to-b from-muted/50
        via-muted/25 to-background
      `}
    >
        {/* Hero Section */}
        <section
          className={`
            relative overflow-hidden py-24
            md:py-32
          `}
        >
          <div
            className={`
              bg-grid-black/[0.02] absolute inset-0
              bg-[length:20px_20px]
            `}
          />
          <div
            className={`
              relative z-10 container mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            `}
          >
            <div
              className={`
                grid items-center gap-10
                lg:grid-cols-2 lg:gap-12
              `}
            >
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1
                    className={`
                      font-display text-4xl leading-tight font-bold
                      tracking-tight text-foreground
                      sm:text-5xl
                      md:text-6xl
                      lg:leading-[1.1]
                    `}
                  >
                    Materiais de Construção{" "}
                    <span
                      className={`
                        bg-gradient-to-r from-primary to-primary/70 bg-clip-text
                        text-transparent
                      `}
                    >
                      ao seu Alcance
                    </span>
                  </h1>
                  <p
                    className={`
                      max-w-[700px] text-lg text-muted-foreground
                      md:text-xl
                    `}
                  >
                    Descubra produtos de qualidade a preços competitivos, com entrega em todo o país e ao estrangeiro e serviço de atendimento excepcional.
                  </p>
                </div>
                <div
                  className={`
                    flex flex-col gap-3
                    sm:flex-row
                  `}
                >
                  <Link href="/products">
                    <Button
                      className={`
                        h-12 gap-1.5 px-8 transition-colors duration-200
                      `}
                      size="lg"
                    >
                      Explorar Agora <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button
                      className="h-12 px-8 transition-colors duration-200"
                      size="lg"
                      variant="outline"
                    >
                      Criar Conta
                    </Button>
                  </Link>
                </div>
                <div
                  className={`
                    flex flex-wrap gap-5 text-sm text-muted-foreground
                  `}
                >
                  <div className="flex items-center gap-1.5">
                    <Truck className="h-5 w-5 text-primary/70" />
                    <span>Entrega em todo o país e ao estrangeiro</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-5 w-5 text-primary/70" />
                    <span>Suporte 24/7</span>
                  </div>
                </div>
              </div>
              <div
                className={`
                  relative mx-auto hidden aspect-square w-full max-w-md
                  overflow-hidden rounded-xl border shadow-lg
                  lg:block
                `}
              >
                <div
                  className={`
                    absolute inset-0 z-10 bg-gradient-to-tr from-primary/20
                    via-transparent to-transparent
                  `}
                />
                <Image
                  alt="Recuperador de Calor"
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  src="https://www.lojaclimatiza.com/image/cache/catalog/2021/Rocal/recuperadores%20/recuperador-de-calor-a-lenha-g-425-porta-guilhotina-rocal-2-500x500.jpg"
                />
              </div>
            </div>
          </div>
          <div
            className={`
              absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent
              via-primary/20 to-transparent
            `}
          />
        </section>

        {/* Catalogs Carousel */}
        <section className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <CatalogsCarousel />
          </div>
        </section>

        {/* Featured Categories */}
        <section
          className={`
            py-12
            md:py-16
          `}
        >
          <div
            className={`
              container mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            `}
          >
            <div className="mb-8 flex flex-col items-center text-center">
              <h2
                className={`
                  font-display text-3xl leading-tight font-bold tracking-tight
                  md:text-4xl
                `}
              >
                Categorias Populares
              </h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
              <p className="mt-4 max-w-2xl text-center text-muted-foreground">
                Encontre os melhores materiais nas nossas categorias curadas
              </p>
            </div>
            <div
              className={`
                grid grid-cols-2 gap-4
                md:grid-cols-4 md:gap-6
              `}
            >
              {categories.map((category) => (
                <Link
                  aria-label={`Explorar produtos de ${category.name}`}
                  className={`
                    group relative flex flex-col space-y-4 overflow-hidden
                    rounded-2xl border bg-card shadow transition-all
                    duration-300
                    hover:shadow-lg
                  `}
                  href={`/products?categoryId=${category.id}`}
                  key={category.name}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <div
                      className={`
                        absolute inset-0 z-10 bg-gradient-to-t
                        from-background/80 to-transparent
                      `}
                    />
                    <Image
                      alt={category.name}
                      className={`
                        object-cover transition duration-300
                        group-hover:scale-105
                      `}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                      src={category.image}
                    />
                  </div>
                  <div className="relative z-20 -mt-6 p-4">
                    <div className="mb-1 text-lg font-medium">
                      {category.name}
                    </div>
                    {category.productCount > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {category.productCount} produtos
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section
          className={`
            bg-muted/50 py-12
            md:py-16
          `}
        >
          <div
            className={`
              container mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            `}
          >
            <div className="mb-8 flex flex-col items-center text-center">
              <h2
                className={`
                  font-display text-3xl leading-tight font-bold tracking-tight
                  md:text-4xl
                `}
              >
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
                <div
                  className={`
                    grid grid-cols-1 gap-6
                    sm:grid-cols-2
                    lg:grid-cols-3
                    xl:grid-cols-4
                  `}
                >
                  {featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <div className="mt-10 flex justify-center">
                  <Link href="/products">
                    <Button className="group h-12 px-8" size="lg" variant="outline">
                      Ver Todos os Produtos
                      <ArrowRight
                        className={`
                          ml-2 h-4 w-4 transition-transform duration-300
                          group-hover:translate-x-1
                        `}
                      />
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section
          className={`
            py-12
            md:py-16
          `}
          id="features"
        >
          <div
            className={`
              container mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            `}
          >
            <div className="mb-8 flex flex-col items-center text-center">
              <h2
                className={`
                  font-display text-3xl leading-tight font-bold tracking-tight
                  md:text-4xl
                `}
              >
                Por Que Nos Escolher
              </h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
              <p
                className={`
                  mt-4 max-w-2xl text-center text-muted-foreground
                  md:text-lg
                `}
              >
                Oferecemos a melhor experiência com recursos premium
              </p>
            </div>
            <div
              className={`
                grid gap-8
                md:grid-cols-2
                lg:grid-cols-4
              `}
            >
              {featuresWhyChooseUs.map((feature) => (
                <Card
                  className={`
                    rounded-2xl border-none bg-background shadow transition-all
                    duration-300
                    hover:shadow-lg
                  `}
                  key={feature.title}
                >
                  <CardHeader className="pb-2">
                    <div
                      className={`
                        mb-3 flex h-12 w-12 items-center justify-center
                        rounded-full bg-primary/10
                      `}
                    >
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section
          className={`
            bg-muted/50 py-12
            md:py-16
          `}
        >
          <div
            className={`
              container mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            `}
          >
            <div className="mb-8 flex flex-col items-center text-center">
              <h2
                className={`
                  font-display text-3xl leading-tight font-bold tracking-tight
                  md:text-4xl
                `}
              >
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
                  quote: 'Comfilar revolucionou como gerencio meus pedidos. Ganho 10 horas por semana!',
                  author: 'João Silva',
                  role: 'Empreiteiro',
                },
                {
                  quote: 'Os preços são ótimos e o atendimento é excelente. Recomendo para todos.',
                  author: 'Maria Santos',
                  role: 'Arquiteta',
                },
                {
                  quote: 'Plataforma intuitiva e confiável. Meus projetos correm muito mais rápido agora.',
                  author: 'Carlos Oliveira',
                  role: 'Gestor de Obras',
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
        <section
          className={`
            py-12
            md:py-16
          `}
        >
          <div
            className={`
              container mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            `}
          >
            <div
              className={`
                relative overflow-hidden rounded-xl bg-primary/10 p-8 shadow-lg
                md:p-12
              `}
            >
              <div
                className={`
                  bg-grid-white/[0.05] absolute inset-0
                  bg-[length:16px_16px]
                `}
              />
              <div className="relative z-10 mx-auto max-w-2xl text-center">
                <h2
                  className={`
                    font-display text-3xl leading-tight font-bold tracking-tight
                    md:text-4xl
                  `}
                >
                  Pronto para Começar?
                </h2>
                <p
                  className={`
                    mt-4 text-lg text-muted-foreground
                    md:text-xl
                  `}
                >
                  Junte-se a milhares de profissionais que já estão usando Comfilar. Crie sua conta hoje e acesse ofertas exclusivas.
                </p>
                <div
                  className={`
                    mt-6 flex flex-col items-center justify-center gap-3
                    sm:flex-row
                  `}
                >
                  <Link href="/auth/register">
                    <Button
                      className="h-12 px-8 transition-colors duration-200"
                      size="lg"
                    >
                      Criar Conta Agora
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button
                      className="h-12 px-8 transition-colors duration-200"
                      size="lg"
                      variant="outline"
                    >
                      Explorar Catálogo
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
    </main>
  );
}
