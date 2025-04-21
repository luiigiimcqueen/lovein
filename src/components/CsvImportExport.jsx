import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Download, Loader2 } from 'lucide-react';

export default function CsvImportExport({ motels, onImport }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const fileInputRef = React.useRef(null);

  // Função para converter array para CSV
  const arrayToCsv = (data) => {
    // Obter cabeçalhos (todas as chaves possíveis)
    const headers = [
      'ID', 'Nome', 'Descrição', 'Localização', 
      'Website', 'Telefone', 'Email', 'Logo URL'
    ];
    
    // Criar linha de cabeçalho
    let csvContent = headers.join(',') + '\\n';
    
    // Adicionar linhas de dados
    data.forEach(item => {
      const row = [
        item.id || '',
        item.name ? `"${item.name.replace(/"/g, '""')}"` : '',
        item.description ? `"${item.description.replace(/"/g, '""')}"` : '',
        item.location ? `"${item.location.replace(/"/g, '""')}"` : '',
        item.website || '',
        item.phone || '',
        item.email || '',
        item.logo || ''
      ];
      csvContent += row.join(',') + '\\n';
    });
    
    return csvContent;
  };

  // Função para converter CSV para array
  const csvToArray = (csvText) => {
    // Dividir por linhas
    const lines = csvText.split('\\n');
    
    // Obter cabeçalhos
    const headers = lines[0].split(',');
    
    // Processar linhas de dados
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Pular linhas vazias
      
      // Processar linha considerando valores entre aspas
      const values = [];
      let inQuotes = false;
      let currentValue = '';
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        
        if (char === '"') {
          // Se já estamos entre aspas e encontramos outra aspa
          if (inQuotes && lines[i][j+1] === '"') {
            // Aspas escapadas (duas aspas seguidas)
            currentValue += '"';
            j++; // Pular a próxima aspa
          } else {
            // Alternar estado de aspas
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          // Fim do valor atual
          values.push(currentValue);
          currentValue = '';
        } else {
          // Adicionar caractere ao valor atual
          currentValue += char;
        }
      }
      
      // Adicionar o último valor
      values.push(currentValue);
      
      // Criar objeto com os valores
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        // Mapear cabeçalhos para propriedades do objeto
        const header = headers[j].trim();
        const value = values[j] ? values[j].trim() : '';
        
        // Mapear cabeçalhos CSV para propriedades do objeto
        switch (header) {
          case 'ID':
            obj.id = value ? parseInt(value) : Date.now() + Math.floor(Math.random() * 1000);
            break;
          case 'Nome':
            obj.name = value;
            break;
          case 'Descrição':
            obj.description = value;
            break;
          case 'Localização':
            obj.location = value;
            break;
          case 'Website':
            obj.website = value;
            break;
          case 'Telefone':
            obj.phone = value;
            break;
          case 'Email':
            obj.email = value;
            break;
          case 'Logo URL':
            obj.logo = value || null;
            break;
        }
      }
      
      // Adicionar quartos vazios
      obj.rooms = [];
      
      // Adicionar ao resultado
      if (obj.name) { // Nome é obrigatório
        result.push(obj);
      }
    }
    
    return result;
  };

  // Função para exportar motéis para CSV
  const handleExport = () => {
    try {
      setLoading(true);
      
      // Converter motéis para CSV
      const csvContent = arrayToCsv(motels);
      
      // Criar blob e link para download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `moteis_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Exportação concluída',
        description: `${motels.length} motéis exportados com sucesso.`
      });
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar os dados para CSV.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para importar motéis do CSV
  const handleImport = (event) => {
    const file = event.target.files[0];
    
    if (!file) return;
    
    try {
      setLoading(true);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const csvText = e.target.result;
          const importedMotels = csvToArray(csvText);
          
          if (!importedMotels || importedMotels.length === 0) {
            throw new Error('Arquivo CSV vazio ou inválido');
          }
          
          // Chamar função de callback para processar os motéis importados
          await onImport(importedMotels);
          
          toast({
            title: 'Importação concluída',
            description: `${importedMotels.length} motéis importados com sucesso.`
          });
        } catch (error) {
          console.error('Erro ao processar arquivo CSV:', error);
          toast({
            title: 'Erro na importação',
            description: error.message || 'Não foi possível importar os dados do CSV.',
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
          description: 'Não foi possível ler o arquivo CSV.',
          variant: 'destructive'
        });
        setLoading(false);
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      toast({
        title: 'Erro na importação',
        description: 'Não foi possível importar os dados do CSV.',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  // Função para criar e baixar um modelo de CSV
  const handleDownloadTemplate = () => {
    try {
      setLoading(true);
      
      // Criar dados de exemplo
      const templateData = [
        {
          id: '',
          name: 'Motel Exemplo',
          description: 'Descrição do motel exemplo',
          location: 'Rua Exemplo, 123',
          website: 'https://www.exemplo.com',
          phone: '(11) 99999-9999',
          email: 'contato@exemplo.com',
          logo: 'https://exemplo.com/logo.png'
        }
      ];
      
      // Converter para CSV
      const csvContent = arrayToCsv(templateData);
      
      // Criar blob e link para download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'modelo_importacao_moteis.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
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
          Importe motéis a partir de um arquivo CSV ou exporte os motéis existentes.
        </p>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {/* Botão para baixar modelo */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Baixar Modelo
          </Button>
          
          {/* Botão para importar */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Importar CSV
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".csv"
            className="hidden"
          />
          
          {/* Botão para exportar */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={loading || motels.length === 0}
            className="flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exportar CSV
          </Button>
        </div>
      </div>
    </div>
  );
}