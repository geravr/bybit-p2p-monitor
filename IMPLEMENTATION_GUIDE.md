# BYBIT P2P MONITOR - INSTRUCCIONES DE DESPLIEGUE

## 🚀 Configuración Inicial

1. **Clonar repo:**
```bash
git clone https://github.com/geravr/bybit-p2p-monitor.git
cd bybit-p2p-monitor
```

2. **Instalar dependencias:**
```bash
bun install
```

3. **Configurar .env:**
```bash
cp .env.example .env
# Editar .env con:
# BYBIT_API_KEY=tu_key_aqui
# BYBIT_API_SECRET=tu_secret_aqui
# DATABASE_URL=postgresql://user:pass@localhost:5432/bybit_p2p
```

4. **Levantar Postgres con Docker:**
```bash
bun run docker:up
```

5. **Ejecutar migraciones:**
```bash
bun drizzle-kit push
bun drizzle-kit generate
```

6. **Ejecutar worker:**
```bash
bun run dev
```

## 📂 Estructura del Proyecto

```
bybit-p2p-monitor/
├── src/
│   ├── bybit/          # Cliente API de Bybit P2P
│   │   ├── types.ts    # Interfaces TypeScript
│   │   ├── constants.ts# Configuración API
│   │   └── client.ts   # Cliente con firma HMAC
│   ├── db/             # Base de datos
│   │   ├── schema.ts   # Drizzle schema (4 tablas)
│   │   ├── connections.ts # Conexión PostgreSQL
│   │   └── drizzle.meta/ # Metadatos DB
│   ├── monitors/       # Worker de monitoreo
│   │   └── worker.ts   # Cron job para fetch ads
│   └── api/            # API REST Hono
│       ├── routes/     # Rutas
│       ├── index.ts    # Entry principal
│       └── health.ts   # Health check
├── drizzle/            # Migraciones
├── .env                # Variables de entorno
└── README.md           # Documentación
```

## 🗄️ Base de Datos

### Tablas:
- `merchants` - Información de merchants P2P
- `ads` - Anuncios de compra/venta
- `price_logs` - Historial de cambios de precios
- `orders` - Órdenes completadas

## 🔑 Endpoints de la API

### GET /api/health
Health check del sistema.

### GET /api/merchants
Listar todos los merchants con filtros.

### GET /api/merchants/:id
Detalles de un merchant específico.

### GET /api/ads
Listar ads con filtros (asset, fiat, minPrice, maxPrice).

### GET /api/ads/:id
Información completa de un ad.

### GET /api/analytics/price-change
Estadísticas de cambios de precios.

### GET /api/analytics/top-merchants
Top merchants por completion rate.

## 👨‍💻 Desarrollo

### Scripts disponibles:
```bash
bun run dev          # Dev server
bun run worker       # Ejecutar worker manualmente
bun run db:push      # Push migrations
bun run db:generate  # Generar types
bun run db:studio    # UI de DB
bun run db:migrate   # Ejecutar migrations
```

### Depurar worker:
```bash
bun run worker
bun run db:studio
```

## 📊 Monitorización

El worker se ejecuta cada 5 minutos (configurable en `.env`):
- Fetch todos los ads online
- Detectar cambios de precio
- Guardar en price_logs
- Alertar si price < X% del mercado

## 🔐 Seguridad

- Nunca subir `.env` a git
- Usar tokens API de testnet primero
- Rotar API keys periódicamente
- Implementar rate limiting en producción

## 🐛 Troubleshooting

### Error de firma API
- Verificar API key/secret correctos
- Checkear timestamp
- Validar que sea testnet para pruebas

### Error de conexión DB
- Asegurar que Docker está corriendo
- Verificar DATABASE_URL
- Ejecutar `bun run db:up`

## 📈 Próximas Características

- [ ] Web hooks para alertas en tiempo real
- [ ] Dashboard UI para métricas
- [ ] Integración con Telegram para notificaciones
- [ ] Soporte para más pares (USDC, BTC, etc.)
- [ ] Rate limiting por IP

---

**Última actualización:** 2026-03-14
**Versión:** 1.0.0
