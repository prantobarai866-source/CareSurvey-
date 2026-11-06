export interface CarConfig {
  id: string;
  name: string;
  brand: string;
  topSpeed: number; // Base KM/H
  accel: number; // 0-100
  nitroBoost: number; // extra KM/H
  maxShields: number;
  bodyColor: number;
  accentColor: number;
  underglow: string;
  priceTaka: number;
  unlocked: boolean;
  upgrades?: {
    speedLevel: number;
    nitroLevel: number;
  };
}

export interface RoadTheme {
  id: string;
  name: string;
  tagline: string;
  priceTaka: number;
  unlocked: boolean;
  roadColor: number;
  lineColorA: number;
  lineColorB: number;
  guardrailColorA: number;
  guardrailColorB: number;
  ambientLight: number;
  dirLightA: number;
  dirLightB: number;
  fogColor: number;
  fogDensity: number;
  skyType: 'daytime' | 'dhaka_city' | 'cyber' | 'tokyo_rain' | 'sahara_sunset' | 'magma' | 'space';
  weather?: 'none' | 'rain' | 'embers' | 'warp_stars';
  hasDhakaLandmarks?: boolean;
}

export type DynamicWeatherType = 'clear' | 'rain' | 'fog' | 'neon_snow';

export interface WeatherState {
  type: DynamicWeatherType;
  name: string;
  icon: string;
  effectLabel: string;
  gripFactor: number; // 1.0 = full grip, 0.78 = wet rain, 0.62 = slippery neon snow
  bonusMultiplier: number; // +25% in rain, +40% in fog, +50% in neon snow
}

export interface GlobalUpgrades {
  engineLevel: number; // Level 1 to 5 (+15 km/h each)
  nitroLevel: number; // Level 1 to 5 (Boost duration & speed)
  shieldLevel: number; // Level 1 to 5 (+1 max shield point)
  magnetLevel: number; // Level 1 to 5 (Pulls money/cash bundles within 5m-18m)
  multiplierLevel: number; // Level 1 to 5 (+20% to +100% cash earnings bonus)
}

export type PowerupType = 'cash_bundle' | 'gold_coin' | 'nitro' | 'shield' | 'magnet' | 'police_escort';

export interface CashMission {
  id: string;
  title: string;
  desc: string;
  target: number;
  progress: number;
  rewardTaka: number;
  type: 'distance' | 'near_miss' | 'cash_collect';
}

export interface GameStats {
  score: number;
  distance: number;
  speed: number;
  maxSpeed: number;
  nitro: number;
  shields: number;
  maxShields: number;
  combo: number;
  comboTimer: number;
  policeActive: boolean;
  policeEscortActive?: boolean;
  policeEscortTimer?: number;
  policeEscortMultiplier?: number;
  nearMisses: number;
  cashCollectedThisRun: number;
  activeMission: CashMission;
  magnetActive?: boolean;
  feverActive?: boolean;
  weather: WeatherState;
  weatherAlert?: { title: string; subtitle: string; icon: string; color: string } | null;
}

export interface RunSummary {
  score: number;
  distance: number;
  maxSpeed: number;
  nearMisses: number;
  cashEarned: number;
  isNewRecord: boolean;
}
