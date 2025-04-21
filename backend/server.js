require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const bcrypt = require('bcrypt');
const upload = multer({ storage: multer.memoryStorage() });

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*', // Permite todas as origens
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Caminho para o arquivo de dados
const dataPath = path.join(__dirname, 'data.json');

// Função para ler os dados
const readData = () => {
  console.log('Tentando ler dados do arquivo:', dataPath);
  try {
    if (!fs.existsSync(dataPath)) {
      console.log('Arquivo de dados não existe, criando estrutura padrão');
      const defaultData = { 
        motels: [], 
        siteSettings: {},
        users: [] 
      };
      fs.writeFileSync(dataPath, JSON.stringify(defaultData, null, 2), 'utf8');
      return defaultData;
    }
    
    const data = fs.readFileSync(dataPath, 'utf8');
    console.log('Dados lidos com sucesso');
    const parsedData = JSON.parse(data);
    
    // Garantir que a estrutura de usuários existe
    if (!parsedData.users) {
      parsedData.users = [];
    }
    
    return parsedData;
  } catch (error) {
    console.error('Erro ao ler dados:', error);
    return { motels: [], siteSettings: {}, users: [] };
  }
};

// Função para escrever os dados
const writeData = (data) => {
  console.log('Tentando escrever dados no arquivo:', dataPath);
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Dados escritos com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao escrever dados:', error);
    return false;
  }
};

// Rotas para motéis
app.get('/api/motels', (req, res) => {
  console.log('Recebida requisição GET para /api/motels');
  const data = readData();
  console.log('Dados lidos do arquivo:', data);
  console.log('Motéis encontrados:', data.motels.length);
  console.log('Enviando motéis para o cliente');
  res.json(data.motels);
});

app.get('/api/motels/:id', (req, res) => {
  const data = readData();
  const motel = data.motels.find(m => m.id === parseInt(req.params.id));
  
  if (!motel) {
    return res.status(404).json({ message: 'Motel não encontrado' });
  }
  
  res.json(motel);
});

