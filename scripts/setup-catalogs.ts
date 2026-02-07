import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "comfilar",
});

async function setup() {
  console.log("🚀 Iniciando setup...");

  try {
    // Adicionar coluna de imagem na tabela categoria (se não existir)
    console.log("📝 Adicionando coluna de imagem na tabela categoria...");
    try {
      await connection.execute(
        "ALTER TABLE categoria ADD COLUMN image TEXT AFTER id_categoria_pai"
      );
      console.log("✅ Coluna de imagem adicionada à categoria");
    } catch (err: any) {
      if (err.code === "ER_DUP_FIELDNAME") {
        console.log("✅ Coluna de imagem já existe na categoria");
      } else {
        throw err;
      }
    }

    // Limpar catálogos existentes
    console.log("🗑️ Limpando catálogos antigos...");
    await connection.execute("DELETE FROM catalogs");

    // Inserir catálogos de exemplo
    console.log("📸 Inserindo catálogos...");
    await connection.execute(
      `INSERT INTO catalogs (id, title, description, image_url, \`order\`) VALUES
      ('catalog-1', 'Promoção Especial - Casas de Banho', 'Descubra as melhores ofertas em revestimentos para casas de banho com até 50% de desconto', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1920&q=85&fm=webp', 1),
      ('catalog-2', 'Novidade - Pavimentos Premium', 'Explore nossa nova coleção de pavimentos em estilo moderno e contemporâneo', 'https://images.unsplash.com/photo-1509303226517-a0842adc3f73?w=1920&q=85&fm=webp', 2),
      ('catalog-3', 'Climatização Inteligente', 'Sistemas de climatização eficientes para conforto máximo em sua casa ou empresa', 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1920&q=85&fm=webp', 3)`
    );
    console.log("✅ Catálogos inseridos com sucesso");

    console.log("✨ Setup concluído!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro durante setup:", error);
    process.exit(1);
  }
}

setup();
