/**
 * Config Manager
 * 
 * Standalone library for managing security configurations and policies.
 */

export interface SecurityConfig {
  detection: {
    enabled: boolean;
    confidenceThreshold: number;
  };
  containment: {
    autoContain: boolean;
    threshold: number;
  };
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
  };
}

export interface ConfigSection {
  key: string;
  value: any;
  description?: string;
  mutable: boolean;
}

export class ConfigManager {
  private configs: Map<string, ConfigSection>;
  private defaults: SecurityConfig;

  constructor() {
    this.configs = new Map();
    this.defaults = this.getDefaultConfig();
    this.initializeDefaults();
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): SecurityConfig {
    return {
      detection: {
        enabled: true,
        confidenceThreshold: 0.7
      },
      containment: {
        autoContain: true,
        threshold: 3
      },
      logging: {
        enabled: true,
        level: 'info'
      }
    };
  }

  /**
   * Initialize default configs
   */
  private initializeDefaults(): void {
    this.set('detection.enabled', true, 'Enable threat detection', false);
    this.set('detection.confidenceThreshold', 0.7, 'Minimum confidence for alerts', true);
    this.set('containment.autoContain', true, 'Auto-contain high threats', false);
    this.set('containment.threshold', 3, 'Threat level for auto-containment', true);
    this.set('logging.enabled', true, 'Enable logging', false);
    this.set('logging.level', 'info', 'Log level', true);
  }

  /**
   * Set configuration value
   */
  set(key: string, value: any, description?: string, mutable = true): void {
    this.configs.set(key, {
      key,
      value,
      description,
      mutable
    });
  }

  /**
   * Get configuration value
   */
  get<T = any>(key: string): T | undefined {
    const config = this.configs.get(key);
    return config?.value as T | undefined;
  }

  /**
   * Get all configs
   */
  getAll(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, config] of this.configs) {
      result[key] = config.value;
    }
    return result;
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.configs.has(key);
  }

  /**
   * Delete configuration
   */
  delete(key: string): boolean {
    const config = this.configs.get(key);
    if (!config) return false;
    if (!config.mutable) return false;
    return this.configs.delete(key);
  }

  /**
   * Update config (only if mutable)
   */
  update(key: string, value: any): boolean {
    const config = this.configs.get(key);
    if (!config) return false;
    if (!config.mutable) return false;
    config.value = value;
    return true;
  }

  /**
   * Get config metadata
   */
  getMetadata(key: string): ConfigSection | undefined {
    return this.configs.get(key);
  }

  /**
   * Get all mutable configs
   */
  getMutable(): ConfigSection[] {
    return Array.from(this.configs.values()).filter(c => c.mutable);
  }

  /**
   * Get all immutable configs
   */
  getImmutable(): ConfigSection[] {
    return Array.from(this.configs.values()).filter(c => !c.mutable);
  }

  /**
   * Export configuration
   */
  export(): string {
    return JSON.stringify(this.getAll(), null, 2);
  }

  /**
   * Import configuration
   */
  import(configJson: string): boolean {
    try {
      const imported = JSON.parse(configJson);
      for (const [key, value] of Object.entries(imported)) {
        this.set(key, value);
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Reset to defaults
   */
  reset(): void {
    this.configs.clear();
    this.initializeDefaults();
  }
}

export default ConfigManager;
