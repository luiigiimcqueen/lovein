// URL base da API
const API_URL = 'http://localhost:3001/api';

// Funções para interagir com a API
export const api = {
  // Autenticação
  login: async (username, password) => {
    try {
      console.log('Tentando login com:', { username });
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      console.log('Resposta do servidor:', response.status, response.statusText);
      
      // Se a resposta não for ok, tenta obter a mensagem de erro
      if (!response.ok) {
        let errorMessage = 'Falha na autenticação';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // Se não conseguir parsear o JSON, usa o texto da resposta
          const errorText = await response.text();
          console.error('Resposta não-JSON:', errorText);
          errorMessage = `Erro no servidor: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Login bem-sucedido:', data);
      return data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },
  
  checkAuth: async () => {
    try {
      console.log('Verificando autenticação...');
      
      const response = await fetch(`${API_URL}/auth/check`);
      console.log('Resposta da verificação:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = 'Falha ao verificar autenticação';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          const errorText = await response.text();
          console.error('Resposta não-JSON:', errorText);
          errorMessage = `Erro no servidor: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Verificação bem-sucedida:', data);
      return data;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      throw error;
    }
  },
  
  // Usuários
  getUsers: async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) throw new Error('Falha ao buscar usuários');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  },
  
  addUser: async (user) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao adicionar usuário');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      throw error;
    }
  },
  
  updateUser: async (id, user) => {
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao atualizar usuário');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  },
  
  deleteUser: async (id) => {
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao remover usuário');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      throw error;
    }
  },
  // Upload de imagens
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Falha no upload da imagem');
      return await response.json();
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw error;
    }
  },
  
  uploadMultipleImages: async (files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      
      const response = await fetch(`${API_URL}/upload-multiple`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Falha no upload das imagens');
      return await response.json();
    } catch (error) {
      console.error('Erro ao fazer upload das imagens:', error);
      throw error;
    }
  },
  
  deleteImage: async (publicId) => {
    try {
      const response = await fetch(`${API_URL}/images/${publicId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Falha ao excluir a imagem');
      return await response.json();
    } catch (error) {
      console.error('Erro ao excluir imagem:', error);
      throw error;
    }
  },

  // Motéis
  getMotels: async () => {
    console.log('api.getMotels chamado');
    try {
      console.log('Fazendo requisição para', `${API_URL}/motels`);
      const response = await fetch(`${API_URL}/motels`);
      console.log('Resposta recebida:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta:', errorText);
        throw new Error(`Falha ao buscar motéis: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Dados recebidos:', data);
      console.log('Número de motéis:', data.length);
      return data;
    } catch (error) {
      console.error('Erro ao buscar motéis:', error);
      // Fallback para localStorage se a API falhar
      console.log('Usando fallback para localStorage');
      const saved = localStorage.getItem("motels");
      const data = saved ? JSON.parse(saved) : [];
      console.log('Dados do localStorage:', data);
      return data;
    }
  },

  getMotel: async (id) => {
    try {
      const response = await fetch(`${API_URL}/motels/${id}`);
      if (!response.ok) throw new Error('Falha ao buscar motel');
      return await response.json();
    } catch (error) {
      console.error(`Erro ao buscar motel ${id}:`, error);
      // Fallback para localStorage se a API falhar
      const saved = localStorage.getItem("motels");
      if (saved) {
        const motels = JSON.parse(saved);
        return motels.find(m => m.id === parseInt(id)) || null;
      }
      return null;
    }
  },

  addMotel: async (motel) => {
    console.log('api.addMotel chamado com:', motel);
    try {
      // Preparar os dados para envio, removendo propriedades que não devem ir para o backend
      const motelData = { 
        ...motel,
        // Remover propriedades de controle de UI
        logoLoading: undefined
      };
      
      console.log('Enviando motel para o backend:', motelData);
      
      const response = await fetch(`${API_URL}/motels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(motelData),
      });
      
      console.log('Resposta do backend:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta do backend:', errorText);
        throw new Error(`Falha ao adicionar motel: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('Dados recebidos do backend:', responseData);
      return responseData;
    } catch (error) {
      console.error('Erro ao adicionar motel:', error);
      console.log('Usando fallback para localStorage');
      
      // Fallback para localStorage se a API falhar
      const saved = localStorage.getItem("motels");
      const motels = saved ? JSON.parse(saved) : [];
      
      // Remover propriedades de controle de UI
      const { logoLoading, ...motelData } = motel;
      
      const newMotel = { ...motelData, id: Date.now(), rooms: [] };
      console.log('Novo motel criado localmente:', newMotel);
      
      motels.push(newMotel);
      localStorage.setItem("motels", JSON.stringify(motels));
      return newMotel;
    }
  },

  updateMotel: async (id, motel) => {
    try {
      // Preparar os dados para envio, removendo propriedades que não devem ir para o backend
      const motelData = { 
        ...motel,
        // Remover propriedades de controle de UI
        logoLoading: undefined
      };
      
      console.log('Atualizando motel no backend:', motelData);
      
      const response = await fetch(`${API_URL}/motels/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(motelData),
      });
      
      if (!response.ok) throw new Error('Falha ao atualizar motel');
      return await response.json();
    } catch (error) {
      console.error(`Erro ao atualizar motel ${id}:`, error);
      // Fallback para localStorage se a API falhar
      const saved = localStorage.getItem("motels");
      if (saved) {
        const motels = JSON.parse(saved);
        const index = motels.findIndex(m => m.id === parseInt(id));
        if (index !== -1) {
          // Remover propriedades de controle de UI
          const { logoLoading, ...motelData } = motel;
          
          motels[index] = { ...motels[index], ...motelData, id: parseInt(id) };
          localStorage.setItem("motels", JSON.stringify(motels));
          return motels[index];
        }
      }
      return null;
    }
  },

  deleteMotel: async (id) => {
    try {
      const response = await fetch(`${API_URL}/motels/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Falha ao remover motel');
      return await response.json();
    } catch (error) {
      console.error(`Erro ao remover motel ${id}:`, error);
      // Fallback para localStorage se a API falhar
      const saved = localStorage.getItem("motels");
      if (saved) {
        const motels = JSON.parse(saved);
        const filtered = motels.filter(m => m.id !== parseInt(id));
        localStorage.setItem("motels", JSON.stringify(filtered));
      }
      return { message: 'Motel removido com sucesso (local)' };
    }
  },

  // Quartos
  addRoom: async (motelId, room) => {
    try {
      // Preparar os dados para envio, removendo propriedades que não devem ir para o backend
      const roomData = { 
        ...room,
        // Remover propriedades de controle de UI
        imagesLoading: undefined
      };
      
      console.log('Adicionando quarto ao backend:', roomData);
      
      const response = await fetch(`${API_URL}/motels/${motelId}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      });
      
      if (!response.ok) throw new Error('Falha ao adicionar quarto');
      return await response.json();
    } catch (error) {
      console.error(`Erro ao adicionar quarto ao motel ${motelId}:`, error);
      // Fallback para localStorage se a API falhar
      const saved = localStorage.getItem("motels");
      if (saved) {
        const motels = JSON.parse(saved);
        const index = motels.findIndex(m => m.id === parseInt(motelId));
        if (index !== -1) {
          // Remover propriedades de controle de UI
          const { imagesLoading, ...roomData } = room;
          
          const newRoom = { ...roomData, id: Date.now() };
          motels[index].rooms.push(newRoom);
          localStorage.setItem("motels", JSON.stringify(motels));
          return newRoom;
        }
      }
      return null;
    }
  },

  updateRoom: async (motelId, roomId, room) => {
    try {
      // Preparar os dados para envio, removendo propriedades que não devem ir para o backend
      const roomData = { 
        ...room,
        // Remover propriedades de controle de UI
        imagesLoading: undefined
      };
      
      console.log('Atualizando quarto no backend:', roomData);
      
      const response = await fetch(`${API_URL}/motels/${motelId}/rooms/${roomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      });
      
      if (!response.ok) throw new Error('Falha ao atualizar quarto');
      return await response.json();
    } catch (error) {
      console.error(`Erro ao atualizar quarto ${roomId} do motel ${motelId}:`, error);
      // Fallback para localStorage se a API falhar
      const saved = localStorage.getItem("motels");
      if (saved) {
        const motels = JSON.parse(saved);
        const motelIndex = motels.findIndex(m => m.id === parseInt(motelId));
        if (motelIndex !== -1) {
          const roomIndex = motels[motelIndex].rooms.findIndex(r => r.id === parseInt(roomId));
          if (roomIndex !== -1) {
            // Remover propriedades de controle de UI
            const { imagesLoading, ...roomData } = room;
            
            motels[motelIndex].rooms[roomIndex] = { 
              ...motels[motelIndex].rooms[roomIndex], 
              ...roomData, 
              id: parseInt(roomId) 
            };
            localStorage.setItem("motels", JSON.stringify(motels));
            return motels[motelIndex].rooms[roomIndex];
          }
        }
      }
      return null;
    }
  },

  deleteRoom: async (motelId, roomId) => {
    try {
      const response = await fetch(`${API_URL}/motels/${motelId}/rooms/${roomId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Falha ao remover quarto');
      return await response.json();
    } catch (error) {
      console.error(`Erro ao remover quarto ${roomId} do motel ${motelId}:`, error);
      // Fallback para localStorage se a API falhar
      const saved = localStorage.getItem("motels");
      if (saved) {
        const motels = JSON.parse(saved);
        const motelIndex = motels.findIndex(m => m.id === parseInt(motelId));
        if (motelIndex !== -1) {
          motels[motelIndex].rooms = motels[motelIndex].rooms.filter(r => r.id !== parseInt(roomId));
          localStorage.setItem("motels", JSON.stringify(motels));
        }
      }
      return { message: 'Quarto removido com sucesso (local)' };
    }
  },

  // Configurações do site
  getSettings: async () => {
    try {
      const response = await fetch(`${API_URL}/settings`);
      if (!response.ok) throw new Error('Falha ao buscar configurações');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      // Fallback para localStorage se a API falhar
      const saved = localStorage.getItem("siteSettings");
      return saved ? JSON.parse(saved) : {
        siteName: "Portal de Motéis",
        logo: null,
        footerText: "© 2024 Portal de Motéis. Todos os direitos reservados.",
        contactEmail: "contato@portaldemoteis.com",
        contactPhone: "(11) 99999-9999"
      };
    }
  },

  updateSettings: async (settings) => {
    try {
      const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('Falha ao atualizar configurações');
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      // Fallback para localStorage se a API falhar
      localStorage.setItem("siteSettings", JSON.stringify(settings));
      return settings;
    }
  }
};