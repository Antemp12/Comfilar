/**
 * Script para criar utilizador funcionário
 * 
 * Executar: npx tsx scripts/create-funcionario.ts
 */

import { createUser, getUserByEmail } from "~/lib/auth-comfilar";

async function createFuncionario() {
  const funcionarioEmail = "funcionario@comfilar.pt";
  const funcionarioPassword = "Func@123"; // Altere esta password após o primeiro login!
  const funcionarioName = "Funcionário Comfilar";

  console.log("🔍 Verificando se funcionário já existe...");
  
  const existingFuncionario = await getUserByEmail(funcionarioEmail);
  
  if (existingFuncionario) {
    console.log("❌ Utilizador funcionário já existe!");
    console.log("Email:", funcionarioEmail);
    console.log("ID:", existingFuncionario.id);
    return;
  }

  console.log("✨ Criando novo utilizador funcionário...");

  try {
    const funcionario = await createUser({
      name: funcionarioName,
      email: funcionarioEmail,
      password: funcionarioPassword,
      type: "funcionario",
    });

    if (!funcionario) {
      console.error("❌ Erro ao criar funcionário: createUser retornou null");
      throw new Error("Failed to create funcionario user");
    }

    console.log("✅ Utilizador funcionário criado com sucesso!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:", funcionarioEmail);
    console.log("🔑 Password:", funcionarioPassword);
    console.log("👤 Nome:", funcionarioName);
    console.log("🆔 ID:", funcionario.id);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️  IMPORTANTE: Altere a password após o primeiro login!");
  } catch (error) {
    console.error("❌ Erro ao criar funcionário:", error);
    throw error;
  }
}

createFuncionario()
  .then(() => {
    console.log("✅ Script concluído!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });
