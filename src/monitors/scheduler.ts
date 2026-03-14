export class Scheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private callback: () => Promise<void>;
  private interval: number;
  private logger: (msg: string) => void;
  private isRunning: boolean = false;

  constructor({
    callback,
    interval,
    logger = console.log,
  }: {
    callback: () => Promise<void>;
    interval: number;
    logger?: (msg: string) => void;
  }) {
    this.callback = callback;
    this.interval = interval;
    this.logger = logger;
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger("⚠️ Scheduler ya está en ejecución");
      return;
    }

    this.isRunning = true;
    this.logger("🔄 Scheduler iniciado");

    // Ejecutar inmediatamente
    await this.callback();

    // Configurar interval
    this.intervalId = setInterval(async () => {
      try {
        await this.callback();
      } catch (error) {
        this.logger(`❌ Error en scheduler: ${error}`);
      }
    }, this.interval);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      this.logger("⏹️ Scheduler detenido");
    }
  }

  get isRunning(): boolean {
    return this.isRunning;
  }

  restart(): Promise<void> {
    this.stop();
    return this.start();
  }
}

export default Scheduler;
