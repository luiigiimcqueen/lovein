
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, User, Lock } from "lucide-react";
import { hashPassword, verifyPassword } from "@/utils/passwordUtils";

export default function LoginDialog({ onClose, onLogin }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // Verificar se existe pelo menos um usuário no sistema
  React.useEffect(() => {
    const checkUsers = () => {
      const savedUsers = localStorage.getItem("adminUsers");
      if (!savedUsers || JSON.parse(savedUsers).length === 0) {
        // Criar usuário padrão com senha criptografada
        const hashedPassword = hashPassword("admin123");
        
        const defaultUser = {
          id: 1,
          username: "admin",
          password: hashedPassword,
          name: "Administrador"
        };
        
        localStorage.setItem("adminUsers", JSON.stringify([defaultUser]));
        console.log("Usuário padrão criado");
      }
    };
    
    checkUsers();
  }, []);

  const handleLogin = () => {
    if (!username || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      // Buscar usuários do localStorage
      const savedUsers = localStorage.getItem("adminUsers");
      const users = savedUsers ? JSON.parse(savedUsers) : [];
      
      // Encontrar usuário pelo nome de usuário
      const user = users.find(u => u.username === username);
      
      if (!user) {
        throw new Error("Nome de usuário ou senha incorretos");
      }
      
      // Verificar senha
      const passwordMatch = verifyPassword(password, user.password);
      
      if (!passwordMatch) {
        throw new Error("Nome de usuário ou senha incorretos");
      }
      
      // Login bem-sucedido
      const { password: _, ...userWithoutPassword } = user;
      onLogin(userWithoutPassword);
      onClose();
    } catch (error) {
      console.error("Erro no login:", error);
      setError(error.message || "Nome de usuário ou senha incorretos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Login Administrativo</h2>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Nome de usuário"
              className="w-full pl-10 pr-4 py-2 border rounded mb-2"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              disabled={loading}
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="password"
              placeholder="Senha"
              className="w-full pl-10 pr-4 py-2 border rounded"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  handleLogin();
                }
              }}
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <Button 
          onClick={handleLogin} 
          className="w-full"
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </div>
    </motion.div>
  );
}
