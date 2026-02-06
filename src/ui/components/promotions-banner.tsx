import Link from "next/link";
import { Button } from "~/ui/primitives/button";

export function PromotionsBanner() {
  return (
    <div
      className="relative w-full h-64 rounded-2xl overflow-hidden mb-8 flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #00AA00 0%, #007700 100%)",
      }}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center space-y-4 px-6">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            Consulte os nossos artigos em promoção!
          </h2>
          <p className="text-white/90 text-lg drop-shadow-md">
            Descontos incríveis em artigos selecionados
          </p>
        </div>

        <Button
          asChild
          className="bg-white text-green-700 hover:bg-gray-100 font-semibold px-8 py-3 rounded-full text-base"
        >
          <Link href="/products/promotions">
            Ver Promoções
          </Link>
        </Button>
      </div>
    </div>
  );
}
