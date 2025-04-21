
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Upload } from "lucide-react";
import { api } from "@/services/api";

export default function MotelForm({ 
  newMotel, 
  setNewMotel, 
  handleAddMotel, 
  onClose,
  isEditing 
}) {
  console.log("MotelForm renderizado com:", { newMotel, isEditing });
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 2 * 1024 * 1024; // 2MB limit
      
      if (!isValidType) {
        alert("Por favor, selecione apenas arquivos de imagem.");
        return;
      }
      
      if (!isValidSize) {
        alert("A imagem deve ter no máximo 2MB.");
        return;
      }
      
      try {
        // Mostrar indicador de carregamento ou mensagem
        setNewMotel(prev => ({ ...prev, logoLoading: true }));
        
        // Usar a API para fazer upload da imagem
        const data = await api.uploadImage(file);
        
        // Armazenar a URL da imagem e o ID público para gerenciamento futuro
        setNewMotel(prev => ({ 
          ...prev, 
          logo: data.url,
          logo_id: data.public_id,
          logoLoading: false
        }));
      } catch (error) {
        console.error('Erro ao fazer upload:', error);
        alert('Erro ao fazer upload da imagem. Tente novamente.');
        setNewMotel(prev => ({ ...prev, logoLoading: false }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulário enviado via onSubmit");
    console.log("handleAddMotel:", handleAddMotel);
    handleAddMotel();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-lg mb-8"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {isEditing ? "Editar Motel" : "Adicionar Novo Motel"}
        </h2>
        <Button variant="ghost" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Logo do Motel</label>
          <div className="flex items-center gap-4">
            {newMotel.logo && (
              <div className="relative">
                <img
                  src={newMotel.logo}
                  alt="Logo preview"
                  className="w-20 h-20 object-cover rounded"
                />
                {newMotel.logo_id && (
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    onClick={async () => {
                      try {
                        // Remover a imagem do Cloudinary usando a API
                        await api.deleteImage(newMotel.logo_id);
                        
                        // Remover a referência da imagem do estado
                        setNewMotel(prev => ({ 
                          ...prev, 
                          logo: null,
                          logo_id: null
                        }));
                      } catch (error) {
                        console.error('Erro ao excluir imagem:', error);
                      }
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
            <label className="cursor-pointer">
              <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
                {newMotel.logoLoading ? (
                  <span>Carregando...</span>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload Logo</span>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
                disabled={newMotel.logoLoading}
              />
            </label>
          </div>
        </div>

        <input
          type="text"
          placeholder="Nome do Motel"
          className="w-full mb-4 p-2 border rounded"
          value={newMotel.name}
          onChange={(e) => setNewMotel(prev => ({ ...prev, name: e.target.value }))}
          required
        />

        <input
          type="text"
          placeholder="Localização"
          className="w-full mb-4 p-2 border rounded"
          value={newMotel.location}
          onChange={(e) => setNewMotel(prev => ({ ...prev, location: e.target.value }))}
          required
        />

        <input
          type="text"
          placeholder="Website"
          className="w-full mb-4 p-2 border rounded"
          value={newMotel.website}
          onChange={(e) => setNewMotel(prev => ({ ...prev, website: e.target.value }))}
        />

        <input
          type="tel"
          placeholder="Telefone"
          className="w-full mb-4 p-2 border rounded"
          value={newMotel.phone}
          onChange={(e) => setNewMotel(prev => ({ ...prev, phone: e.target.value }))}
        />

        <input
          type="email"
          placeholder="E-mail"
          className="w-full mb-4 p-2 border rounded"
          value={newMotel.email}
          onChange={(e) => setNewMotel(prev => ({ ...prev, email: e.target.value }))}
        />

        <textarea
          placeholder="Descrição"
          className="w-full mb-4 p-2 border rounded"
          value={newMotel.description}
          onChange={(e) => setNewMotel(prev => ({ ...prev, description: e.target.value }))}
          required
        />

        <Button type="submit">
          {isEditing ? "Salvar Alterações" : "Adicionar Motel"}
        </Button>
      </form>
    </motion.div>
  );
}
