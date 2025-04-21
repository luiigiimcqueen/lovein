import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Download, Loader2 } from 'lucide-react';

export default function ExcelImportExport({ motels, onImport }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [modulesLoaded, setModulesLoaded] = useState(false);
  const [XLSX, setXLSX] = useState(null);
  const [FileSaver, setFileSaver] = useState(null);
  const fileInputRef = React.useRef(null);
  
  // Carregar módulos dinamicamente
  useEffect(() => {
    const loadModules = async () => {
      try {
        // Importar os módulos
        const xlsxModule = await import('xlsx');
        const fileSaverModule = await import('file-saver');
        
        // Definir os módulos
        setXLSX(xlsxModule.default || xlsxModule);
        setFileSaver(fileSaverModule.default || fileSaverModule);
        setModulesLoaded(true);
        
        console.log('Módulos carregados com sucesso');
      } catch (error) {
        console.error('Erro ao carregar módulos:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os módulos necessários.',
          variant: 'destructive'
        });
      }
    };
    
    loadModules();
  }, [toast]);

  // Função para exportar motéis para Excel
  const handleExport = () => {
    if (!modulesLoaded || !XLSX || !FileSaver) {
      toast({
        title: 'Aguarde',
        description: 'Os módulos necessários estão sendo carregados...',
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Preparar dados para exportação
      const exportData = motels.map(motel => {
        // Simplificar os dados para o Excel
        return {
          'ID': motel.id,
          'Nome': motel.name,
          'Descrição': motel.description,
          'Localização': motel.location,
          'Website': motel.website,
          'Telefone': motel.phone,
          'Email': motel.email,
          'Logo URL': motel.logo,
          'Número de Quartos': motel.rooms?.length || 0
        };
      });
      
      // Criar planilha
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Motéis');
      
      // Gerar arquivo
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Salvar arquivo
      FileSaver.saveAs(data, `moteis_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: 'Exportação concluída',
        description: `${exportData.length} motéis exportados com sucesso.`
      });
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar os dados para Excel.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para importar motéis do Excel
  const handleImport = (event) => {
    if (!modulesLoaded || !XLSX) {
      toast({
        title: 'Aguarde',
        description: 'Os módulos necessários estão sendo carregados...',
      });
      return;
    }
    
    const file = event.target.files[0];
    
    if (!file) return;
    
    try {
      setLoading(true);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Obter primeira planilha
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (!jsonData || jsonData.length === 0) {
            throw new Error('Arquivo Excel vazio ou inválido');
          }
          
          // Converter dados do Excel para o formato de motéis
          const importedMotels = jsonData.map(row => {
            // Verificar campos obrigatórios
            if (!row['Nome']) {
              throw new Error('Campo "Nome" é obrigatório para todos os motéis');
            }
            
            return {
              id: row['ID'] || Date.now() + Math.floor(Math.random() * 1000),
              name: row['Nome'],
              description: row['Descrição'] || '',
              location: row['Localização'] || '',
              website: row['Website'] || '',
              phone: row['Telefone'] || '',
              email: row['Email'] || '',
              logo: row['Logo URL'] || null,
              rooms: [] // Quartos precisam ser adicionados separadamente
            };
          });
          
          // Chamar função de callback para processar os motéis importados
          await onImport(importedMotels);
          
          toast({
            title: 'Importação concluída',
            description: `${importedMotels.length} motéis importados com sucesso.`
          });
        } catch (error) {
          console.error('Erro ao processar arquivo Excel:', error);
          toast({
            title: 'Erro na importação',
            description: error.message || 'Não foi possível importar os dados do Excel.',
            variant: 'destructive'
          });
        } finally {
          setLoading(false);
          // Limpar input de arquivo
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
      
      reader.onerror = () => {
        toast({
          title: 'Erro na leitura do arquivo',
          description: 'Não foi possível ler o arquivo Excel.',
          variant: 'destructive'
        });
        setLoading(false);
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      toast({
        title: 'Erro na importação',
        description: 'Não foi possível importar os dados do Excel.',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  // Função para criar e baixar um modelo de Excel
  const handleDownloadTemplate = () => {
    if (!modulesLoaded || !XLSX || !FileSaver) {
      toast({
        title: 'Aguarde',
        description: 'Os módulos necessários estão sendo carregados...',
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Criar dados de exemplo
      const templateData = [
        {
          'Nome': 'Motel Exemplo',
          'Descrição': 'Descrição do motel exemplo',
          'Localização': 'Rua Exemplo, 123',
          'Website': 'https://www.exemplo.com',
          'Telefone': '(11) 99999-9999',
          'Email': 'contato@exemplo.com',
          'Logo URL': 'https://exemplo.com/logo.png'
        }
      ];
      
      // Criar planilha
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Modelo');
      
      // Gerar arquivo
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Salvar arquivo
      FileSaver.saveAs(data, 'modelo_importacao_moteis.xlsx');
      
      toast({
        title: 'Modelo baixado',
        description: 'O modelo de importação foi baixado com sucesso.'
      });
    } catch (error) {
      console.error('Erro ao criar modelo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o modelo de importação.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-medium">Importar/Exportar Motéis</h3>
      
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-500">
          Importe motéis a partir de um arquivo Excel ou exporte os motéis existentes.
        </p>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {/* Botão para baixar modelo */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            disabled={loading || !modulesLoaded}
            className="flex items-center gap-2"
          >
            {loading || !modulesLoaded ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Baixar Modelo
          </Button>
          
          {/* Botão para importar */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || !modulesLoaded}
            className="flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Importar Excel
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".xlsx, .xls"
            className="hidden"
          />
          
          {/* Botão para exportar */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={loading || !modulesLoaded || motels.length === 0}
            className="flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exportar Excel
          </Button>
        </div>
      </div>
    </div>
  );
}