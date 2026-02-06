// src/db/seed.ts
// Run with: bun src/db/seed.ts

import process from "node:process";
import { db } from "~/db";
import {
  categoriesTable,
  materialsTable,
} from "~/db/schema";

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Create categories
    const categories = [
      {
        name: "Cimento e Aglomerantes",
        description: "Cimentos, argamassas e outros aglomerantes",
      },
      {
        name: "Materiais de Construção",
        description: "Tijolos, blocos, telhas e material de alvenaria",
      },
      {
        name: "Madeira e Derivados",
        description: "Madeiras, contraplacados e painéis",
      },
      {
        name: "Ferragens e Fixações",
        description: "Parafusos, pregos, âncoras e fixações",
      },
      {
        name: "Isolamento e Impermeabilização",
        description: "Cortiça, poliestireno, membranas impermeáveis",
      },
      {
        name: "Tinta e Acabamentos",
        description: "Tintas, vernizes e produtos de acabamento",
      },
    ];

    // Insert categories and get their IDs
    const insertedCategories = [];
    for (const category of categories) {
      const [result] = await db.insert(categoriesTable).values(category);
      insertedCategories.push({ ...category, id: result.insertId });
    }

    console.log(`✅ ${insertedCategories.length} categories created`);

    // Create sample materials
    const materials = [
      {
        name: "Cimento Portland 25kg",
        description: "Saco de cimento portland de alta resistência",
        categoryId: insertedCategories[0].id,
        price: "6.50",
        stock: 150,
        image: "https://via.placeholder.com/300x300?text=Cimento",
      },
      {
        name: "Argamassa Colante 20kg",
        description: "Argamassa colante flexível para azulejos",
        categoryId: insertedCategories[0].id,
        price: "12.99",
        stock: 80,
        image: "https://via.placeholder.com/300x300?text=Argamassa",
      },
      {
        name: "Tijolos Cerâmicos 6 Furos",
        description: "Unidade de tijolo cerâmico de 6 furos",
        categoryId: insertedCategories[1].id,
        price: "0.45",
        stock: 5000,
        image: "https://via.placeholder.com/300x300?text=Tijolos",
      },
      {
        name: "Blocos de Betão 40x20x20",
        description: "Bloco de betão para construção estrutural",
        categoryId: insertedCategories[1].id,
        price: "1.20",
        stock: 2000,
        image: "https://via.placeholder.com/300x300?text=Blocos",
      },
      {
        name: "Madeira de Pinho 3x10x250",
        description: "Prancha de pinho tratada para construção",
        categoryId: insertedCategories[2].id,
        price: "8.75",
        stock: 120,
        image: "https://via.placeholder.com/300x300?text=Madeira",
      },
      {
        name: "Contraplacado 18mm",
        description: "Painel de contraplacado de 18mm de espessura",
        categoryId: insertedCategories[2].id,
        price: "25.00",
        stock: 60,
        image: "https://via.placeholder.com/300x300?text=Contraplacado",
      },
      {
        name: "Parafusos 3.5x35mm (100 un.)",
        description: "Caixa com 100 parafusos roscados",
        categoryId: insertedCategories[3].id,
        price: "3.50",
        stock: 300,
        image: "https://via.placeholder.com/300x300?text=Parafusos",
      },
      {
        name: "Poliestireno Expandido 40mm",
        description: "Placa de poliestireno expandido para isolamento",
        categoryId: insertedCategories[4].id,
        price: "15.99",
        stock: 90,
        image: "https://via.placeholder.com/300x300?text=Isolamento",
      },
      {
        name: "Tinta Acrílica Branca 18L",
        description: "Tinta acrílica branca para interiores",
        categoryId: insertedCategories[5].id,
        price: "45.00",
        stock: 45,
        image: "https://via.placeholder.com/300x300?text=Tinta",
      },
      {
        name: "Verniz Polyuretano 5L",
        description: "Verniz polyuretano brilhante para madeiras",
        categoryId: insertedCategories[5].id,
        price: "65.00",
        stock: 30,
        image: "https://via.placeholder.com/300x300?text=Verniz",
      },
    ];

    // Insert materials
    for (const material of materials) {
      await db.insert(materialsTable).values(material);
    }

    console.log(`✅ ${materials.length} materials created`);
    console.log("🌱 Database seed completed successfully!");

  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
