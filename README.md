# BYBIT P2P MONITOR

## 🚀 Sistema de Monitoreo de Precios P2P de Bybit

Monitor en tiempo real de anuncios P2P (buy/sell) de Bybit, guardando historial de precios para análisis.

## 🏗️ Arquitectura

- **Runtime:** 🍎 Bun (10x más rápido)
- **Framework:** ⚡ Hono (Edge-ready)
- **ORM:** 🐉 Drizzle (Type-safe)
- **DB:** PostgreSQL
- **API:** Bybit P2P Open API

## 📦 Installation

1. **Clonar repositorio:**
```bash
git clone https://github.com/geravr/bybit-p2p-monitor.git
cd bybit-p2p-monitor
```

2. **Instalar dependencias:**
```bash
bun install
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con:
# - BYBIT_API_KEY
# - BYBIT_API_SECRET  
# - DATABASE_URL
```

4. **Levantar PostgreSQL:**
```bash
bun run docker:up
```

5. **Ejecutar migraciones:**
```bash
bun run db:push
```

## 🏃 Ejecución

### Worker de Monitoreo (Recomendado)
```bash
# Ejecutar en desarrollo
bun run worker

# Cada 5 minutos por defecto (configurable en .env)
```

### Desarrollo
```bash
bun run dev  # Hono server + worker automático
```

## 📊 Qué hace el sistema

1. Cada X minutos (configurable):
   - Fetch anuncios online de Bybit (USDT/MXN)
   - Comparar con DB existente
   - Guardar nuevos merchants/ads
   - Detectar cambios de precio > 0.1%
   - Loggear cambios en `price_logs`

2. Datos guardados:
   - Merchants (nickname, country, trades, rate)
   - Ads (asset, fiat, price, min/max, payment methods)
   - Price history (por cada ad)
   - Orders completados (futuro)

## 🔑 Endpoint Bybit P2P

Base URL:
- Mainnet: `https://api.bybit.com`
- Testnet: `https://api-testnet.bybit.com`

Endpoints usamos:
- `GET /v5/p2p/item/online` - Listar ads públicos
- `GET /v5/p2p/item/personal/list` - Listar mis ads
- `GET /v5/p2p/order/simplifyList` - Listar órdenes

## 🗄️ Bases de Datos

### Tablas:

- `merchants` - Info de traders P2P
- `ads` - Anuncios activos
- `price_logs` - Historial de precios
- `orders` - Órdenes transadas

## 📈 Próximas Features

- [x] Fetch de ads por asset/fiat
- [x] Detección de cambios de precio
- [ ] API REST para consultar datos
- [ ] Alerts Telegram para precios bajos
- [ ] Dashboard analytics
- [ ] Soporte para más pares (BTC, ETH, USDC)

## 🛠️ Scripts Disponibles

```bash
bun run dev          # Dev server
bun run worker       # Worker manual
bun run db:push      # Push migrations
bun run db:generate  # Generate types
bun run db:studio    # DB UI
bun run db:migrate   # Run migrations
bun run docker:up    # Start Postgres
bun run docker:down  # Stop Postgres
```

## 🐛 Troubleshooting

### Error de firma API
- Verificar API key/secret correctos
- Checkear timestamp
- Usar testnet para pruebas

### Error de conexión DB
- Asegurar Docker corriendo
- Verificar DATABASE_URL
- Ejecutar `bun run db:up`

## 🔒 Seguridad

- Nunca subir `.env` a git
- Usar tokens de testnet primero
- Rotar API keys periódicamente
- Implementar rate limiting en production

## 📝 Licencia

MIT License - ver LICENSE file

---

**Version:** 1.0.0  
**Created:** 2026-03-14  
**Maintainer:** @geravr
