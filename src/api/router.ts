export class APIRouter {
  private honoApp: any;
  private db: any;

  constructor(honoApp: any) {
    this.honoApp = honoApp;
    // db será inyectado
  }

  registerRoutes() {
    this.honoApp.get("/health", (c: any) => {
      return c.json({ status: "ok", timestamp: new Date().toISOString() });
    });

    // Rutas API se añadirán después
  }
}
