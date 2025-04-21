import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Search, BedDouble, Wifi, Coffee, Car, Plus, X, Edit, Phone, Mail, Globe, ArrowLeft, Info, ChevronDown, ChevronUp } from "lucide-react";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import MotelForm from "@/components/MotelForm";
import RoomForm from "@/components/RoomForm";
import LoginDialog from "@/components/LoginDialog";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import TopAmenities from "@/components/TopAmenities";
import { api } from "@/services/api";

export default function MotelDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedAmenities, setSelectedAmenities] = React.useState([]);
  const [expandedInfo, setExpandedInfo] = React.useState({});
  const [motels, setMotels] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  
  // Carregar dados da API
  React.useEffect(() => {
    const fetchMotels = async () => {
      try {
        console.log("Carregando motéis da API...");
        setLoading(true);
        const data = await api.getMotels();
        console.log("Motéis carregados:", data);
        setMotels(data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMotels();
  }, []);
  const [isAdminMode, setIsAdminMode] = React.useState(false);
  const [showLoginDialog, setShowLoginDialog] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [showAddRoom, setShowAddRoom] = React.useState(false);
  const [editingRoom, setEditingRoom] = React.useState(null);
  const [siteSettings, setSiteSettings] = React.useState(() => {
    const saved = localStorage.getItem("siteSettings");
    return saved ? JSON.parse(saved) : {
      siteName: "Portal de Motéis",
      logo: null,
      footerText: "© 2024 Portal de Motéis. Todos os direitos reservados.",
      contactEmail: "contato@portaldemoteis.com",
      contactPhone: "(11) 99999-9999"
    };
  });
  const [newRoom, setNewRoom] = React.useState({
    name: "",
    description: "",
    priceOptions: [],
    amenities: [],
    images: []
  });

  // Find the current motel
  const motel = React.useMemo(() => {
    console.log("Procurando motel com ID:", id);
    console.log("Motéis disponíveis:", motels);
    
    // Tenta encontrar o motel comparando como número ou como string
    const foundMotel = motels.find(m => {
      const motelId = m.id;
      const paramId = parseInt(id);
      
      return motelId === paramId || motelId === id || motelId.toString() === id;
    });
    
    console.log("Motel encontrado:", foundMotel);
    return foundMotel;
  }, [motels, id]);

  // Get all unique amenities across all rooms of this motel
  const allAmenities = React.useMemo(() => {
    if (!motel) return [];
    
    const amenities = new Set();
    motel.rooms.forEach(room => {
      room.amenities.forEach(amenity => {
        amenities.add(amenity);
      });
    });
    return Array.from(amenities);
  }, [motel]);

  // Não precisamos mais salvar no localStorage, pois os dados são salvos na API
  // Mas vamos manter uma cópia local para fallback
  React.useEffect(() => {
    if (motels.length > 0) {
      localStorage.setItem("motels", JSON.stringify(motels));
    }
  }, [motels]);

  // Se estiver carregando
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex flex-col items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <h1 className="text-2xl font-bold mt-4 mb-4">Carregando motel...</h1>
      </div>
    );
  }
  
  // Se o motel não for encontrado
  if (!motel) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Motel não encontrado</h1>
        <p className="text-gray-600 mb-4">O motel com ID {id} não foi encontrado.</p>
        <Link to="/">
          <Button className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar para a página inicial
          </Button>
        </Link>
      </div>
    );
  }

  const filteredRooms = motel.rooms.filter(room => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      room.name.toLowerCase().includes(searchLower) ||
      room.amenities.some(amenity => 
        amenity.toLowerCase().includes(searchLower)
      );

    if (selectedAmenities.length === 0) return matchesSearch;

    return matchesSearch && selectedAmenities.every(amenity =>
      room.amenities.includes(amenity)
    );
  });

  const handleAmenitySelect = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleDeleteClick = (type, id) => {
    setDeleteTarget({ type, id, motelId: motel.id });
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === "room") {
        // Encontrar o motel atual
        const currentMotel = motels.find(m => m.id === deleteTarget.motelId);
        if (!currentMotel) {
          throw new Error("Motel não encontrado");
        }
        
        // Criar uma cópia do motel para atualização
        const updatedMotel = { 
          ...currentMotel,
          rooms: currentMotel.rooms.filter(room => room.id !== deleteTarget.id)
        };
        
        console.log("Removendo quarto do motel:", updatedMotel);
        
        // Enviar atualização para a API
        await api.updateMotel(deleteTarget.motelId, updatedMotel);
        
        // Atualizar estado local
        setMotels(prev => prev.map(m => 
          m.id === deleteTarget.motelId ? updatedMotel : m
        ));
        
        toast({
          title: "Quarto removido",
          description: "O quarto foi removido com sucesso!"
        });
      }
    } catch (error) {
      console.error("Erro ao remover quarto:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover o quarto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const handleAddRoom = async (motelId) => {
    // Validate that all price options have both hours and price values
    const validPriceOptions = newRoom.priceOptions?.every(option => 
      option.hours !== "" && option.price !== ""
    );
    
    if (newRoom.name && newRoom.priceOptions?.length > 0 && validPriceOptions) {
      try {
        // Encontrar o motel atual
        const currentMotel = motels.find(m => m.id === motelId);
        if (!currentMotel) {
          throw new Error("Motel não encontrado");
        }
        
        // Criar uma cópia do motel para atualização
        const updatedMotel = { ...currentMotel };
        
        if (editingRoom) {
          // Atualizar quarto existente
          updatedMotel.rooms = updatedMotel.rooms.map(room =>
            room.id === editingRoom.id ? { ...room, ...newRoom } : room
          );
          
          console.log("Atualizando quarto no motel:", updatedMotel);
          
          // Enviar atualização para a API
          await api.updateMotel(motelId, updatedMotel);
          
          // Atualizar estado local
          setMotels(prev => prev.map(m =>
            m.id === motelId ? updatedMotel : m
          ));
          
          setEditingRoom(null);
          toast({
            title: "Quarto atualizado",
            description: "As alterações foram salvas com sucesso!"
          });
        } else {
          // Adicionar novo quarto
          const newRoomWithId = { ...newRoom, id: Date.now() };
          updatedMotel.rooms = [...updatedMotel.rooms, newRoomWithId];
          
          console.log("Adicionando novo quarto ao motel:", updatedMotel);
          
          // Enviar atualização para a API
          await api.updateMotel(motelId, updatedMotel);
          
          // Atualizar estado local
          setMotels(prev => prev.map(m =>
            m.id === motelId ? updatedMotel : m
          ));
          
          toast({
            title: "Quarto adicionado",
            description: "O quarto foi adicionado com sucesso!"
          });
        }
        
        // Limpar formulário e fechar
        setNewRoom({ name: "", description: "", priceOptions: [], amenities: [], images: [] });
        setShowAddRoom(false);
        
      } catch (error) {
        console.error("Erro ao salvar quarto:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao salvar o quarto. Tente novamente.",
          variant: "destructive"
        });
      }
    } else if (!validPriceOptions) {
      toast({
        title: "Erro de validação",
        description: "Todas as opções de preço precisam ter horas e valores preenchidos.",
        variant: "destructive"
      });
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setNewRoom({
      name: room.name,
      description: room.description || "",
      priceOptions: room.priceOptions || [],
      amenities: room.amenities,
      images: room.images
    });
    setShowAddRoom(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <header className="bg-white shadow-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-purple-800">{motel.name}</h1>
          </div>
          <Button
            onClick={() => {
              if (!isAdminMode) {
                setShowLoginDialog(true);
              } else {
                setIsAdminMode(false);
              }
            }}
            variant={isAdminMode ? "default" : "outline"}
          >
            {isAdminMode ? "Modo Visualização" : "Modo Admin"}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow mb-16">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="relative">
            {motel.logo ? (
              <img
                src={motel.logo}
                alt={`Logo do ${motel.name}`}
                className="w-full h-64 object-cover"
              />
            ) : (
              <img 
                className="w-full h-64 object-cover"
                alt={`Fachada do ${motel.name}`}
                src="https://images.unsplash.com/photo-1672973859247-2727e1f536f6" />
            )}
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{motel.name}</h2>
            <p className="text-gray-600 mb-2">{motel.description}</p>
            <p className="text-gray-500 mb-2">
              <span className="font-medium">Localização:</span> {motel.location}
            </p>
            
            {motel.website && (
              <p className="text-gray-500 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <a 
                  href={motel.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  Website
                </a>
              </p>
            )}
            
            {motel.phone && (
              <p className="text-gray-500 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href={`tel:${motel.phone}`} className="hover:text-purple-600">
                  {motel.phone}
                </a>
              </p>
            )}
            
            {motel.email && (
              <p className="text-gray-500 mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${motel.email}`} className="hover:text-purple-600">
                  {motel.email}
                </a>
              </p>
            )}
          </div>
        </div>

        {isAdminMode && (
          <div className="mb-8">
            <Button
              onClick={() => {
                setEditingRoom(null);
                setNewRoom({ name: "", description: "", priceOptions: [], amenities: [], images: [] });
                setShowAddRoom(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Adicionar Quarto
            </Button>
          </div>
        )}

        {showAddRoom && (
          <RoomForm
            newRoom={newRoom}
            setNewRoom={setNewRoom}
            handleAddRoom={() => handleAddRoom(motel.id)}
            onClose={() => {
              setShowAddRoom(false);
              setEditingRoom(null);
            }}
            amenities={allAmenities}
            isEditing={!!editingRoom}
          />
        )}

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por quarto ou comodidades..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <TopAmenities
          amenities={allAmenities}
          selectedAmenities={selectedAmenities}
          onSelect={handleAmenitySelect}
        />
        
        <h2 className="text-2xl font-bold text-purple-800 mb-6 mt-8">Tipos de suites</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredRooms.map(room => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative">
                  {room.images.length > 0 ? (
                    <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                      <img
                        src={room.images[0].url || room.images[0]}
                        alt={`Foto principal do quarto ${room.name}`}
                        className="max-w-full max-h-48 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                      <img 
                        className="max-w-full max-h-48 object-contain"
                        alt={`Quarto ${room.name}`}
                        src="https://images.unsplash.com/photo-1521828537238-fcecf91b732c" />
                    </div>
                  )}
                  {isAdminMode && (
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick("room", room.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleEditRoom(room)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <Link to={`/motel/${motel.id}/room/${room.id}`} className="block group">
                    <h3 className="text-xl font-medium text-gray-800 mb-2 group-hover:text-purple-700 transition-colors">{room.name}</h3>

                    <div className="mb-4">
                      {room.priceOptions?.map((option, index) => (
                        <div key={index} className="mb-2">
                          <div className="flex items-center">
                            <p className="text-purple-600 font-semibold">
                              {typeof option.hours === 'number' ? `${option.hours}h` : option.hours} - {option.price} €
                            </p>
                            {option.info && (
                              <button 
                                className="ml-2 text-gray-500 hover:text-purple-600 focus:outline-none"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setExpandedInfo(prev => ({
                                    ...prev,
                                    [`room_${room.id}_option_${index}`]: !prev[`room_${room.id}_option_${index}`]
                                  }));
                                }}
                                aria-label="Mostrar informações adicionais"
                              >
                                <Info className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          {option.info && expandedInfo[`room_${room.id}_option_${index}`] && (
                            <div 
                              className="mt-1 ml-4 text-sm text-gray-600 bg-gray-50 p-2 rounded rich-text-content"
                              dangerouslySetInnerHTML={{ __html: option.info }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {room.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </Link>
                  
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {room.images.length > 0 ? (
                      room.images.map((image, index) => (
                        <div key={index} className="w-full h-24 flex items-center justify-center bg-gray-100 rounded-lg">
                          <Zoom 
                            zoomMargin={40}
                            overlayBgColorEnd="rgba(0, 0, 0, 0.85)"
                          >
                            <img 
                              src={image.url || image}
                              alt={`Foto ${index + 1} do quarto`}
                              className="max-w-full max-h-24 object-contain rounded-lg cursor-zoom-in hover:opacity-75 transition-opacity"
                            />
                          </Zoom>
                        </div>
                      ))
                    ) : (
                      <div className="w-full h-24 flex items-center justify-center bg-gray-100 rounded-lg">
                        <img 
                          className="max-w-full max-h-24 object-contain rounded-lg"
                          alt={`Quarto ${room.name}`}
                          src="https://images.unsplash.com/photo-1521828537238-fcecf91b732c" />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <Link to={`/motel/${motel.id}/room/${room.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Ver detalhes do quarto
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {showLoginDialog && (
        <LoginDialog
          onClose={() => setShowLoginDialog(false)}
          onLogin={() => setIsAdminMode(true)}
        />
      )}

      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={`Confirmar exclusão de quarto`}
        description={`Tem certeza que deseja excluir este quarto? Esta ação não pode ser desfeita.`}
      />
      
      <footer className="bg-white border-t py-6 mt-auto sticky bottom-0 left-0 right-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              {siteSettings.logo ? (
                <Link to="/">
                  <img 
                    src={siteSettings.logo} 
                    alt={siteSettings.siteName}
                    className="h-8 w-auto object-contain" 
                  />
                </Link>
              ) : null}
              <p className="text-gray-600">{siteSettings.footerText}</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {siteSettings.contactEmail && (
                <a 
                  href={`mailto:${siteSettings.contactEmail}`}
                  className="text-gray-600 hover:text-purple-600 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" /> {siteSettings.contactEmail}
                </a>
              )}
              
              {siteSettings.contactPhone && (
                <a 
                  href={`tel:${siteSettings.contactPhone}`}
                  className="text-gray-600 hover:text-purple-600 flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" /> {siteSettings.contactPhone}
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}