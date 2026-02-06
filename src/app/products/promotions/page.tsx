"use client";

import Link from "next/link";
import { Button } from "~/ui/primitives/button";
import { Card } from "~/ui/primitives/card";

export default function PromotionsPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-16">
      <div className="mb-8 rounded-xl border bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-8">
        <h1 className="text-3xl font-bold text-slate-900">Promoções</h1>
        <p className="text-slate-600">Fique atento aos nossos artigos em promoção</p>
      </div>

      <Card className="p-12">
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-slate-900">Ainda não temos promoções</h2>
          <p className="text-slate-600 max-w-md mx-auto">
            Estamos a preparar as melhores ofertas para ti. Volta mais tarde para descobrir promoções incríveis!
          </p>
          <Button asChild className="mt-6">
            <Link href="/products">
              Ver todos os produtos
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
