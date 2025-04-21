// Script para resetar o usuário admin
import { hashPassword } from './passwordUtils';

export function resetAdminUser() {
  // Criar usuário padrão com senha criptografada
  const hashedPassword = hashPassword("admin123");
  
  const defaultUser = {
    id: 1,
    username: "admin",
    password: hashedPassword,
    name: "Administrador"
  };
  
  // Salvar no localStorage
  localStorage.setItem("adminUsers", JSON.stringify([defaultUser]));
  
  console.log("Usuário admin resetado com sucesso!");
  console.log("Username: admin");
  console.log("Password: admin123");
  console.log("Hash da senha:", hashedPassword);
  
  return defaultUser;
}