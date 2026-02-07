"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, ShoppingCart, ChevronDown, ChevronRight, Heart } from "lucide-react";
import { useCart } from "~/lib/hooks/use-cart";
import { useFavorites } from "~/lib/hooks/use-favorites";
import { useAuth } from "~/lib/auth-context";
import { Button } from "~/ui/primitives/button";
import { Input } from "~/ui/primitives/input";
import { Card, CardContent, CardFooter, CardHeader } from "~/ui/primitives/card";
import { Badge } from "~/ui/primitives/badge";
import { PromotionsBanner } from "~/ui/components/promotions-banner";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { AuthModal } from "~/ui/components/auth-modal";

interface Material {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  image: string;
  categoryId: number;
  priceTypeId: number | null;
  isBestSeller?: boolean;
  attributes?: Record<string, string[]>;
  category?: {
    id: number;
    name: string;
  };
  priceType?: {
    id: number;
    type: string;
  } | null;
}

interface Category {
  id: number;
  name: string;
  parentCategoryId?: number | null;
  subcategories?: Category[];
}

interface CategoryAttribute {
  id: string | number; // Can be string (attribute name) or number
  categoryId: number;
  name: string;
  type: "text" | "select" | "range";
  values?: { id: number; value: string }[];
}

export default function ProductsPage() {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [attributeFilters, setAttributeFilters] = useState<Record<number | string, string[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // Restaurar filtros do localStorage ao montar o componente
  useEffect(() => {
    const savedFilters = localStorage.getItem("productFilters");
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters) as {
          searchTerm?: string;
          selectedCategory?: number | null;
          sortBy?: "name" | "price-asc" | "price-desc";
          minPrice?: string;
          maxPrice?: string;
        };
        setSearchTerm(parsed.searchTerm || "");
        setSelectedCategory(parsed.selectedCategory ?? null);
        setSortBy(parsed.sortBy || "name");
        setMinPrice(parsed.minPrice || "");
        setMaxPrice(parsed.maxPrice || "");
      } catch (error) {
        console.error("Erro ao restaurar filtros:", error);
      }
    }
  }, []);

  // Fetch materials and main categories
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch materials
        const materialsRes = await fetch("/api/materials");
        if (!materialsRes.ok) {
          const errorText = await materialsRes.text();
          console.error("Materials API error:", materialsRes.status, errorText);
          throw new Error(`Failed to fetch materials: ${materialsRes.status}`);
        }
        const materialsData = (await materialsRes.json()) as any;
        console.log("Materials data:", materialsData);
        const materialsList = Array.isArray(materialsData?.data) ? materialsData.data : 
                              Array.isArray(materialsData) ? materialsData : [];
        setMaterials(materialsList);

        // Fetch main categories with subcategories
        const categoriesRes = await fetch("/api/categories?hierarchy=true");
        if (!categoriesRes.ok) {
          const errorText = await categoriesRes.text();
          console.error("Categories API error:", categoriesRes.status, errorText);
          throw new Error(`Failed to fetch categories: ${categoriesRes.status}`);
        }
        const categoriesData = (await categoriesRes.json()) as any;
        console.log("Categories data:", categoriesData);
        const categoriesList = Array.isArray(categoriesData?.data) ? categoriesData.data : 
                               Array.isArray(categoriesData) ? categoriesData : [];
        setMainCategories(categoriesList);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(`Erro ao carregar produtos: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Guardar filtros no localStorage sempre que mudam
  useEffect(() => {
    localStorage.setItem("productFilters", JSON.stringify({
      searchTerm,
      selectedCategory,
      sortBy,
      minPrice,
      maxPrice
    }));
  }, [searchTerm, selectedCategory, sortBy, minPrice, maxPrice]);

  // Fetch category attributes when selected category changes
  useEffect(() => {
    if (selectedCategory === null) {
      setCategoryAttributes([]);
      setAttributeFilters({});
      return;
    }

    async function fetchAttributes() {
      try {
        const res = await fetch(`/api/categories/${selectedCategory}/attributes`);
        if (res.ok) {
          const data = (await res.json()) as any;
          
          // Handle multiple response formats
          const attributesList = Array.isArray(data?.data) ? data.data : 
                                 Array.isArray(data) ? data : [];
          
          if (attributesList.length === 0) {
            setCategoryAttributes([]);
            setAttributeFilters({});
            return;
          }
          
          // Agrupar atributos com o mesmo nome, mas manter nomes para filtros
          const attributesByName = new Map<string, { name: string; values: Set<string> }>();
          
          attributesList.forEach((attr: any) => {
            const normalizedName = attr.name.toLowerCase().trim();
            
            if (!attributesByName.has(normalizedName)) {
              attributesByName.set(normalizedName, {
                name: attr.name,
                values: new Set()
              });
            }
            
            // Adicionar todos os valores para este nome de atributo
            if (Array.isArray(attr.values)) {
              attr.values.forEach((v: string) => {
                if (v && v.trim()) {
                  attributesByName.get(normalizedName)?.values.add(v.trim());
                }
              });
            }
          });
          
          // Converter para o formato esperado - usar nome do atributo para filtering
          const formattedAttrs = Array.from(attributesByName.entries()).map(([normalizedName, attr]) => ({
            id: normalizedName, // Use normalized name as ID for filtering against material.attributes keys
            categoryId: selectedCategory as number,
            name: attr.name, // Display the original name
            type: "select" as const,
            values: Array.from(attr.values)
              .sort()
              .map((v: string, vidx: number) => ({
                id: vidx,
                value: v
              }))
          }));
          
          console.log("📋 Grouped attributes:", formattedAttrs);
          console.log("📊 Raw attributes count:", attributesList.length);
          console.log("📊 Unique attributes after grouping:", formattedAttrs.length);
          setCategoryAttributes(formattedAttrs);
          setAttributeFilters({});
        }
      } catch (error) {
        console.error("❌ Error fetching attributes:", error);
        setCategoryAttributes([]);
      }
    }

    fetchAttributes();
  }, [selectedCategory]);

  // Filter and sort materials
  const filteredMaterials = useMemo(() => {
    let result = [...materials];
    const min = minPrice.trim() ? Number.parseFloat(minPrice) : undefined;
    const max = maxPrice.trim() ? Number.parseFloat(maxPrice) : undefined;

    // Filter by search term
    if (searchTerm.trim()) {
      result = result.filter((m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      );
    }

    // Filter by category (include subcategories)
    if (selectedCategory !== null) {
      // Helper to get all category IDs including subcategories
      const getCategoryIds = (categoryId: number): number[] => {
        const ids = [categoryId];
        const category = findCategoryById(categoryId, mainCategories);
        if (category?.subcategories) {
          category.subcategories.forEach((sub) => {
            ids.push(...getCategoryIds(sub.id));
          });
        }
        return ids;
      };

      // Helper to find category by id recursively
      const findCategoryById = (id: number, cats: Category[]): Category | null => {
        for (const cat of cats) {
          if (cat.id === id) return cat;
          if (cat.subcategories) {
            const found = findCategoryById(id, cat.subcategories);
            if (found) return found;
          }
        }
        return null;
      };

      const categoryIds = getCategoryIds(selectedCategory);
      result = result.filter((m) => categoryIds.includes(m.categoryId));
    }

    if (!Number.isNaN(min) && min !== undefined) {
      result = result.filter((m) => Number.parseFloat(m.price) >= min);
    }

    if (!Number.isNaN(max) && max !== undefined) {
      result = result.filter((m) => Number.parseFloat(m.price) <= max);
    }

    // Filter by attributes
    const activeAttributeFilters = Object.entries(attributeFilters).filter(
      ([, values]) => values.length > 0
    );

    if (activeAttributeFilters.length > 0) {
      result = result.filter((material) => {
        // Check if material has all selected attribute values
        return activeAttributeFilters.every(([attrId, selectedValues]) => {
          const materialAttrs = material.attributes as Record<string, string[]> | undefined;
          if (!materialAttrs) return false;

          const materialAttrValues = materialAttrs[attrId] || [];
          // Check if material has at least one of the selected values for this attribute
          return selectedValues.some((val) =>
            materialAttrValues.some(
              (matVal: string) => matVal.toLowerCase() === val.toLowerCase()
            )
          );
        });
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-desc":
          return parseFloat(b.price) - parseFloat(a.price);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [materials, searchTerm, selectedCategory, sortBy, minPrice, maxPrice, mainCategories, attributeFilters]);

  const bestSellers = useMemo(() => {
    const pinned = filteredMaterials.filter((m) => m.isBestSeller);
    if (pinned.length > 0) {
      return pinned.slice(0, 4);
    }

    return [...filteredMaterials]
      .sort((a, b) => (b.stock || 0) - (a.stock || 0))
      .slice(0, 4);
  }, [filteredMaterials]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<number, number>();
    
    // Helper function to count materials recursively
    const countMaterials = (categoryId: number): number => {
      let count = 0;
      
      // Count materials directly in this category
      count += materials.filter((m) => m.categoryId === categoryId).length;
      
      // Find and count materials in subcategories
      const category = findCategoryById(categoryId, mainCategories);
      if (category?.subcategories) {
        category.subcategories.forEach((sub) => {
          count += countMaterials(sub.id);
        });
      }
      
      return count;
    };

    // Helper to find category by id recursively
    const findCategoryById = (id: number, cats: Category[]): Category | null => {
      for (const cat of cats) {
        if (cat.id === id) return cat;
        if (cat.subcategories) {
          const found = findCategoryById(id, cat.subcategories);
          if (found) return found;
        }
      }
      return null;
    };

    // Calculate counts for all categories
    mainCategories.forEach((cat) => {
      counts.set(cat.id, countMaterials(cat.id));
      if (cat.subcategories) {
        cat.subcategories.forEach((sub) => {
          counts.set(sub.id, countMaterials(sub.id));
        });
      }
    });

    return counts;
  }, [materials, mainCategories]);

  // Adicionar ao carrinho - com verificação de autenticação
  const handleAddToCart = (material: Material) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    addItem(
      {
        id: material.id.toString(),
        name: material.name,
        price: parseFloat(material.price),
        image: material.image,
        category: material.category?.name || "Sem Categoria",
      },
      1
    );
    toast.success(`${material.name} adicionado ao carrinho`);
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">A carregar produtos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Produtos</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm lg:sticky lg:top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
              {/* Header */}
              <div className="border-b border-slate-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-700" />
                    <h2 className="text-sm font-bold text-slate-900">Filtros</h2>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchTerm("");
                      setMinPrice("");
                      setMaxPrice("");
                      setSortBy("name");
                      setAttributeFilters({});
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Limpar
                  </button>
                </div>
              </div>

              {/* Categoria */}
              <div className="border-b border-slate-200 px-4 py-4">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Categoria</h3>
                <ul className="space-y-1">
                  <li>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === null}
                        onChange={() => setSelectedCategory(null)}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 group-hover:text-slate-900">
                        Todas as categorias
                      </span>
                      <span className="ml-auto text-xs text-slate-500">{materials.length}</span>
                    </label>
                  </li>
                  {mainCategories.map((cat) => (
                    <li key={cat.id}>
                      {/* Main Category */}
                      <div className="flex items-center gap-1">
                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <button
                            onClick={() => {
                              setExpandedCategories((prev) => {
                                const next = new Set(prev);
                                if (next.has(cat.id)) {
                                  next.delete(cat.id);
                                } else {
                                  next.add(cat.id);
                                }
                                return next;
                              });
                            }}
                            className="p-0.5 hover:bg-slate-100 rounded"
                          >
                            {expandedCategories.has(cat.id) ? (
                              <ChevronDown className="w-4 h-4 text-slate-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-600" />
                            )}
                          </button>
                        )}
                        <label className="flex flex-1 items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="category"
                            checked={selectedCategory === cat.id}
                            onChange={() => setSelectedCategory(cat.id)}
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-slate-800 group-hover:text-slate-900">
                            {cat.name}
                          </span>
                          <span className="ml-auto text-xs text-slate-500">
                            {categoryCounts.get(cat.id) || 0}
                          </span>
                        </label>
                      </div>

                      {/* Subcategories */}
                      {cat.subcategories && cat.subcategories.length > 0 && expandedCategories.has(cat.id) && (
                        <ul className="ml-6 mt-1 space-y-1 border-l-2 border-slate-200 pl-3">
                          {cat.subcategories.map((subcat) => (
                            <li key={subcat.id}>
                              <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                  type="radio"
                                  name="category"
                                  checked={selectedCategory === subcat.id}
                                  onChange={() => setSelectedCategory(subcat.id)}
                                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700 group-hover:text-slate-900">
                                  {subcat.name}
                                </span>
                                <span className="ml-auto text-xs text-slate-500">
                                  {categoryCounts.get(subcat.id) || 0}
                                </span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preço */}
              <div className="border-b border-slate-200 px-4 py-4">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Preço (€)</h3>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Mín"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="h-9 text-sm"
                  />
                  <span className="text-slate-400">-</span>
                  <Input
                    type="number"
                    placeholder="Máx"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* Atributos Dinâmicos */}
              {categoryAttributes.length > 0 && (
                <>
                  {categoryAttributes.map((attr) => (
                    <div key={attr.id} className="border-b border-slate-200 px-4 py-4 last:border-0">
                      <h3 className="text-sm font-bold text-slate-900 mb-3">{attr.name}</h3>
                      
                      {attr.type === "select" && (
                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                          {attr.values?.map((val) => (
                            <li key={val.id}>
                              <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={attributeFilters[attr.id]?.includes(val.value) || false}
                                  onChange={(e) => {
                                    setAttributeFilters((prev) => {
                                      const current = prev[attr.id] || [];
                                      return {
                                        ...prev,
                                        [attr.id]: e.target.checked
                                          ? [...current, val.value]
                                          : current.filter((v) => v !== val.value),
                                      };
                                    });
                                  }}
                                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700 group-hover:text-slate-900">
                                  {val.value}
                                </span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      )}

                      {attr.type === "text" && (
                        <Input
                          type="text"
                          placeholder={`Pesquisar...`}
                          value={attributeFilters[attr.id]?.[0] || ""}
                          onChange={(e) => {
                            setAttributeFilters((prev) => ({
                              ...prev,
                              [attr.id]: e.target.value.trim() ? [e.target.value] : [],
                            }));
                          }}
                          className="h-9 text-sm"
                        />
                      )}

                      {attr.type === "range" && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Mín"
                            value={attributeFilters[attr.id]?.[0] || ""}
                            onChange={(e) => {
                              setAttributeFilters((prev) => {
                                const current = prev[attr.id] || ["", ""];
                                current[0] = e.target.value;
                                return {
                                  ...prev,
                                  [attr.id]: current,
                                };
                              });
                            }}
                            className="h-9 text-sm"
                          />
                          <span className="text-slate-400">-</span>
                          <Input
                            type="number"
                            placeholder="Máx"
                            value={attributeFilters[attr.id]?.[1] || ""}
                            onChange={(e) => {
                              setAttributeFilters((prev) => {
                                const current = prev[attr.id] || ["", ""];
                                current[1] = e.target.value;
                                return {
                                  ...prev,
                                  [attr.id]: current,
                                };
                              });
                            }}
                            className="h-9 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </aside>

          <section>
            <PromotionsBanner />
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Pesquisar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 whitespace-nowrap">
                  {filteredMaterials.length} produto(s)
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "name" | "price-asc" | "price-desc")}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="name">Ordenar: Nome</option>
                  <option value="price-asc">Ordenar: Preço (Menor)</option>
                  <option value="price-desc">Ordenar: Preço (Maior)</option>
                </select>
              </div>
            </div>

            {bestSellers.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-slate-900">Mais vendidos</h2>
                  <span className="text-xs text-slate-500">Atualizado pelos filtros</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {bestSellers.map((material) => (
                    <Card key={`best-${material.id}`} className="flex flex-col hover:shadow-md transition-shadow">
                      <CardHeader className="p-0">
                        <div className="relative w-full h-36 bg-slate-100 rounded-t-lg overflow-hidden">
                          <Image
                            src={material.image || "/images/placeholder.png"}
                            alt={material.name}
                            fill
                            className="object-cover"
                          />
                          <Button
                            className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/90"
                            onClick={() => {
                              if (!isAuthenticated) {
                                setShowAuthModal(true);
                                return;
                              }
                              toggleFavorite(material.id);
                            }}
                            size="icon"
                            type="button"
                            variant="outline"
                          >
                            <Heart
                              className={
                                isFavorite(material.id)
                                  ? "h-4 w-4 fill-red-500 text-red-500"
                                  : "h-4 w-4 text-slate-500"
                              }
                            />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 p-3">
                        <Link
                          href={`/products/${material.id}`}
                          className="text-sm font-semibold text-slate-900 mb-1 line-clamp-2 hover:text-blue-700"
                        >
                          {material.name}
                        </Link>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-blue-600">
                            €{Number.parseFloat(material.price).toFixed(2)}
                          </span>
                          {material.priceType && (
                            <span className="text-xs text-slate-500">
                              / {material.priceType.type}
                            </span>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 pt-0">
                        <Button
                          className="w-full"
                          onClick={() => handleAddToCart(material)}
                          disabled={material.stock <= 0}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {material.stock <= 0 ? "Sem Stock" : "Adicionar"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {filteredMaterials.length === 0 ? (
              <Card className="p-12">
                <div className="text-center text-slate-500">
                  <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhum produto encontrado</p>
                  <p className="text-sm mt-2">Tente ajustar os filtros ou termo de pesquisa</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredMaterials.map((material) => (
                  <Card key={material.id} className="flex flex-col hover:shadow-md transition-shadow">
                    <CardHeader className="p-0">
                      <div className="relative w-full h-44 bg-slate-100 rounded-t-lg overflow-hidden">
                        <Image
                          src={material.image || "/images/placeholder.png"}
                          alt={material.name}
                          fill
                          className="object-cover"
                        />
                        <Button
                          className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/90"
                          onClick={() => {
                            if (!isAuthenticated) {
                              setShowAuthModal(true);
                              return;
                            }
                            toggleFavorite(material.id);
                          }}
                          size="icon"
                          type="button"
                          variant="outline"
                        >
                          <Heart
                            className={
                              isFavorite(material.id)
                                ? "h-4 w-4 fill-red-500 text-red-500"
                                : "h-4 w-4 text-slate-500"
                            }
                          />
                        </Button>
                        {material.stock <= 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="destructive">Sem Stock</Badge>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-3">
                      {material.category && (
                        <Badge variant="outline" className="text-[10px] mb-2">
                          {material.category.name}
                        </Badge>
                      )}
                      <Link
                        href={`/products/${material.id}`}
                        className="text-sm font-semibold text-slate-900 mb-1 line-clamp-2 hover:text-blue-700"
                      >
                        {material.name}
                      </Link>
                      {material.description && (
                        <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                          {material.description}
                        </p>
                      )}
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-blue-600">
                          €{Number.parseFloat(material.price).toFixed(2)}
                        </span>
                        {material.priceType && (
                          <span className="text-xs text-slate-500">
                            / {material.priceType.type}
                          </span>
                        )}
                      </div>
                      {material.stock > 0 && material.stock <= 10 && (
                        <p className="text-xs text-amber-600 mt-2">
                          Apenas {material.stock} em stock
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="p-3 pt-0">
                      <Button
                        className="w-full"
                        onClick={() => handleAddToCart(material)}
                        disabled={material.stock <= 0}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {material.stock <= 0 ? "Sem Stock" : "Adicionar"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
