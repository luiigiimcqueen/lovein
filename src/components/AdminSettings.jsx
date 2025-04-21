import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Plus, Edit, Trash, Upload, User, Lock, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { hashPassword, verifyPassword } from "@/utils/passwordUtils";

export default function AdminSettings({ onClose, siteSettings, setSiteSettings }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState("site");
  
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [newUser, setNewUser] = React.useState({ username: "", password: "", name: "" });
  const [editingUser, setEditingUser] = React.useState(null);
  
  // Carregar usuários do localStorage
  React.useEffect(() => {
    const loadUsers = () => {
      try {
        setLoading(true);
        const savedUsers = localStorage.getItem("adminUsers");
        const parsedUsers = savedUsers ? JSON.parse(savedUsers) : [];
        
        // Remover as senhas dos usuários para exibição
        const usersWithoutPasswords = parsedUsers.map(user => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        });
        
        setUsers(usersWithoutPasswords);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de usuários.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, [toast]);
  
  React.useEffect(() => {
    localStorage.setItem("siteSettings", JSON.stringify(siteSettings));
  }, [siteSettings]);
  
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 2 * 1024 * 1024; // 2MB limit
      
      if (!isValidType) {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de imagem.",
          variant: "destructive"
        });
        return;
      }
      
      if (!isValidSize) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 2MB.",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSiteSettings(prev => ({ ...prev, logo: reader.result }));
        toast({
          title: "Sucesso",
          description: "Logo atualizado com sucesso!"
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSiteSettingChange = (e) => {
    const { name, value } = e.target;
    setSiteSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveSettings = () => {
    try {
      localStorage.setItem("siteSettings", JSON.stringify(siteSettings));
      toast({
        title: "Configurações salvas",
        description: "As configurações do site foram atualizadas com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    }
  };
  
  const handleAddUser = () => {
    if (!newUser.username || (!editingUser && !newUser.password) || !newUser.name) {
      toast({
        title: "Erro",
        description: editingUser 
          ? "Nome de usuário e nome completo são obrigatórios." 
          : "Todos os campos são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setActionLoading(true);
      
      // Buscar todos os usuários
      const savedUsers = localStorage.getItem("adminUsers");
      const allUsers = savedUsers ? JSON.parse(savedUsers) : [];
      
      // Verificar se o nome de usuário já existe (exceto para o usuário em edição)
      if (!editingUser && allUsers.some(user => user.username === newUser.username)) {
        toast({
          title: "Erro",
          description: "Este nome de usuário já está em uso.",
          variant: "destructive"
        });
        setActionLoading(false);
        return;
      }
      
      if (editingUser) {
        // Atualizar usuário existente
        const updatedUsers = allUsers.map(user => {
          if (user.id === editingUser.id) {
            // Se a senha foi fornecida, criptografá-la
            if (newUser.password) {
              const hashedPassword = hashPassword(newUser.password);
              return { 
                ...user, 
                username: newUser.username, 
                name: newUser.name,
                password: hashedPassword
              };
            } else {
              // Manter a senha atual
              return { 
                ...user, 
                username: newUser.username, 
                name: newUser.name 
              };
            }
          }
          return user;
        });
        
        localStorage.setItem("adminUsers", JSON.stringify(updatedUsers));
        
        // Atualizar a lista de usuários (sem senhas)
        setUsers(updatedUsers.map(user => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        }));
        
        setEditingUser(null);
        toast({
          title: "Usuário atualizado",
          description: "As informações do usuário foram atualizadas com sucesso!"
        });
      } else {
        // Adicionar novo usuário
        const hashedPassword = hashPassword(newUser.password);
        
        const newUserWithId = { 
          ...newUser, 
          id: Date.now(),
          password: hashedPassword
        };
        
        const updatedUsers = [...allUsers, newUserWithId];
        localStorage.setItem("adminUsers", JSON.stringify(updatedUsers));
        
        // Adicionar à lista de usuários (sem senha)
        const { password, ...newUserWithoutPassword } = newUserWithId;
        setUsers(prev => [...prev, newUserWithoutPassword]);
        
        toast({
          title: "Usuário adicionado",
          description: "O novo usuário foi adicionado com sucesso!"
        });
      }
      
      setNewUser({ username: "", password: "", name: "" });
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o usuário.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUser({
      username: user.username,
      password: "", // Não preenchemos a senha para edição
      name: user.name
    });
  };
  
  const handleDeleteUser = (userId) => {
    try {
      setActionLoading(true);
      
      // Buscar todos os usuários
      const savedUsers = localStorage.getItem("adminUsers");
      const allUsers = savedUsers ? JSON.parse(savedUsers) : [];
      
      // Verificar se é o último usuário
      if (allUsers.length <= 1) {
        toast({
          title: "Erro",
          description: "Não é possível excluir o último usuário administrador.",
          variant: "destructive"
        });
        setActionLoading(false);
        return;
      }
      
      // Remover o usuário
      const updatedUsers = allUsers.filter(user => user.id !== userId);
      localStorage.setItem("adminUsers", JSON.stringify(updatedUsers));
      
      // Atualizar a lista de usuários
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      toast({
        title: "Usuário removido",
        description: "O usuário foi removido com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao remover usuário:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível remover o usuário.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold">Configurações de Administração</h2>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={actionLoading}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex border-b">
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'site' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('site')}
            disabled={actionLoading}
          >
            Configurações do Site
          </button>
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'users' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('users')}
            disabled={actionLoading}
          >
            Usuários Administradores
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === 'site' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Site</label>
                <input
                  type="text"
                  name="siteName"
                  value={siteSettings.siteName}
                  onChange={handleSiteSettingChange}
                  className="w-full p-2 border rounded"
                  disabled={actionLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Logo do Site</label>
                <div className="flex items-center gap-4">
                  {siteSettings.logo ? (
                    <div className="relative w-40 h-20">
                      <img
                        src={siteSettings.logo}
                        alt="Logo do site"
                        className="w-full h-full object-contain"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-0 right-0"
                        onClick={() => setSiteSettings(prev => ({ ...prev, logo: null }))}
                        disabled={actionLoading}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-40 h-20 border-2 border-dashed rounded flex items-center justify-center">
                      <span className="text-gray-400">Sem logo</span>
                    </div>
                  )}
                  
                  <label className={`flex items-center gap-2 ${actionLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded-lg flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span>Carregar Logo</span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoChange}
                      disabled={actionLoading}
                    />
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Texto do Rodapé</label>
                <input
                  type="text"
                  name="footerText"
                  value={siteSettings.footerText}
                  onChange={handleSiteSettingChange}
                  className="w-full p-2 border rounded"
                  disabled={actionLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email de Contato</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={siteSettings.contactEmail}
                  onChange={handleSiteSettingChange}
                  className="w-full p-2 border rounded"
                  disabled={actionLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Telefone de Contato</label>
                <input
                  type="text"
                  name="contactPhone"
                  value={siteSettings.contactPhone}
                  onChange={handleSiteSettingChange}
                  className="w-full p-2 border rounded"
                  disabled={actionLoading}
                />
              </div>
              
              <Button 
                onClick={handleSaveSettings}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...
                  </>
                ) : (
                  'Salvar Configurações'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome de Usuário</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={newUser.username}
                      onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border rounded"
                      placeholder="Nome de usuário"
                      disabled={actionLoading}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border rounded"
                    placeholder="Nome completo"
                    disabled={actionLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Senha {editingUser && <span className="text-xs text-gray-500">(deixe em branco para manter a atual)</span>}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border rounded"
                      placeholder={editingUser ? "Deixe em branco para manter a senha atual" : "Senha"}
                      disabled={actionLoading}
                    />
                  </div>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={handleAddUser}
                    className="flex items-center gap-2"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Processando...
                      </>
                    ) : editingUser ? (
                      <>
                        <Edit className="w-4 h-4" /> Atualizar Usuário
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> Adicionar Usuário
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Usuários Administradores</h3>
                <div className="border rounded-lg overflow-hidden">
                  {loading ? (
                    <div className="flex justify-center items-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-600 mr-2" />
                      <span>Carregando usuários...</span>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      Nenhum usuário encontrado
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Nome</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Usuário</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {users.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">{user.name}</td>
                            <td className="px-4 py-3">{user.username}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                  disabled={actionLoading}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={actionLoading || users.length <= 1}
                                >
                                  <Trash className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}