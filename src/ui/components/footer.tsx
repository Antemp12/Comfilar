import { Facebook, Github, Instagram, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

import { SEO_CONFIG } from "~/app";
import { cn } from "~/lib/cn";
import { Button } from "~/ui/primitives/button";
import { db } from "~/db";
import { categoriesTable } from "~/db/schema";
import { isNull } from "drizzle-orm";

export async function Footer({ className }: { className?: string }) {
  // Fetch categories directly from database
  let categories = [];
  try {
    categories = await db
      .select()
      .from(categoriesTable)
      .where(isNull(categoriesTable.parentCategoryId))
      .limit(5);
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
  return (
    <footer className={cn("border-t bg-background", className)}>
      <div
        className={`
          container mx-auto max-w-7xl px-4 py-12
          sm:px-6
          lg:px-8
        `}
      >
        <div
          className={`
            grid grid-cols-1 gap-8
            md:grid-cols-4
          `}
        >
          <div className="space-y-4">
            <Link className="flex items-center gap-2" href="/">
              <span
                className={`
                  bg-gradient-to-r from-primary to-primary/70 bg-clip-text
                  text-xl font-bold tracking-tight text-transparent
                `}
              >
                {SEO_CONFIG.name}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              A sua loja única para tudo. Produtos premium a preços competitivos.
            </p>
            <div className="flex space-x-4">
              <Button
                className="h-8 w-8 rounded-full"
                size="icon"
                variant="ghost"
              >
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button
                className="h-8 w-8 rounded-full"
                size="icon"
                variant="ghost"
              >
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button
                className="h-8 w-8 rounded-full"
                size="icon"
                variant="ghost"
              >
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button
                className="h-8 w-8 rounded-full"
                size="icon"
                variant="ghost"
              >
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Button>
              <Button
                className="h-8 w-8 rounded-full"
                size="icon"
                variant="ghost"
              >
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </Button>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Categorias</h3>
            <ul className="space-y-2 text-sm">
              {categories && categories.length > 0 ? (
                categories.map((category: any) => (
                  <li key={category.id}>
                    <Link
                      className={`
                        text-muted-foreground
                        hover:text-foreground
                      `}
                      href={`/products?category=${category.id}`}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link
                    className={`
                      text-muted-foreground
                      hover:text-foreground
                    `}
                    href="/products"
                  >
                    Ver Todos os Produtos
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Empresa</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className={`
                    text-muted-foreground
                    hover:text-foreground
                  `}
                  href="/about"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  className={`
                    text-muted-foreground
                    hover:text-foreground
                  `}
                  href="/careers"
                >
                  Carreiras
                </Link>
              </li>
              <li>
                <Link
                  className={`
                    text-muted-foreground
                    hover:text-foreground
                  `}
                  href="/blog"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  className={`
                    text-muted-foreground
                    hover:text-foreground
                  `}
                  href="/press"
                >
                  Imprensa
                </Link>
              </li>
              <li>
                <Link
                  className={`
                    text-muted-foreground
                    hover:text-foreground
                  `}
                  href="/contact"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Suporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className={`
                    text-muted-foreground
                    hover:text-foreground
                  `}
                  href="/help"
                >
                  Centro de Ajuda
                </Link>
              </li>
              <li>
                <Link
                  className={`
                    text-muted-foreground
                    hover:text-foreground
                  `}
                  href="/shipping"
                >
                  Envio e Devoluções
                </Link>
              </li>
              <li>
                <Link
                  className={`
                    text-muted-foreground
                    hover:text-foreground
                  `}
                  href="/warranty"
                >
                  Garantia
                </Link>
              </li>
              <li>
                <Link
                  className={`
                    text-muted-foreground
                    hover:text-foreground
                  `}
                  href="/privacy"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  className={`
                    text-muted-foreground
                    hover:text-foreground
                  `}
                  href="/terms"
                >
                  Termos de Serviço
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8">
          <div
            className={`
              flex flex-col items-center justify-between gap-4
              md:flex-row
            `}
          >
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {SEO_CONFIG.name}. Todos os direitos
              reservados.
            </p>
            <div
              className={
                "flex items-center gap-4 text-sm text-muted-foreground"
              }
            >
              <Link className="hover:text-foreground" href="/privacy">
                Privacidade
              </Link>
              <Link className="hover:text-foreground" href="/terms">
                Termos
              </Link>
              <Link className="hover:text-foreground" href="/cookies">
                Cookies
              </Link>
              <Link className="hover:text-foreground" href="/sitemap">
                Mapa do Site
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
