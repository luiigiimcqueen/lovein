const fs = require('fs');
const path = require('path');

// Caminho para o arquivo de dados
const dataPath = path.join(__dirname, 'data.json');

// Usuário admin com senha já criptografada
const adminUser = {
  id: Date.now(),
  username: 'admin',
  password: '$2b$10$3Qm8Ry0hzS5oQyBVJAzOxuGnPfOQcqVnwm5CnP3d.AQT1YgEVhXnC', // admin123
  name: 'Administrador',
  createdAt: new Date().toISOString()
};

try {
  // Ler o arquivo de dados
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  
  // Adicionar usuário ao array de usuários
  if (!data.users) {
    data.users = [];
  }
  
  // Verificar se já existe um usuário admin
  if (!data.users.some(user => user.username === 'admin')) {
    data.users.push(adminUser);
    console.log('Usuário admin adicionado');
  } else {
    console.log('Usuário admin já existe');
  }
  
  // Salvar dados
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Dados salvos com sucesso');
  
} catch (error) {
  console.error('Erro:', error);
}