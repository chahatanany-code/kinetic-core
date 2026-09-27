// KINETIC CORE - Sensor Provider Architecture
// Pure interface design for external hardware connectivity.
// Zero fake biometric data: strictly distinguishes MEASURED from UNCONNECTED.

import { DataOrigin } from './index';

export type SensorType = 
  | 'HEART_RATE_BLE'
  | 'IMU_ACCELEROMETER'
  | 'PUNCH_TRACKER'
  | 'KICK_SENSOR'
  | 'SMARTWATCH_STREAM';

export interface SensorMetadata {
  id: string;
  name: string;
  type: SensorType;
  manufacturer?: string;
  batteryLevel?: number;
  sampleRateHz: number;
}

export interface SensorReading {
  sensorId: string;
  timestamp: number;
  origin: DataOrigin; // Must be 'MEASURED' when real hardware is linked
  values: {
    rawX?: number;
    rawY?: number;
    rawZ?: number;
    impactForceNewtons?: number; // Real piezoelectric / strain gauge only
    strikeVelocityMps?: number;
    heartRateBpm?: number;
  };
}

export interface SensorProvider {
  metadata: SensorMetadata;
  isConnected: boolean;
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  getLatestReading(): SensorReading | null;
  subscribe(callback: (reading: SensorReading) => void): () => void;
}

// Registry for future Bluetooth Low Energy (Web Bluetooth) or WebUSB sensors
export class SensorRegistry {
  private static providers: Map<string, SensorProvider> = new Map();

  public static register(provider: SensorProvider): void {
    this.providers.set(provider.metadata.id, provider);
  }

  public static get(id: string): SensorProvider | undefined {
    return this.providers.get(id);
  }

  public static getAll(): SensorProvider[] {
    return Array.from(this.providers.values());
  }

  public static isAnyConnected(): boolean {
    return Array.from(this.providers.values()).some((p) => p.isConnected);
  }
}
