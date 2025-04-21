import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { hashPassword } from '@/utils/passwordUtils';

export default function ResetAdminButton() {
  const { toast } = useToast();
  
  const handleResetAdmin = () => {
    try {
      // Limpar o localStorage
      localStorage.removeItem('adminUsers');
      
      // Criar usuário padrão com senha criptografada
      const hashedPassword = hashPassword('admin123');
      
      const defaultUser = {
        id: 1,
        username: 'admin',
        password: hashedPassword,
        name: 'Administrador'
      };
      
      // Salvar no localStorage
      localStorage.setItem('adminUsers', JSON.stringify([defaultUser]));
      
      toast({
        title: 'Usuário Admin Resetado',
        description: 'Username: admin, Senha: admin123',
      });
      
      console.log('Usuário admin resetado com sucesso!');
      console.log('Username: admin');
      console.log('Password: admin123');
      console.log('Hash da senha:', hashedPassword);
    } catch (error) {
      console.error('Erro ao resetar usuário admin:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível resetar o usuário admin.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleResetAdmin}
      className="text-xs text-gray-500"
    >
      Reset Admin
    </Button>
  );
}