const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const dataPath = path.join(__dirname, 'data.json');
console.log('Caminho do arquivo de dados:', dataPath);

async function createAdmin() {
  try {
    console.log('Lendo arquivo de dados...');
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(dataPath)) {
      console.error('Arquivo de dados não encontrado!');
      return;
    }
    
    // Ler o arquivo de dados
    const fileContent = fs.readFileSync(dataPath, 'utf8');
    console.log('Conteúdo do arquivo lido:', fileContent.substring(0, 100) + '...');
    
    const data = JSON.parse(fileContent);
    console.log('Dados parseados com sucesso');
    
    // Verificar se já existe um usuário admin
    if (data.users && data.users.some(user => user.username === 'admin')) {
      console.log('Usuário admin já existe!');
      return;
    }
    
    console.log('Criando hash da senha...');
    // Criar hash da senha
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Hash criado:', hashedPassword);
    
    // Criar usuário admin
    const adminUser = {
      id: Date.now(),
      username: 'admin',
      password: hashedPassword,
      name: 'Administrador',
      createdAt: new Date().toISOString()
    };
    
    console.log('Usuário admin criado:', { ...adminUser, password: '***' });
    
    // Adicionar usuário ao array de usuários
    if (!data.users) {
      console.log('Criando array de usuários...');
      data.users = [];
    }
    
    data.users.push(adminUser);
    console.log('Usuário adicionado ao array');
    
    // Salvar dados
    console.log('Salvando dados...');
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log('Usuário admin criado com sucesso!');
    console.log('Username: admin');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  }
}

createAdmin();const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const dataPath = path.join(__dirname, 'data.json');

async function createAdmin() {
  try {
    // Ler o arquivo de dados
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Verificar se já existe um usuário admin
    if (data.users && data.users.some(user => user.username === 'admin')) {
      console.log('Usuário admin já existe!');
      return;
    }
    
    // Criar hash da senha
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Criar usuário admin
    const adminUser = {
      id: Date.now(),
      username: 'admin',
      password: hashedPassword,
      name: 'Administrador',
      createdAt: new Date().toISOString()
    };
    
    // Adicionar usuário ao array de usuários
    if (!data.users) {
      data.users = [];
    }
    
    data.users.push(adminUser);
    
    // Salvar dados
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log('Usuário admin criado com sucesso!');
    console.log('Username: admin');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  }
}

createAdmin();