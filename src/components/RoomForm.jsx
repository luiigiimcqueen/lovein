
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Upload, Plus, Clock } from "lucide-react";
import { api } from "@/services/api";
import RichTextEditor from "@/components/RichTextEditor";

export default function RoomForm({
  newRoom,
  setNewRoom,
  handleAddRoom,
  onClose,
  amenities,
  isEditing
}) {
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });
    
    if (validFiles.length !== files.length) {
      alert("Alguns arquivos foram ignorados. Apenas imagens com tamanho até 5MB são permitidas.");
    }
    
    if (validFiles.length === 0) return;
    
    try {
      // Mostrar indicador de carregamento
      setNewRoom(prev => ({ ...prev, imagesLoading: true }));
      
      // Usar a API para fazer upload das imagens
      const results = await api.uploadMultipleImages(validFiles);
      
      // Adicionar as URLs das imagens ao estado
      setNewRoom(prev => ({
        ...prev,
        images: [
          ...prev.images, 
          ...results.map(result => ({
            url: result.url,
            public_id: result.public_id
          }))
        ],
        imagesLoading: false
      }));
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload das imagens. Tente novamente.');
      setNewRoom(prev => ({ ...prev, imagesLoading: false }));
    }
  };

  // Lista de comodidades comuns para sugestão
  const commonAmenities = [
    "Ar Condicionado", "TV", "Frigobar", "Hidromassagem", "Chuveiro a Gás",
    "Wi-Fi", "Estacionamento", "Suíte", "Cama King Size", "Espelho no Teto",
    "Som Ambiente", "Piscina", "Sauna", "Varanda", "Banheira"
  ];

  const handleCustomTag = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault(); // Prevent form submission
      const newAmenity = e.target.value.trim();
      
      // Verificar se a comodidade já existe
      if (!newRoom.amenities.includes(newAmenity)) {
        setNewRoom(prev => ({
          ...prev,
          amenities: [...prev.amenities, newAmenity]
        }));
        console.log("Comodidade adicionada:", newAmenity);
      }
      
      e.target.value = '';
    }
  };
  
  const addAmenity = (amenity) => {
    if (!newRoom.amenities.includes(amenity)) {
      setNewRoom(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenity]
      }));
    }
  };

  const removeImage = async (index) => {
    const image = newRoom.images[index];
    
    // Se a imagem tem um public_id, significa que está no Cloudinary
    if (image.public_id) {
      try {
        // Remover a imagem do Cloudinary usando a API
        await api.deleteImage(image.public_id);
      } catch (error) {
        console.error('Erro ao excluir imagem do Cloudinary:', error);
      }
    }
    
    // Remover a imagem do estado
    setNewRoom(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addPriceOption = () => {
    setNewRoom(prev => ({
      ...prev,
      priceOptions: [
        ...prev.priceOptions || [],
        { hours: "", price: "", info: "" }
      ]
    }));
  };

  const removePriceOption = (index) => {
    setNewRoom(prev => ({
      ...prev,
      priceOptions: prev.priceOptions.filter((_, i) => i !== index)
    }));
  };

  const updatePriceOption = (index, field, value) => {
    // Convert string values to numbers only for price field
    const parsedValue = field === "price" 
      ? value === "" ? "" : Number(value)
      : value;
      
    setNewRoom(prev => ({
      ...prev,
      priceOptions: prev.priceOptions.map((option, i) =>
        i === index ? { ...option, [field]: parsedValue } : option
      )
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-lg mb-8"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {isEditing ? "Editar Quarto" : "Adicionar Novo Quarto"}
        </h2>
        <Button variant="ghost" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <input
        type="text"
        placeholder="Nome do Quarto"
        className="w-full mb-4 p-2 border rounded"
        value={newRoom.name}
        onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
      />
      
      <div className="mb-4">
        <RichTextEditor
          placeholder="Descrição do Quarto"
          value={newRoom.description || ""}
          onChange={(content) => setNewRoom(prev => ({ ...prev, description: content }))}
          height={200}
        />
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Opções de Preço</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={addPriceOption}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Adicionar Opção
          </Button>
        </div>
        
        {(newRoom.priceOptions || []).map((option, index) => (
          <div key={index} className="flex flex-col gap-2 mb-4 border p-3 rounded-lg bg-gray-50">
            <div className="flex gap-2">
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Horas"
                  className="w-1/3 p-2 border rounded"
                  value={option.hours}
                  onChange={(e) => updatePriceOption(index, "hours", e.target.value)}
                />
                <div className="relative w-2/3">
                  <input
                    type="number"
                    placeholder="Preço"
                    className="w-full p-2 pl-8 border rounded"
                    value={option.price}
                    onChange={(e) => updatePriceOption(index, "price", e.target.value)}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removePriceOption(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="w-full">
              <RichTextEditor
                placeholder="Informações adicionais (opcional)"
                value={option.info || ""}
                onChange={(content) => updatePriceOption(index, "info", content)}
                height={150}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <h3 className="mb-2 font-medium">Fotos do Quarto</h3>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {newRoom.images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image.url || image}
                alt={`Foto ${index + 1}`}
                className="w-full h-24 object-cover rounded"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1"
                onClick={() => removeImage(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
          <label className={`border-2 border-dashed rounded flex items-center justify-center cursor-pointer h-24 ${newRoom.imagesLoading ? 'opacity-50' : ''}`}>
            <div className="text-center">
              {newRoom.imagesLoading ? (
                <span className="text-sm">Carregando...</span>
              ) : (
                <>
                  <Plus className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-sm">Adicionar</span>
                </>
              )}
            </div>
            <input
              type="file"
              multiple
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
              disabled={newRoom.imagesLoading}
            />
          </label>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="mb-2 font-medium">Comodidades</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {newRoom.amenities.map((amenity, index) => (
            <span
              key={index}
              className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full flex items-center gap-2"
            >
              {amenity}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setNewRoom(prev => ({
                  ...prev,
                  amenities: prev.amenities.filter((_, i) => i !== index)
                }))}
              />
            </span>
          ))}
        </div>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            id="amenityInput"
            placeholder="Adicione uma comodidade e pressione Enter"
            className="flex-1 p-2 border rounded"
            onKeyDown={handleCustomTag}
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const input = document.getElementById('amenityInput');
              if (input && input.value.trim()) {
                const newAmenity = input.value.trim();
                
                // Verificar se a comodidade já existe
                if (!newRoom.amenities.includes(newAmenity)) {
                  setNewRoom(prev => ({
                    ...prev,
                    amenities: [...prev.amenities, newAmenity]
                  }));
                }
                
                input.value = '';
              }
            }}
          >
            <Plus className="w-4 h-4" /> Adicionar
          </Button>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Comodidades comuns:</h4>
          <div className="flex flex-wrap gap-2">
            {commonAmenities
              .filter(amenity => !newRoom.amenities.includes(amenity))
              .map((amenity, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => addAmenity(amenity)}
                >
                  {amenity}
                </Button>
              ))}
          </div>
        </div>
      </div>

      <Button onClick={handleAddRoom}>
        {isEditing ? "Salvar Alterações" : "Adicionar Quarto"}
      </Button>
    </motion.div>
  );
}
