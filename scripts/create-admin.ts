/**
 * Script para criar utilizador admin
 * 
 * Executar: npx tsx scripts/create-admin.ts
 */

import { createUser, getUserByEmail } from "~/lib/auth-comfilar";

async function createAdmin() {
  const adminEmail = "admin@comfilar.pt";
  const adminPassword = "Admin@123"; // Altere esta password após o primeiro login!
  const adminName = "Administrador";

  console.log("🔍 Verificando se admin já existe...");
  
  const existingAdmin = await getUserByEmail(adminEmail);
  
  if (existingAdmin) {
    console.log("❌ Utilizador admin já existe!");
    console.log("Email:", adminEmail);
    console.log("ID:", existingAdmin.id);
    return;
  }

  console.log("✨ Criando novo utilizador admin...");

  try {
    const admin = await createUser({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      type: "admin",
    });

    if (!admin) {
      console.error("❌ Erro ao criar admin: createUser retornou null");
      throw new Error("Failed to create admin user");
    }

    console.log("✅ Utilizador admin criado com sucesso!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:", adminEmail);
    console.log("🔑 Password:", adminPassword);
    console.log("👤 Nome:", adminName);
    console.log("🆔 ID:", admin.id);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️  IMPORTANTE: Altere a password após o primeiro login!");
  } catch (error) {
    console.error("❌ Erro ao criar admin:", error);
    throw error;
  }
}

createAdmin()
  .then(() => {
    console.log("✅ Script concluído!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });
