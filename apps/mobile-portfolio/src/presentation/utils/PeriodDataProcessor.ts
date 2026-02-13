export type Period = "1D" | "1W" | "1M" | "3M" | "1Y";

interface PeriodConfig {
  daysBack: number;
  maxPoints: number;
}

interface VolumeHistoryEntry {
  price: number;
  volume: number;
  timestamp: number;
}

export class PeriodDataProcessor {
  private static readonly PERIOD_CONFIGS: Record<Period, PeriodConfig> = {
    "1D": { daysBack: 1, maxPoints: 24 },
    "1W": { daysBack: 7, maxPoints: 28 },
    "1M": { daysBack: 30, maxPoints: 30 },
    "3M": { daysBack: 90, maxPoints: 90 },
    "1Y": { daysBack: 365, maxPoints: 52 },
  };

  private static readonly DEFAULT_VOLUME = 750000;

  static process(
    period: Period,
    values: number[],
    volumeHistory: VolumeHistoryEntry[]
  ): { data: number[]; timestamps: number[]; volume: number[] } {
    if (values.length === 0) {
      return { data: [], timestamps: [], volume: [] };
    }

    const config = this.PERIOD_CONFIGS[period];
    const now = Date.now();
    const startTime = now - config.daysBack * 24 * 60 * 60 * 1000;

    const data: number[] = [];
    const timestamps: number[] = [];
    const volume: number[] = [];

    const indices = this.selectIndices(values.length, config.maxPoints);

    for (const i of indices) {
      data.push(values[i]);
      const progress = values.length > 1 ? i / (values.length - 1) : 0;
      timestamps.push(startTime + progress * (now - startTime));
      volume.push(this.findVolumeForPrice(values[i], volumeHistory));
    }

    return { data, timestamps, volume };
  }

  private static selectIndices(totalLength: number, maxPoints: number): number[] {
    if (totalLength <= maxPoints) {
      return Array.from({ length: totalLength }, (_, i) => i);
    }
    const step = Math.floor(totalLength / maxPoints);
    const indices: number[] = [];
    for (let i = 0; i < totalLength; i += step) {
      indices.push(i);
    }
    if (indices[indices.length - 1] !== totalLength - 1) {
      indices.push(totalLength - 1);
    }
    return indices;
  }

  private static findVolumeForPrice(priceValue: number, volumeHistory: VolumeHistoryEntry[]): number {
    if (volumeHistory.length === 0) return this.DEFAULT_VOLUME;
    const match = volumeHistory.findLast((e) => Math.abs(e.price - priceValue) < 0.01);
    return match?.volume ?? volumeHistory[volumeHistory.length - 1]?.volume ?? this.DEFAULT_VOLUME;
  }
}
