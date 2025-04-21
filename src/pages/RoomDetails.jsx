import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, Play, Pause, ChevronLeft, ChevronRight, Info, ChevronDown, ChevronUp } from "lucide-react";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { api } from "@/services/api";

export default function RoomDetails() {
  const { motelId, roomId } = useParams();
  const [motels, setMotels] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedInfo, setExpandedInfo] = React.useState({});
  const [siteSettings, setSiteSettings] = React.useState({
    siteName: "Portal de Motéis",
    logo: null,
    footerText: "© 2024 Portal de Motéis. Todos os direitos reservados.",
    contactEmail: "contato@portaldemoteis.com",
    contactPhone: "(11) 99999-9999"
  });
  
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [autoplay, setAutoplay] = React.useState(true);
  
  // Carregar dados da API
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Carregando motéis da API...");
        setLoading(true);
        const data = await api.getMotels();
        console.log("Motéis carregados:", data);
        setMotels(data);
        
        // Carregar configurações do site
        const savedSettings = localStorage.getItem("siteSettings");
        if (savedSettings) {
          setSiteSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Encontrar o motel e o quarto
  const motel = React.useMemo(() => {
    return motels.find(m => {
      const mId = m.id;
      return mId.toString() === motelId || mId === parseInt(motelId);
    });
  }, [motels, motelId]);
  
  const room = React.useMemo(() => {
    if (!motel) return null;
    return motel.rooms.find(r => {
      const rId = r.id;
      return rId.toString() === roomId || rId === parseInt(roomId);
    });
  }, [motel, roomId]);
  
  // Configurar o slideshow
  React.useEffect(() => {
    if (!room || !room.images || room.images.length <= 1 || !autoplay) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % room.images.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [room, currentImageIndex, autoplay]);
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
        <header className="bg-white shadow-lg sticky top-0 z-20">
          <div className="container mx-auto px-4 py-6 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <h1 className="text-3xl font-bold text-purple-800">{siteSettings.siteName}</h1>
            </Link>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8 flex-grow mb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <h2 className="text-2xl font-semibold mt-4">Carregando...</h2>
          </div>
        </main>
      </div>
    );
  }
  
  if (!motel || !room) {
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
            </Link>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8 flex-grow mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Quarto não encontrado</h2>
            <p className="mb-6">O quarto que você está procurando não existe ou foi removido.</p>
            <Link to={`/motel/${motelId}`}>
              <Button>Voltar para o motel</Button>
            </Link>
          </div>
        </main>
        
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
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <header className="bg-white shadow-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to={`/motel/${motelId}`}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Voltar para {motel.name}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow mb-16">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 border-b">
            <h2 className="text-3xl font-bold text-purple-800">{room.name}</h2>
            <p className="text-gray-500">{motel.name}</p>
          </div>
          
          {/* Slideshow de imagens */}
          <div className="relative">
            {room.images && room.images.length > 0 ? (
              <>
                <div className="w-full h-96 relative overflow-hidden bg-gray-100 flex items-center justify-center">
                  <AnimatePresence initial={false}>
                    <Zoom 
                      zoomMargin={80}
                      overlayBgColorEnd="rgba(0, 0, 0, 0.85)"
                      wrapStyle={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                      <motion.img
                        key={currentImageIndex}
                        src={room.images[currentImageIndex].url || room.images[currentImageIndex]}
                        alt={`Imagem ${currentImageIndex + 1} do quarto ${room.name}`}
                        className="max-w-full max-h-96 object-contain cursor-zoom-in"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      />
                    </Zoom>
                  </AnimatePresence>
                  
                  {/* Botões de navegação */}
                  <button 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
                    onClick={() => {
                      setCurrentImageIndex(prev => (prev - 1 + room.images.length) % room.images.length);
                      setAutoplay(false);
                    }}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  
                  <button 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
                    onClick={() => {
                      setCurrentImageIndex(prev => (prev + 1) % room.images.length);
                      setAutoplay(false);
                    }}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  
                  {/* Botão de play/pause */}
                  <button 
                    className="absolute right-4 bottom-4 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
                    onClick={() => setAutoplay(prev => !prev)}
                  >
                    {autoplay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Controles do slideshow */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {room.images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                      onClick={() => {
                        setCurrentImageIndex(index);
                        setAutoplay(false);
                      }}
                    />
                  ))}
                </div>
                
                {/* Miniaturas */}
                <div className="flex overflow-x-auto p-4 gap-2 bg-gray-50">
                  {room.images.map((image, index) => (
                    <div 
                      key={index}
                      className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-purple-500' : 'border-transparent'
                      } bg-gray-100 flex items-center justify-center`}
                    >
                      <button
                        onClick={() => {
                          setCurrentImageIndex(index);
                          setAutoplay(false);
                        }}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <img
                          src={image.url || image}
                          alt={`Miniatura ${index + 1}`}
                          className="max-w-full max-h-full object-contain"
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">Sem imagens disponíveis</p>
              </div>
            )}
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Descrição do quarto */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Descrição</h3>
                {room.description ? (
                  <div 
                    className="text-gray-700 mb-6 rich-text-content"
                    dangerouslySetInnerHTML={{ 
                      __html: room.description 
                    }} 
                  />
                ) : (
                  <p className="text-gray-700 mb-6">
                    Experimente o conforto e a elegância do quarto {room.name} no {motel.name}. 
                    Um ambiente perfeito para momentos especiais, com todo o conforto e privacidade que você merece.
                  </p>
                )}
                
                <h3 className="text-xl font-semibold mb-4">Localização</h3>
                <p className="text-gray-700 mb-2">{motel.location}</p>
                
                {motel.phone && (
                  <p className="text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-purple-600" /> {motel.phone}
                  </p>
                )}
              </div>
              
              {/* Comodidades */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Comodidades</h3>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {room.amenities.map((amenity, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-800">{amenity}</span>
                    </div>
                  ))}
                </div>
                
                <h3 className="text-xl font-semibold mb-4">Tabela de Preços</h3>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Período
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Preço
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {room.priceOptions?.map((option, index) => (
                        <React.Fragment key={index}>
                          <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {typeof option.hours === 'number' ? `${option.hours} horas` : option.hours}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-semibold flex items-center">
                              {option.price} €
                              {option.info && (
                                <button 
                                  className="ml-2 text-gray-500 hover:text-purple-600 focus:outline-none"
                                  onClick={() => setExpandedInfo(prev => ({
                                    ...prev,
                                    [index]: !prev[index]
                                  }))}
                                  aria-label="Mostrar informações adicionais"
                                >
                                  <Info className="w-4 h-4" />
                                  {expandedInfo[index] ? (
                                    <ChevronUp className="w-4 h-4 ml-1 inline" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 ml-1 inline" />
                                  )}
                                </button>
                              )}
                            </td>
                          </tr>
                          {option.info && expandedInfo[index] && (
                            <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td colSpan={2} className="px-6 py-4 text-sm text-gray-700 border-t border-gray-100">
                                <div 
                                  className="bg-gray-50 p-3 rounded-md rich-text-content"
                                  dangerouslySetInnerHTML={{ __html: option.info }}
                                />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <Link to={`/motel/${motelId}`}>
                <Button variant="outline" className="mr-4">
                  Ver outros quartos
                </Button>
              </Link>
              <a href={`tel:${motel.phone}`}>
                <Button>Reservar agora</Button>
              </a>
            </div>
          </div>
        </div>
      </main>
      
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