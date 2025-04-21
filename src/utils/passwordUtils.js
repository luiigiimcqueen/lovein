/**
 * Utilitários para criptografia de senhas
 * 
 * Implementação simples para uso no frontend
 * Em um ambiente de produção, use bcrypt no backend
 */

// Função para criar um hash de senha
export function hashPassword(password) {
  // Implementação muito simples para fins de demonstração
  // Em um ambiente real, use bcrypt no backend
  return btoa(password + "_hashed");
}

// Função para verificar uma senha
export function verifyPassword(password, hash) {
  return hash === hashPassword(password);
}