app.post('/api/motels', (req, res) => {
  console.log('Recebida requisição POST para /api/motels');
  console.log('Corpo da requisição:', req.body);
  
  try {
    const data = readData();
    console.log('Dados atuais lidos com sucesso');
    
    const newMotel = {
      ...req.body,
      id: Date.now(),
      rooms: req.body.rooms || []
    };
    console.log('Novo motel criado:', newMotel);
    
    data.motels.push(newMotel);
    console.log('Motel adicionado ao array de motéis');
    
    if (writeData(data)) {
      console.log('Dados salvos com sucesso');
      res.status(201).json(newMotel);
    } else {
      console.error('Erro ao escrever dados no arquivo');
      res.status(500).json({ message: 'Erro ao salvar o motel' });
    }
  } catch (error) {
    console.error('Erro ao processar requisição POST para /api/motels:', error);
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
});

app.put('/api/motels/:id', (req, res) => {
  const data = readData();
  const motelId = parseInt(req.params.id);
  const motelIndex = data.motels.findIndex(m => m.id === motelId);
  
  if (motelIndex === -1) {
    return res.status(404).json({ message: 'Motel não encontrado' });
  }
  
  const updatedMotel = {
    ...data.motels[motelIndex],
    ...req.body,
    id: motelId,
    rooms: req.body.rooms || data.motels[motelIndex].rooms
  };
  
  data.motels[motelIndex] = updatedMotel;
  
  if (writeData(data)) {
    res.json(updatedMotel);
  } else {
    res.status(500).json({ message: 'Erro ao atualizar o motel' });
  }
});

app.delete('/api/motels/:id', (req, res) => {
  const data = readData();
  const motelId = parseInt(req.params.id);
  const motelIndex = data.motels.findIndex(m => m.id === motelId);
  
  if (motelIndex === -1) {
    return res.status(404).json({ message: 'Motel não encontrado' });
  }
  
  data.motels.splice(motelIndex, 1);
  
  if (writeData(data)) {
    res.json({ message: 'Motel removido com sucesso' });
  } else {
    res.status(500).json({ message: 'Erro ao remover o motel' });
  }
});

// Rotas para quartos
app.post('/api/motels/:id/rooms', (req, res) => {
  const data = readData();
  const motelId = parseInt(req.params.id);
  const motelIndex = data.motels.findIndex(m => m.id === motelId);
  
  if (motelIndex === -1) {
    return res.status(404).json({ message: 'Motel não encontrado' });
  }
  
  const newRoom = {
    ...req.body,
    id: Date.now()
  };
  
  data.motels[motelIndex].rooms.push(newRoom);
  
  if (writeData(data)) {
    res.status(201).json(newRoom);
  } else {
    res.status(500).json({ message: 'Erro ao adicionar o quarto' });
  }
});

app.put('/api/motels/:motelId/rooms/:roomId', (req, res) => {
  const data = readData();
  const motelId = parseInt(req.params.motelId);
  const roomId = parseInt(req.params.roomId);
  
  const motelIndex = data.motels.findIndex(m => m.id === motelId);
  
  if (motelIndex === -1) {
    return res.status(404).json({ message: 'Motel não encontrado' });
  }
  
  const roomIndex = data.motels[motelIndex].rooms.findIndex(r => r.id === roomId);
  
  if (roomIndex === -1) {
    return res.status(404).json({ message: 'Quarto não encontrado' });
  }
  
  const updatedRoom = {
    ...data.motels[motelIndex].rooms[roomIndex],
    ...req.body,
    id: roomId
  };
  
  data.motels[motelIndex].rooms[roomIndex] = updatedRoom;
  
  if (writeData(data)) {
    res.json(updatedRoom);
  } else {
    res.status(500).json({ message: 'Erro ao atualizar o quarto' });
  }
});

app.delete('/api/motels/:motelId/rooms/:roomId', (req, res) => {
  const data = readData();
  const motelId = parseInt(req.params.motelId);
  const roomId = parseInt(req.params.roomId);
  
  const motelIndex = data.motels.findIndex(m => m.id === motelId);
  
  if (motelIndex === -1) {
    return res.status(404).json({ message: 'Motel não encontrado' });
  }
  
  const roomIndex = data.motels[motelIndex].rooms.findIndex(r => r.id === roomId);
  
  if (roomIndex === -1) {
    return res.status(404).json({ message: 'Quarto não encontrado' });
  }
  
  data.motels[motelIndex].rooms.splice(roomIndex, 1);
  
  if (writeData(data)) {
    res.json({ message: 'Quarto removido com sucesso' });
  } else {
    res.status(500).json({ message: 'Erro ao remover o quarto' });
  }
});

// Rotas para configurações do site
app.get('/api/settings', (req, res) => {
  const data = readData();
  res.json(data.siteSettings);
});

app.put('/api/settings', (req, res) => {
  const data = readData();
  
  data.siteSettings = {
    ...data.siteSettings,
    ...req.body
  };
  
  if (writeData(data)) {
    res.json(data.siteSettings);
  } else {
    res.status(500).json({ message: 'Erro ao atualizar as configurações' });
  }
});

// Rota para upload de imagens
app.post('/api/upload', upload.single('image'), async (req, res) => {
  console.log('Recebida requisição de upload de imagem');
  try {
    if (!req.file) {
      console.log('Nenhum arquivo recebido');
      return res.status(400).json({ message: 'Nenhuma imagem enviada' });
    }

    console.log('Arquivo recebido:', req.file.originalname, req.file.mimetype, req.file.size);

    // Converter o buffer para base64
    const base64String = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64String}`;
    
    console.log('Iniciando upload para o Cloudinary...');
    
    // Fazer upload para o Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'motels',
      resource_type: 'image'
    });
    
    console.log('Upload para o Cloudinary concluído:', result.secure_url);
    
    // Retornar a URL da imagem
    res.json({ 
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ message: 'Erro ao fazer upload da imagem', error: error.message });
  }
});

// Rota para upload de múltiplas imagens
app.post('/api/upload-multiple', upload.array('images', 10), async (req, res) => {
  console.log('Recebida requisição de upload múltiplo de imagens');
  try {
    if (!req.files || req.files.length === 0) {
      console.log('Nenhum arquivo recebido');
      return res.status(400).json({ message: 'Nenhuma imagem enviada' });
    }

    console.log(`Recebidos ${req.files.length} arquivos`);
    
    const uploadPromises = req.files.map(async (file) => {
      console.log('Processando arquivo:', file.originalname, file.mimetype, file.size);
      
      // Converter o buffer para base64
      const base64String = file.buffer.toString('base64');
      const dataURI = `data:${file.mimetype};base64,${base64String}`;
      
      console.log('Iniciando upload para o Cloudinary...');
      
      // Fazer upload para o Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'motels/rooms',
        resource_type: 'image'
      });
      
      console.log('Upload para o Cloudinary concluído:', result.secure_url);
      
      return {
        url: result.secure_url,
        public_id: result.public_id
      };
    });

    const results = await Promise.all(uploadPromises);
    console.log('Todos os uploads concluídos com sucesso');
    res.json(results);
  } catch (error) {
    console.error('Erro no upload múltiplo:', error);
    res.status(500).json({ message: 'Erro ao fazer upload das imagens', error: error.message });
  }
});

// Rota para excluir imagem do Cloudinary
app.delete('/api/images/:public_id', async (req, res) => {
  try {
    const public_id = req.params.public_id;
    const result = await cloudinary.uploader.destroy(public_id);
    
    if (result.result === 'ok') {
      res.json({ message: 'Imagem excluída com sucesso' });
    } else {
      res.status(404).json({ message: 'Imagem não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao excluir imagem:', error);
    res.status(500).json({ message: 'Erro ao excluir a imagem' });
  }
});

// Rotas para usuários
app.get('/api/users', (req, res) => {
  const data = readData();
  // Retornar usuários sem as senhas
  const usersWithoutPasswords = data.users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  res.json(usersWithoutPasswords);
});

app.post('/api/users', async (req, res) => {
  try {
    const data = readData();
    const { username, password, name } = req.body;
    
    // Validar campos obrigatórios
    if (!username || !password || !name) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    
    // Verificar se o usuário já existe
    if (data.users.some(user => user.username === username)) {
      return res.status(400).json({ message: 'Este nome de usuário já está em uso' });
    }
    
    // Criptografar a senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Criar novo usuário
    const newUser = {
      id: Date.now(),
      username,
      password: hashedPassword,
      name,
      createdAt: new Date().toISOString()
    };
    
    // Adicionar usuário
    data.users.push(newUser);
    
    // Salvar dados
    if (writeData(data)) {
      // Retornar usuário sem a senha
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } else {
      res.status(500).json({ message: 'Erro ao salvar o usuário' });
    }
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const data = readData();
    const userId = parseInt(req.params.id);
    const { username, password, name } = req.body;
    
    // Encontrar o usuário
    const userIndex = data.users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Verificar se o novo nome de usuário já está em uso por outro usuário
    if (username && username !== data.users[userIndex].username) {
      if (data.users.some(user => user.username === username && user.id !== userId)) {
        return res.status(400).json({ message: 'Este nome de usuário já está em uso' });
      }
    }
    
    // Atualizar usuário
    const updatedUser = { ...data.users[userIndex] };
    
    if (username) updatedUser.username = username;
    if (name) updatedUser.name = name;
    
    // Se a senha foi fornecida, criptografá-la
    if (password) {
      const saltRounds = 10;
      updatedUser.password = await bcrypt.hash(password, saltRounds);
    }
    
    updatedUser.updatedAt = new Date().toISOString();
    
    // Atualizar no array
    data.users[userIndex] = updatedUser;
    
    // Salvar dados
    if (writeData(data)) {
      // Retornar usuário sem a senha
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } else {
      res.status(500).json({ message: 'Erro ao atualizar o usuário' });
    }
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
});

app.delete('/api/users/:id', (req, res) => {
  const data = readData();
  const userId = parseInt(req.params.id);
  
  // Verificar se é o último usuário
  if (data.users.length <= 1) {
    return res.status(400).json({ message: 'Não é possível excluir o último usuário administrador' });
  }
  
  // Encontrar o usuário
  const userIndex = data.users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }
  
  // Remover usuário
  data.users.splice(userIndex, 1);
  
  // Salvar dados
  if (writeData(data)) {
    res.json({ message: 'Usuário removido com sucesso' });
  } else {
    res.status(500).json({ message: 'Erro ao remover o usuário' });
  }
});

// Rota de autenticação
app.post('/api/auth/login', async (req, res) => {
  try {
    const data = readData();
    const { username, password } = req.body;
    
    // Encontrar o usuário pelo nome de usuário
    const user = data.users.find(user => user.username === username);
    
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Verificar a senha
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Retornar usuário sem a senha
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      message: 'Login realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
});

// Rota para verificar se existe pelo menos um usuário, caso contrário criar o admin padrão
app.get('/api/auth/check', async (req, res) => {
  try {
    const data = readData();
    
    // Se não houver usuários, criar o admin padrão
    if (data.users.length === 0) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);
      
      const adminUser = {
        id: Date.now(),
        username: 'admin',
        password: hashedPassword,
        name: 'Administrador',
        createdAt: new Date().toISOString()
      };
      
      data.users.push(adminUser);
      writeData(data);
      
      res.json({ 
        hasUsers: true, 
        message: 'Usuário administrador padrão criado com sucesso' 
      });
    } else {
      res.json({ 
        hasUsers: true, 
        message: 'Existem usuários cadastrados' 
      });
    }
  } catch (error) {
    console.error('Erro ao verificar usuários:', error);
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});