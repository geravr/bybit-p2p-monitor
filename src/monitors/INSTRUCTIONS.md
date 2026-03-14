# BYBIT P2P MONITOR - WORKER IMPLEMENTATION

## Objetivo
Monitorear anuncios P2P de Bybit cada X minutos y guardar en DB

## Archivos a crear

### `/src/monitors/worker.ts`
Lógica principal del worker:
- Fetch ads cada interval definido
- Normalizar datos
- Guardar en DB
- Detectar cambios de precio

### `/src/monitors/scheduler.ts`
Scheduler configurable:
- Interval configurable en .env
- Manejo de errores
- Logging

### `/src/monitors/utils.ts`
Helpers:
- Format precios
- Detectar cambios
- Convertir tipos

## Script a ejecutar
```bash
bun run src/monitors/worker.ts
```
