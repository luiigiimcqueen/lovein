# Configuração do Cloudinary para Armazenamento de Imagens

Este documento explica como configurar o Cloudinary para armazenar as imagens do seu projeto, em vez de incluí-las diretamente no arquivo JSON.

## 1. Criar uma conta no Cloudinary

1. Acesse [Cloudinary](https://cloudinary.com/) e crie uma conta gratuita
2. Após criar a conta, você terá acesso ao seu Dashboard

## 2. Obter as credenciais do Cloudinary

No Dashboard do Cloudinary, você encontrará suas credenciais:
- Cloud Name
- API Key
- API Secret

## 3. Configurar as variáveis de ambiente

1. Abra o arquivo `.env` na pasta `backend`
2. Substitua os valores das variáveis com suas credenciais do Cloudinary:

```
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

## 4. Iniciar o servidor

1. Navegue até a pasta `backend`
2. Execute `npm install` para instalar as dependências
3. Execute `npm start` para iniciar o servidor

## 5. Como funciona

- Quando você faz upload de uma imagem, ela é enviada para o Cloudinary
- Apenas a URL da imagem é armazenada no arquivo JSON
- Isso reduz significativamente o tamanho do arquivo JSON
- As imagens são servidas diretamente do CDN do Cloudinary, melhorando o desempenho

## 6. Benefícios

- **Redução do tamanho do arquivo JSON** - Armazena apenas URLs em vez de dados base64
- **Melhor desempenho** - Carregamento mais rápido da aplicação
- **Escalabilidade** - Suporta facilmente um grande número de imagens
- **Otimização de imagens** - O Cloudinary oferece redimensionamento e otimização automáticos
- **CDN integrado** - Entrega mais rápida das imagens para usuários em diferentes localizações

## 7. Limitações da conta gratuita

A conta gratuita do Cloudinary oferece:
- 25GB de armazenamento
- 25GB de largura de banda mensal
- Até 25 transformações de imagem

Isso é mais que suficiente para a maioria dos projetos pequenos a médios.