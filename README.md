# Inspetor Rodoviário - PWA

Aplicativo Progressive Web App (PWA) para documentação offline de ocorrências rodoviárias com captura de fotos e marca d'água personalizada.

## Funcionalidades

- ✅ **Funcionamento 100% Offline** com IndexedDB
- 📸 **Captura de fotos** com câmera do dispositivo
- 🖼️ **Marca d'água automática** personalizável
- 🛣️ **Gestão de rodovias** (SP-310, SP-333, SP-326, SP-351, SP-323)
- 📍 **Localização precisa** (Km + Metros)
- 📋 **Categorização de atividades** (Pavimento, Drenagem, etc.)
- 📊 **Relatórios Excel** exportáveis
- 📱 **PWA instalável** no Android/iOS

## Deploy no Vercel

### Passo a Passo:
1. Acesse vercel.com e conecte sua conta GitHub
2. Clique em "New Project" e selecione `Ponsoni11/FiscalDeEstradas`
3. **IMPORTANTE**: Configure exatamente assim:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Clique em "Deploy"

### Alternativa (Vercel.json):
O arquivo `vercel.json` na raiz configura automaticamente o build do frontend.

## Desenvolvimento Local

```bash
# Instalar dependências
cd client
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Estrutura do Projeto

```
/
├── client/          # Frontend React PWA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   └── hooks/
│   ├── public/
│   └── package.json
├── shared/          # Schemas compartilhados
├── server/          # Backend Express (opcional)
└── vercel.json      # Configuração Vercel
```

## Tecnologias Utilizadas

- **React 18** + **TypeScript**
- **Vite** (Build tool)
- **TailwindCSS** + **shadcn/ui**
- **React Query** (Estado)
- **IndexedDB** (Armazenamento offline)
- **Camera API** + **Canvas API** (Fotos e marca d'água)
- **Service Worker** (PWA)

## Como Usar

1. Acesse a URL do deploy
2. **No Android**: Chrome > Menu > "Adicionar à tela inicial"
3. Preencha dados da ocorrência
4. Tire fotos com marca d'água automática
5. Gerencie e exporte relatórios

Desenvolvido para engenheiros rodoviários que precisam documentar ocorrências em campo, mesmo sem internet.