import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Search, Plus, X, Edit, Phone, Mail, Globe, ArrowRight, Settings } from "lucide-react";
import MotelForm from "@/components/MotelForm";
import LoginDialog from "@/components/LoginDialog";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import TopAmenities from "@/components/TopAmenities";
import PriceRangeFilter from "@/components/PriceRangeFilter";
import AdminSettings from "@/components/AdminSettings";
import ResetAdminButton from "@/components/ResetAdminButton";
import CsvImportExport from "@/components/CsvImportExport";
import { api } from "@/services/api";

const initialMotels = [
  {
    id: 1,
    name: "Motel Luxo",
    description: "Experiência premium com todo conforto",
    location: "Av. Principal, 1000",
    website: "https://www.motelluxo.com",
    phone: "(11) 99999-9999",
    email: "contato@motelluxo.com",
    logo: null,
    rooms: [
      {
        id: 1,
        name: "Suíte Presidencial",
        priceOptions: [
          { hours: 2, price: 150 },
          { hours: 4, price: 250 },
          { hours: 12, price: 400 }
        ],
        amenities: ["Hidromassagem", "TV 50'", "Ar Condicionado", "Frigobar"],
        images: []
      }
    ]
  }
];

export default function App() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedAmenities, setSelectedAmenities] = React.useState([]);
  const [priceRange, setPriceRange] = React.useState([0, 1000]);
  const [motels, setMotels] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  
  // Função para carregar motéis da API
  const fetchMotels = async () => {
    try {
      console.log("Carregando motéis da API...");
      setLoading(true);
      const data = await api.getMotels();
      console.log("Motéis carregados:", data);
      setMotels(data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      // Fallback para dados iniciais se a API falhar
      setMotels(initialMotels);
    } finally {
      setLoading(false);
    }
  };
  
  // Função para processar motéis importados do Excel
  const handleImportMotels = async (importedMotels) => {
    try {
      setLoading(true);
      
      // Array para armazenar os motéis adicionados
      const addedMotels = [];
      
      // Adicionar cada motel importado
      for (const motel of importedMotels) {
        // Verificar se o motel já existe (pelo nome)
        const existingMotel = motels.find(m => m.name === motel.name);
        
        if (existingMotel) {
          // Atualizar motel existente
          const updatedMotel = await api.updateMotel(existingMotel.id, {
            ...existingMotel,
            ...motel,
            rooms: existingMotel.rooms // Manter os quartos existentes
          });
          addedMotels.push(updatedMotel);
        } else {
          // Adicionar novo motel
          const newMotel = await api.addMotel(motel);
          addedMotels.push(newMotel);
        }
      }
      
      // Atualizar a lista de motéis
      await fetchMotels();
      
      toast({
        title: "Importação concluída",
        description: `${addedMotels.length} motéis importados com sucesso.`
      });
    } catch (error) {
      console.error("Erro ao importar motéis:", error);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao importar os motéis.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados da API ao iniciar
  React.useEffect(() => {
    fetchMotels();
  }, []);
  const [isAdminMode, setIsAdminMode] = React.useState(false);
  const [showLoginDialog, setShowLoginDialog] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [showAdminSettings, setShowAdminSettings] = React.useState(false);
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
  const [newMotel, setNewMotel] = React.useState({ 
    name: "", 
    description: "", 
    location: "",
    website: "",
    phone: "",
    email: "",
    logo: null,
    rooms: [] 
  });
  const [showAddMotel, setShowAddMotel] = React.useState(false);
  console.log("Estado showAddMotel:", showAddMotel);
  const [editingMotel, setEditingMotel] = React.useState(null);

  // Get all unique amenities across all rooms
  const allAmenities = React.useMemo(() => {
    const amenities = new Set();
    motels.forEach(motel => {
      motel.rooms.forEach(room => {
        room.amenities.forEach(amenity => {
          amenities.add(amenity);
        });
      });
    });
    return Array.from(amenities);
  }, [motels]);

  // Não precisamos mais salvar no localStorage, pois os dados são salvos na API

  // Função para encontrar o preço mais baixo de um motel
  const getLowestPrice = (motel) => {
    console.log("Calculando preço mais baixo para motel:", motel.id);
    
    // Verificar se o motel tem a propriedade rooms
    if (!motel.rooms) {
      console.log("Motel sem a propriedade rooms:", motel);
      return null;
    }
    
    // Verificar se o motel tem quartos
    if (motel.rooms.length === 0) {
      console.log("Motel sem quartos:", motel);
      return null;
    }
    
    let lowestPrice = Infinity;
    
    motel.rooms.forEach(room => {
      // Verificar se o quarto tem a propriedade priceOptions
      if (!room.priceOptions) {
        console.log("Quarto sem a propriedade priceOptions:", room);
        return;
      }
      
      if (room.priceOptions.length > 0) {
        room.priceOptions.forEach(option => {
          if (option.price < lowestPrice) {
            lowestPrice = option.price;
          }
        });
      }
    });
    
    const result = lowestPrice !== Infinity ? lowestPrice : null;
    console.log("Preço mais baixo para motel", motel.id, ":", result);
    return result;
  };

  console.log("Motels disponíveis:", motels);
  console.log("Loading state:", loading);
  
  console.log("Filtrando motéis...");
  console.log("Número de motéis antes da filtragem:", motels.length);
  
  const filteredMotels = motels.filter(motel => {
    console.log("Verificando motel:", motel);
    
    // Verificar se o motel tem a propriedade rooms
    if (!motel.rooms) {
      console.log("Motel sem a propriedade rooms:", motel);
      motel.rooms = [];
    }
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      motel.name.toLowerCase().includes(searchLower) ||
      motel.description.toLowerCase().includes(searchLower) ||
      motel.location.toLowerCase().includes(searchLower) ||
      motel.rooms.some(room => 
        room.name && room.name.toLowerCase().includes(searchLower) ||
        room.amenities && room.amenities.some(amenity => 
          amenity.toLowerCase().includes(searchLower)
        )
      );
      
    // Verificar se o motel tem pelo menos um quarto com preço dentro do intervalo
    const lowestPrice = getLowestPrice(motel);
    const matchesPrice = lowestPrice !== null && 
                         lowestPrice >= priceRange[0] && 
                         lowestPrice <= priceRange[1];
    
    // Verificar se o motel tem pelo menos um quarto com todas as comodidades selecionadas
    const matchesAmenities = selectedAmenities.length === 0 || 
                            motel.rooms.some(room =>
                              room.amenities && selectedAmenities.every(amenity =>
                                room.amenities.includes(amenity)
                              )
                            );

    const matches = matchesSearch && (lowestPrice === null || matchesPrice) && matchesAmenities;
    console.log("Resultado da filtragem para motel", motel.id, ":", matches);
    return matches;
  });

  const handleAmenitySelect = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleDeleteClick = (id) => {
    setDeleteTarget({ type: "motel", id });
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === "motel") {
        console.log(`Removendo motel ${deleteTarget.id}...`);
        await api.deleteMotel(deleteTarget.id);
        
        // Recarregar todos os motéis em vez de apenas remover o atual
        console.log("Recarregando lista de motéis após remoção...");
        await fetchMotels();
        
        toast({
          title: "Motel removido",
          description: "O motel foi removido com sucesso!"
        });
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover o item. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const handleAddMotel = async () => {
    console.log("handleAddMotel chamado");
    console.log("newMotel:", newMotel);
    
    // Validate required fields
    if (!newMotel.name || !newMotel.description || !newMotel.location) {
      console.log("Validação falhou: campos obrigatórios faltando");
      toast({
        title: "Erro de validação",
        description: "Nome, descrição e localização são campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate website format if provided
    if (newMotel.website && !newMotel.website.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
      console.log("Validação falhou: formato de website inválido");
      toast({
        title: "Erro de validação",
        description: "O formato do website é inválido.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("Tentando adicionar/atualizar motel");
      if (editingMotel) {
        console.log("Atualizando motel existente:", editingMotel.id);
        // Atualizar motel existente
        const updatedMotel = await api.updateMotel(editingMotel.id, newMotel);
        console.log("Motel atualizado com sucesso:", updatedMotel);
        setMotels(prev => prev.map(motel =>
          motel.id === editingMotel.id ? updatedMotel : motel
        ));
        setEditingMotel(null);
        toast({
          title: "Motel atualizado",
          description: "As alterações foram salvas com sucesso!"
        });
      } else {
        console.log("Adicionando novo motel");
        // Adicionar novo motel
        const addedMotel = await api.addMotel(newMotel);
        console.log("Motel adicionado com sucesso:", addedMotel);
        
        // Recarregar todos os motéis em vez de apenas adicionar o novo
        console.log("Recarregando lista de motéis...");
        await fetchMotels();
        
        toast({
          title: "Motel adicionado",
          description: "O motel foi adicionado com sucesso!"
        });
      }
      // Limpar o formulário e fechá-lo
      console.log("Limpando formulário e fechando");
      setNewMotel({ 
        name: "", 
        description: "", 
        location: "",
        website: "",
        phone: "",
        email: "",
        logo: null,
        rooms: [] 
      });
      
      // Fechar o formulário
      console.log("Definindo showAddMotel como false após adicionar/atualizar");
      setShowAddMotel(false);
    } catch (error) {
      console.error("Erro ao salvar motel:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o motel. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleEditMotel = (motel) => {
    setEditingMotel(motel);
    setNewMotel({
      name: motel.name,
      description: motel.description,
      location: motel.location,
      website: motel.website,
      phone: motel.phone,
      email: motel.email,
      logo: motel.logo
    });
    setShowAddMotel(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <header className="bg-white shadow-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            {siteSettings.logo ? (
              <img 
                src={siteSettings.logo} 
                alt={siteSettings.siteName}
                className="h-10 w-auto object-contain" 
              />
            ) : null}
            <h1 className="text-3xl font-bold text-purple-800">{siteSettings.siteName}</h1>
            <ResetAdminButton />
          </Link>
          
          <div className="flex items-center gap-2">
            {isAdminMode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (confirm("Tem certeza que deseja restaurar os dados iniciais? Isso irá apagar todas as alterações.")) {
                      try {
                        setLoading(true);
                        // Remover todos os motéis existentes
                        const currentMotels = [...motels];
                        for (const motel of currentMotels) {
                          await api.deleteMotel(motel.id);
                        }
                        
                        // Adicionar os motéis iniciais
                        const newMotels = [];
                        for (const motel of initialMotels) {
                          const addedMotel = await api.addMotel(motel);
                          newMotels.push(addedMotel);
                        }
                        
                        setMotels(newMotels);
                        toast({
                          title: "Dados reiniciados",
                          description: "Os dados foram restaurados para o estado inicial."
                        });
                      } catch (error) {
                        console.error("Erro ao reiniciar dados:", error);
                        toast({
                          title: "Erro",
                          description: "Ocorreu um erro ao reiniciar os dados. Tente novamente.",
                          variant: "destructive"
                        });
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  Restaurar Dados
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdminSettings(true)}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" /> Configurações
                </Button>
              </>
            )}
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow mb-16">
        {isAdminMode && (
          <div className="mb-8 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  console.log("Botão 'Adicionar Motel' clicado");
                  setEditingMotel(null);
                  setNewMotel({ 
                    name: "", 
                    description: "", 
                    location: "",
                    website: "",
                    phone: "",
                    email: "",
                    logo: null,
                    rooms: [] 
                  });
                  console.log("Definindo showAddMotel como true");
                  setShowAddMotel(true);
                  console.log("showAddMotel após definir:", true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Adicionar Motel
              </Button>
            </div>
            
            {/* Componente de importação/exportação de CSV */}
            <CsvImportExport 
              motels={motels} 
              onImport={handleImportMotels} 
            />
          </div>
        )}

        {showAddMotel && (
          <MotelForm
            newMotel={newMotel}
            setNewMotel={setNewMotel}
            handleAddMotel={handleAddMotel}
            onClose={() => {
              console.log("Função onClose chamada");
              console.log("Definindo showAddMotel como false");
              setShowAddMotel(false);
              console.log("Definindo editingMotel como null");
              setEditingMotel(null);
            }}
            isEditing={!!editingMotel}
          />
        )}

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, localização ou descrição..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <TopAmenities
            amenities={allAmenities}
            selectedAmenities={selectedAmenities}
            onSelect={handleAmenitySelect}
          />
          <PriceRangeFilter
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            maxPrice={1000}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-20">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-lg text-gray-600">Carregando motéis...</p>
            </div>
          ) : filteredMotels.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-lg text-gray-600">Nenhum motel encontrado.</p>
            </div>
          ) : (
            <React.Fragment>
              <AnimatePresence>
                {filteredMotels.map(motel => {
                  const lowestPrice = getLowestPrice(motel);
                  
                  return (
                <motion.div
                  key={motel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <Link to={`/motel/${motel.id}`} className="block">
                    <div className="relative">
                      {motel.logo ? (
                        <img
                          src={motel.logo}
                          alt={`Logo do ${motel.name}`}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <img 
                          className="w-full h-48 object-cover"
                          alt={`Fachada do ${motel.name}`}
                          src="https://images.unsplash.com/photo-1672973859247-2727e1f536f6" />
                      )}
                      {isAdminMode && (
                        <div className="absolute top-2 right-2 flex gap-2" onClick={e => e.preventDefault()}>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteClick(motel.id);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              handleEditMotel(motel);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
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
                            onClick={(e) => e.stopPropagation()}
                          >
                            Website
                          </a>
                        </p>
                      )}
                      
                      {motel.phone && (
                        <p className="text-gray-500 mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <a 
                            href={`tel:${motel.phone}`} 
                            className="hover:text-purple-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {motel.phone}
                          </a>
                        </p>
                      )}
                      
                      {motel.email && (
                        <p className="text-gray-500 mb-4 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <a 
                            href={`mailto:${motel.email}`} 
                            className="hover:text-purple-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {motel.email}
                          </a>
                        </p>
                      )}
                      
                      {lowestPrice && (
                        <p className="text-lg font-bold text-purple-600 mb-4">
                          A partir de R$ {lowestPrice}
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {motel.rooms.length} {motel.rooms.length === 1 ? 'quarto' : 'quartos'} disponíveis
                        </span>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          Ver detalhes <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
                })}
              </AnimatePresence>
            </React.Fragment>
          )}
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
        title="Confirmar exclusão de motel"
        description="Tem certeza que deseja excluir este motel? Esta ação não pode ser desfeita."
      />
      
      {showAdminSettings && (
        <AdminSettings 
          onClose={() => setShowAdminSettings(false)}
          siteSettings={siteSettings}
          setSiteSettings={setSiteSettings}
        />
      )}
      
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
