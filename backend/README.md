# 🎫 Boletera Backend API

Sistema backend completo para generación automática de tickets usando Express.js, Firebase y SendGrid.

## 🚀 Características

- **Generación automática de tickets** cuando el pago es confirmado
- **Códigos QR** únicos para cada ticket
- **PDFs profesionales** generados con Puppeteer
- **Firebase Storage** para almacenamiento seguro
- **SendGrid** para envío de emails
- **Express.js** con TypeScript
- **Validación** de datos robusta
- **Rate limiting** y seguridad

## 📋 Prerrequisitos

- Node.js >= 16.x
- npm o yarn
- Cuenta de Firebase con Firestore y Storage
- API Key de SendGrid
- Service Account de Firebase

## 🛠️ Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp env.example .env
```

Edita `.env` con tus configuraciones:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_PRIVATE_KEY_ID=tu-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY_AQUI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=tu-client-id
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com

# SendGrid Configuration
SENDGRID_API_KEY=tu-sendgrid-api-key
FROM_EMAIL=noreply@tudominio.com

# Security
CORS_ORIGIN=http://localhost:3000,https://tudominio.com
```

### 3. Compilar TypeScript

```bash
npm run build
```

### 4. Iniciar en desarrollo

```bash
npm run dev
```

### 5. Iniciar en producción

```bash
npm start
```

## 🌐 API Endpoints

### Health Check
```http
GET /health
```

### Procesar Pago
```http
POST /api/tickets/process-payment
Content-Type: application/json

{
  "movementId": "123456789",
  "status": "paid"
}
```

### Generar Tickets Manualmente
```http
POST /api/tickets/generate
Content-Type: application/json

{
  "movementId": "123456789"
}
```

### Generar Códigos QR
```http
POST /api/tickets/generate-codes
Content-Type: application/json

{
  "ticketId": "ticket123",
  "movementId": "movement123"
}
```

### Obtener Tickets por Movimiento
```http
GET /api/tickets/movement/{movementId}
```

### Validar Ticket
```http
GET /api/tickets/validate/{ticketId}
```

## 🔄 Flujo de Trabajo

1. **Cliente realiza pago** → Frontend confirma pago
2. **API recibe confirmación** → `POST /api/tickets/process-payment`
3. **Sistema actualiza Firestore** → Status = "paid"
4. **Email de confirmación** → Se envía inmediatamente
5. **Generación en background**:
   - Obtiene tickets de Firestore
   - Genera códigos QR y de barras
   - Crea PDF con Puppeteer
   - Sube a Firebase Storage
   - Envía email con tickets

## 🏗️ Arquitectura

```
backend/
├── src/
│   ├── config/
│   │   └── firebase.ts          # Configuración Firebase
│   ├── services/
│   │   ├── ticketService.ts     # Lógica de tickets
│   │   └── emailService.ts      # Envío de emails
│   ├── routes/
│   │   └── tickets.ts           # Rutas API
│   ├── types/
│   │   └── index.ts             # Interfaces TypeScript
│   └── server.ts                # Servidor Express
├── dist/                        # Código compilado
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 Desarrollo

### Comandos disponibles

```bash
# Desarrollo con hot reload
npm run dev

# Compilar TypeScript
npm run build

# Linting
npm run lint
npm run lint:fix

# Producción
npm start
```

### Estructura de datos

#### MovementData
```typescript
interface MovementData {
  id: string;
  total: number;
  subtotal: number;
  cargo_servicio: number;
  tipo_pago: string;
  fecha: FirebaseTimestamp;
  status?: "pending" | "paid" | "cancelled";
  buyer_email?: string;
  buyer_name?: string;
  event_id?: string;
}
```

#### TicketData
```typescript
interface TicketData {
  id: string;
  movementId: string;
  zona: string;
  fila: string;
  asiento: number;
  precio: number;
  qrCode: string;
  barCode: string;
  eventInfo: EventInfo;
  buyerInfo: BuyerInfo;
}
```

## 🔐 Seguridad

- **Helmet.js** para headers de seguridad
- **Rate limiting** (100 requests/15min)
- **CORS** configurado
- **Validación** de entrada con express-validator
- **Variables de entorno** para secretos

## 📊 Monitoreo

- **Morgan** para logging HTTP
- **Health check** endpoint
- **Error handling** centralizado
- **Graceful shutdown** configurado

## 🚀 Despliegue

### Docker (opcional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Variables de entorno en producción

Asegúrate de configurar todas las variables de entorno en tu plataforma de despliegue.

## 🐛 Troubleshooting

### Error: Firebase configuration not found
- Verifica que todas las variables `FIREBASE_*` estén configuradas
- Asegúrate de que el private key tenga los `\n` correctos

### Error: SendGrid API key
- Verifica tu `SENDGRID_API_KEY`
- Confirma que `FROM_EMAIL` esté verificado en SendGrid

### Error: PDF generation fails
- Verifica que Puppeteer pueda ejecutarse en tu entorno
- En producción, puede necesitar flags adicionales

## 📝 Logs

El sistema registra:
- Todas las requests HTTP
- Errores de procesamiento
- Estados de generación de tickets
- Envíos de email

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. 