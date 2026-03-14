# SUBAGENTE 3: API REST Hono

## TAREA
Crear endpoints REST completos para merchants, ads y analytics

## ARCHIVOS
1. `/src/api/routes/merchants.ts`
2. `/src/api/routes/ads.ts`
3. `/src/api/routes/analytics.ts`
4. `/src/api/index.ts` (reemplazar esqueleto)

## DEPENDENCIAS
```bash
bun add zod
```

## ENDPOINTS

### GET /health
Health check básico

### GET /api/merchants
Listar todos, filtros: page, limit, country, minTrades

### GET /api/merchants/:id
Detalles + ads activos del merchant

### GET /api/ads
Listar ads, filtros: asset, fiat, minPrice, maxPrice, adType, active

### GET /api/ads/:id
Detalles + price history

### GET /api/analytics/price-change
Mejores precios hoy, cambios %

### GET /api/analytics/top-merchants
Top merchants por completionRate

### GET /api/stats/summary
Contadores: total ads, merchants, cambios hoy
