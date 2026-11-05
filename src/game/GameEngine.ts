import * as THREE from 'three';
import { CarConfig, GameStats, CashMission, RoadTheme, GlobalUpgrades, DynamicWeatherType, WeatherState } from '../types/game';
import { sound } from '../audio/sound';
import { INITIAL_MISSIONS, INITIAL_ROAD_THEMES, INITIAL_UPGRADES } from '../data/cars';

interface TrafficCar {
  group: THREE.Group;
  lane: number;
  speed: number;
  isPolice: boolean;
  policeLights?: { r: THREE.PointLight; b: THREE.PointLight };
  passed: boolean;
  cycle: number;
  width: number;
  length: number;
}

interface CashPickup {
  group: THREE.Group;
  type: 'cash_bundle' | 'gold_coin' | 'nitro' | 'shield';
  lane: number;
  z: number;
  value: number;
  active: boolean;
  magnetSoundPlayed?: boolean;
}

interface Debris {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  rotVel: THREE.Vector3;
  life: number;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private reqId: number | null = null;

  // Active Car, Theme & Upgrades
  private activeCar: CarConfig;
  private currentTheme: RoadTheme;
  private upgrades: GlobalUpgrades;

  // Visual Groups
  private playerGroup: THREE.Group | null = null;
  private shieldMesh: THREE.Mesh | null = null;
  private leftExhaust: THREE.Mesh | null = null;
  private rightExhaust: THREE.Mesh | null = null;
  private underglowLight: THREE.PointLight | null = null;

  // Environment Meshes
  private roadMesh: THREE.Mesh | null = null;
  private roadLines: THREE.Mesh[] = [];
  private guardrails: THREE.Mesh[] = [];
  private buildings: THREE.Group[] = [];
  private roadsideTrees: THREE.Group[] = [];
  private cloudsGroup: THREE.Group | null = null;
  private skyMesh: THREE.Mesh | null = null;
  private sunMesh: THREE.Mesh | null = null;
  private stars: THREE.Points | null = null;
  private weatherParticles: THREE.Points | null = null;
  private weatherPositions: Float32Array | null = null;

  // Dynamic Weather Engine
  public currentWeatherType: DynamicWeatherType = 'clear';
  private weatherTimer = 0;
  private weatherDuration = 0;
  private nextWeatherInterval = 20;
  private weatherAlert: { title: string; subtitle: string; icon: string; color: string } | null = null;
  private weatherAlertTimer = 0;
  private targetFogDensity: number = 0.0028;
  private targetFogColor: THREE.Color = new THREE.Color(0x87ceeb);
  private targetAmbientColor: THREE.Color = new THREE.Color(0xffffff);
  private targetAmbientIntensity: number = 1.2;

  // Lights
  private ambientLight: THREE.AmbientLight | null = null;
  private dirLightA: THREE.DirectionalLight | null = null;
  private dirLightB: THREE.DirectionalLight | null = null;

  // Gameplay State
  public isRunning = false;
  public isPaused = false;
  public isBoosting = false;

  private lane = 0; // -2, -1, 0, 1, 2
  private targetX = 0;
  private readonly laneWidth = 3.2;

  // Metrics
  public score = 0;
  public distance = 0;
  public speed = 140;
  public maxSpeedAchieved = 140;
  public nitro = 100;
  public shields = 1;
  public maxShields = 1;
  public combo = 1;
  public comboTimer = 0;
  public nearMisses = 0;
  public cashCollectedThisRun = 0;

  // Police & Spawns
  public policeActive = false;
  private policeTimer = 0;
  private spawnTimer = 0;
  private pickupTimer = 0;
  private cameraShake = 0;
  private invulnerableTimer = 0;

  // Mission
  public activeMissionIndex = 0;
  public missions: CashMission[] = [...INITIAL_MISSIONS];

  // Entities
  private traffic: TrafficCar[] = [];
  private pickups: CashPickup[] = [];
  private debrisList: Debris[] = [];

  // Callbacks
  private onStatsUpdate: (stats: GameStats) => void;
  private onCrash: () => void;
  private onCashCollected: (amount: number, label: string) => void;
  private onNearMissOvertake: (combo: number, bonusTaka: number) => void;
  private onMissionComplete: (mission: CashMission) => void;

  constructor(
    canvas: HTMLCanvasElement,
    car: CarConfig,
    theme: RoadTheme = INITIAL_ROAD_THEMES[0],
    upgrades: GlobalUpgrades = INITIAL_UPGRADES,
    callbacks: {
      onStatsUpdate: (stats: GameStats) => void;
      onCrash: () => void;
      onCashCollected: (amount: number, label: string) => void;
      onNearMissOvertake: (combo: number, bonusTaka: number) => void;
      onMissionComplete: (mission: CashMission) => void;
    }
  ) {
    this.canvas = canvas;
    this.activeCar = car;
    this.currentTheme = theme;
    this.upgrades = upgrades;

    this.maxShields = car.maxShields + (this.upgrades.shieldLevel - 1);
    this.shields = this.maxShields;

    this.onStatsUpdate = callbacks.onStatsUpdate;
    this.onCrash = callbacks.onCrash;
    this.onCashCollected = callbacks.onCashCollected;
    this.onNearMissOvertake = callbacks.onNearMissOvertake;
    this.onMissionComplete = callbacks.onMissionComplete;

    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1500);
    this.camera.position.set(0, 4.8, 9.8);
    this.camera.rotation.x = -0.22;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.setupLighting();
    this.buildSky();
    this.buildRoad();
    this.buildCity();
    this.buildWeatherParticles();
    this.buildPlayerCar();

    this.applyTheme();

    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    this.animate();
  }

  public updateCar(newCar: CarConfig) {
    this.activeCar = newCar;
    this.maxShields = newCar.maxShields + (this.upgrades.shieldLevel - 1);
    this.shields = Math.min(this.shields, this.maxShields);
    this.buildPlayerCar();
  }

  public updateTheme(newTheme: RoadTheme) {
    this.currentTheme = newTheme;
    this.applyTheme();
  }

  public updateUpgrades(newUpgrades: GlobalUpgrades) {
    this.upgrades = newUpgrades;
    this.maxShields = this.activeCar.maxShields + (this.upgrades.shieldLevel - 1);
    this.shields = Math.min(this.shields, this.maxShields);
  }

  public updateUnderglow(colorHex: string) {
    this.activeCar.underglow = colorHex;
    if (this.underglowLight) {
      this.underglowLight.color.set(colorHex);
    }
  }

  private setupLighting() {
    this.ambientLight = new THREE.AmbientLight(this.currentTheme.ambientLight, 1.2);
    this.scene.add(this.ambientLight);

    this.dirLightA = new THREE.DirectionalLight(this.currentTheme.dirLightA, 1.4);
    this.dirLightA.position.set(60, 90, -80);
    this.scene.add(this.dirLightA);

    this.dirLightB = new THREE.DirectionalLight(this.currentTheme.dirLightB, 1.2);
    this.dirLightB.position.set(-60, 70, -60);
    this.scene.add(this.dirLightB);
  }

  private applyTheme() {
    this.scene.background = new THREE.Color(this.currentTheme.fogColor);
    this.scene.fog = new THREE.FogExp2(this.currentTheme.fogColor, this.currentTheme.fogDensity);

    if (this.ambientLight) this.ambientLight.color.setHex(this.currentTheme.ambientLight);
    if (this.dirLightA) this.dirLightA.color.setHex(this.currentTheme.dirLightA);
    if (this.dirLightB) this.dirLightB.color.setHex(this.currentTheme.dirLightB);

    if (this.roadMesh) {
      (this.roadMesh.material as THREE.MeshStandardMaterial).color.setHex(this.currentTheme.roadColor);
    }

    this.guardrails.forEach((rail, idx) => {
      (rail.material as THREE.MeshBasicMaterial).color.setHex(
        idx % 2 === 0 ? this.currentTheme.guardrailColorA : this.currentTheme.guardrailColorB
      );
    });

    this.roadLines.forEach((line, idx) => {
      (line.material as THREE.MeshBasicMaterial).color.setHex(
        idx % 2 === 0 ? this.currentTheme.lineColorA : this.currentTheme.lineColorB
      );
    });

    this.updateWeatherTargets();
    this.buildSky();
    this.buildWeatherParticles();
  }

  private buildSky() {
    // Remove previous sky elements if any
    if (this.stars) { this.scene.remove(this.stars); this.stars = null; }
    if (this.skyMesh) { this.scene.remove(this.skyMesh); this.skyMesh = null; }
    if (this.sunMesh) { this.scene.remove(this.sunMesh); this.sunMesh = null; }
    if (this.cloudsGroup) { this.scene.remove(this.cloudsGroup); this.cloudsGroup = null; }

    const isDaytime = this.currentTheme.skyType === 'daytime';

    if (isDaytime) {
      // 1. Realistic Clear Daytime Gradient Sky Dome
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, '#1a73e8'); // Deep blue top
        grad.addColorStop(0.45, '#56a5fc'); // Sky blue
        grad.addColorStop(0.8, '#a0cfff'); // Light horizon blue
        grad.addColorStop(1, '#e3f2fd'); // Soft horizon haze
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);
      }
      const skyTex = new THREE.CanvasTexture(canvas);
      const skyGeo = new THREE.SphereGeometry(750, 32, 16);
      const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide });
      this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
      this.scene.add(this.skyMesh);

      // 2. Realistic Radiant Sun with Lens Flare Disc
      const sunGeo = new THREE.CircleGeometry(42, 32);
      const sunMat = new THREE.MeshBasicMaterial({
        color: 0xfffbe6,
        transparent: true,
        opacity: 0.95,
      });
      this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
      this.sunMesh.position.set(110, 160, -560);
      this.scene.add(this.sunMesh);

      // Outer Sun Glow Disc
      const glowGeo = new THREE.CircleGeometry(85, 32);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xffea88,
        transparent: true,
        opacity: 0.28,
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.position.set(110, 160, -562);
      this.scene.add(glowMesh);

      // 3. Volumetric Fluffy White Clouds Group
      this.cloudsGroup = new THREE.Group();
      const cloudMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.9,
        transparent: true,
        opacity: 0.88,
      });

      for (let c = 0; c < 16; c++) {
        const cloud = new THREE.Group();
        const numPuffs = 5 + Math.floor(Math.random() * 4);
        for (let p = 0; p < numPuffs; p++) {
          const r = 10 + Math.random() * 12;
          const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), cloudMat);
          puff.position.set(
            (p - numPuffs / 2) * 14 + (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 10
          );
          cloud.add(puff);
        }
        cloud.position.set(
          (Math.random() - 0.5) * 600,
          90 + Math.random() * 80,
          -200 - Math.random() * 500
        );
        this.cloudsGroup.add(cloud);
      }
      this.scene.add(this.cloudsGroup);

    } else {
      // Night / Sci-Fi / Retro Sun
      const starCount = 1200;
      const geom = new THREE.BufferGeometry();
      const pos = new Float32Array(starCount * 3);

      for (let i = 0; i < starCount * 3; i += 3) {
        pos[i] = (Math.random() - 0.5) * 1000;
        pos[i + 1] = 20 + Math.random() * 300;
        pos[i + 2] = -150 - Math.random() * 1100;
      }

      geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      this.stars = new THREE.Points(
        geom,
        new THREE.PointsMaterial({ color: 0x8ceeff, size: 0.75, transparent: true, opacity: 0.8 })
      );
      this.scene.add(this.stars);

      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, '#c2f9ff');
        grad.addColorStop(0.3, '#00eaff');
        grad.addColorStop(0.65, '#9d4edd');
        grad.addColorStop(1, '#ff0077');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 512);

        for (let y = 260; y < 512; y += 18) {
          ctx.fillStyle = 'rgba(2, 5, 15, 0.85)';
          ctx.fillRect(0, y, 1024, 7);
        }
      }

      const moonTex = new THREE.CanvasTexture(canvas);
      this.sunMesh = new THREE.Mesh(
        new THREE.CircleGeometry(110, 64),
        new THREE.MeshBasicMaterial({ map: moonTex, transparent: true, opacity: 0.95 })
      );
      this.sunMesh.position.set(0, 65, -550);
      this.scene.add(this.sunMesh);
    }
  }

  private updateWeatherTargets() {
    if (this.currentWeatherType === 'rain') {
      this.targetFogDensity = 0.0088;
      this.targetFogColor.setHex(0x334155);
      this.targetAmbientColor.setHex(0x64748b);
      this.targetAmbientIntensity = 0.75;
      if (this.roadMesh) {
        const mat = this.roadMesh.material as THREE.MeshStandardMaterial;
        mat.roughness = 0.10;
        mat.metalness = 0.92;
      }
    } else if (this.currentWeatherType === 'fog') {
      this.targetFogDensity = 0.0175; // Thick cinematic fog reducing visibility
      this.targetFogColor.setHex(0xcfd8dc);
      this.targetAmbientColor.setHex(0xb0bec5);
      this.targetAmbientIntensity = 1.0;
      if (this.roadMesh) {
        const mat = this.roadMesh.material as THREE.MeshStandardMaterial;
        mat.roughness = 0.35;
        mat.metalness = 0.80;
      }
    } else if (this.currentWeatherType === 'neon_snow') {
      this.targetFogDensity = 0.0092;
      this.targetFogColor.setHex(0x180b2b);
      this.targetAmbientColor.setHex(0xa855f7);
      this.targetAmbientIntensity = 1.15;
      if (this.roadMesh) {
        const mat = this.roadMesh.material as THREE.MeshStandardMaterial;
        mat.roughness = 0.20;
        mat.metalness = 0.88;
      }
    } else {
      // Clear sky
      this.targetFogDensity = this.currentTheme.fogDensity;
      this.targetFogColor.setHex(this.currentTheme.fogColor);
      this.targetAmbientColor.setHex(this.currentTheme.ambientLight);
      this.targetAmbientIntensity = 1.2;
      if (this.roadMesh) {
        const mat = this.roadMesh.material as THREE.MeshStandardMaterial;
        mat.roughness = 0.35;
        mat.metalness = 0.80;
      }
    }
  }

  public setWeather(type: DynamicWeatherType) {
    if (this.currentWeatherType === type) return;
    this.currentWeatherType = type;

    this.updateWeatherTargets();
    this.buildWeatherParticles();
    sound.playWeatherAlert(type);

    if (type === 'rain') {
      this.weatherAlert = {
        title: '🌧️ প্রবল বৃষ্টিপাত শুরু!',
        subtitle: 'রাস্তা পিচ্ছিল (-22% গ্রিপ) | ক্যাশ বোনাস +25%',
        icon: '🌧️',
        color: 'from-blue-600/90 to-cyan-700/90',
      };
    } else if (type === 'fog') {
      this.weatherAlert = {
        title: '🌫️ ঘন কুয়াশা নেমে এসেছে!',
        subtitle: 'দৃষ্টিসীমা মারাত্মক সংকুচিত (~110m) | ক্যাশ বোনাস +40%',
        icon: '🌫️',
        color: 'from-slate-600/90 to-gray-800/90',
      };
    } else if (type === 'neon_snow') {
      this.weatherAlert = {
        title: '❄️ নিয়ন তুষারপাত ও আইসি রোড!',
        subtitle: 'মারাত্মক ড্রাফট ও স্লিপারি ট্র্যাক (-38% গ্রিপ) | ক্যাশ বোনাস +50%',
        icon: '❄️',
        color: 'from-purple-600/90 to-pink-700/90',
      };
    } else {
      this.weatherAlert = {
        title: '☀️ আকাশ পরিষ্কার হয়েছে!',
        subtitle: 'স্বাভাবিক গ্রিপ ও পূর্ণ দৃশ্যমানতা ফিরে এসেছে',
        icon: '☀️',
        color: 'from-amber-500/90 to-yellow-600/90',
      };
    }
    this.weatherAlertTimer = 4.2;
  }

  public getWeatherState(): WeatherState {
    switch (this.currentWeatherType) {
      case 'rain':
        return {
          type: 'rain',
          name: 'প্রবল বৃষ্টিপাত',
          icon: '🌧️',
          effectLabel: 'হাইড্রোপ্ল্যানিং (-22% গ্রিপ) | +25% ক্যাশ',
          gripFactor: 0.78,
          bonusMultiplier: 1.25,
        };
      case 'fog':
        return {
          type: 'fog',
          name: 'ঘন কুয়াশা',
          icon: '🌫️',
          effectLabel: 'দৃষ্টিসীমা সংকুচিত (~110m) | +40% ক্যাশ',
          gripFactor: 0.95,
          bonusMultiplier: 1.40,
        };
      case 'neon_snow':
        return {
          type: 'neon_snow',
          name: 'নিয়ন তুষারপাত',
          icon: '❄️',
          effectLabel: 'আইসি রোড ড্রাফট (-38% গ্রিপ) | +50% ক্যাশ',
          gripFactor: 0.62,
          bonusMultiplier: 1.50,
        };
      default:
        return {
          type: 'clear',
          name: 'পরিষ্কার আকাশ',
          icon: '☀️',
          effectLabel: 'আদর্শ গ্রিপ ও দৃশ্যমানতা (100%)',
          gripFactor: 1.0,
          bonusMultiplier: 1.0,
        };
    }
  }

  private buildWeatherParticles() {
    if (this.weatherParticles) {
      this.scene.remove(this.weatherParticles);
      this.weatherParticles.geometry.dispose();
      if (Array.isArray(this.weatherParticles.material)) {
        this.weatherParticles.material.forEach((m) => m.dispose());
      } else {
        this.weatherParticles.material.dispose();
      }
      this.weatherParticles = null;
      this.weatherPositions = null;
    }

    const type = this.currentWeatherType;

    if (type === 'rain') {
      // 1,300 vertical rushing rain streaks
      const count = 1300;
      const geom = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i += 3) {
        pos[i] = (Math.random() - 0.5) * 52;
        pos[i + 1] = Math.random() * 26;
        pos[i + 2] = -Math.random() * 230;
      }
      geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      this.weatherPositions = pos;

      this.weatherParticles = new THREE.Points(
        geom,
        new THREE.PointsMaterial({
          color: 0x7dd3fc,
          size: 0.38,
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
        })
      );
      this.scene.add(this.weatherParticles);
    } else if (type === 'fog') {
      // 380 soft rolling volumetric mist puffs
      const count = 380;
      const geom = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i += 3) {
        pos[i] = (Math.random() - 0.5) * 55;
        pos[i + 1] = 0.8 + Math.random() * 9.5;
        pos[i + 2] = 10 - Math.random() * 220;
      }
      geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      this.weatherPositions = pos;

      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        g.addColorStop(0.5, 'rgba(240, 245, 255, 0.2)');
        g.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 64, 64);
      }
      const fogTexture = new THREE.CanvasTexture(canvas);

      this.weatherParticles = new THREE.Points(
        geom,
        new THREE.PointsMaterial({
          map: fogTexture,
          color: 0xe2e8f0,
          size: 16.0,
          transparent: true,
          opacity: 0.35,
          depthWrite: false,
        })
      );
      this.scene.add(this.weatherParticles);
    } else if (type === 'neon_snow') {
      // 950 multi-colored swirling neon snowflakes
      const count = 950;
      const geom = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        pos[idx] = (Math.random() - 0.5) * 50;
        pos[idx + 1] = Math.random() * 25;
        pos[idx + 2] = -Math.random() * 220;

        const rand = Math.random();
        if (rand < 0.42) {
          colors[idx] = 0.15; colors[idx + 1] = 0.88; colors[idx + 2] = 1.0; // Neon cyan
        } else if (rand < 0.84) {
          colors[idx] = 0.98; colors[idx + 1] = 0.22; colors[idx + 2] = 0.72; // Neon magenta
        } else {
          colors[idx] = 0.92; colors[idx + 1] = 0.97; colors[idx + 2] = 1.0; // Frost white
        }
      }
      geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      this.weatherPositions = pos;

      this.weatherParticles = new THREE.Points(
        geom,
        new THREE.PointsMaterial({
          vertexColors: true,
          size: 0.7,
          transparent: true,
          opacity: 0.9,
          depthWrite: false,
        })
      );
      this.scene.add(this.weatherParticles);
    } else {
      // Clear - check theme ambient particles
      const weather = this.currentTheme.weather;
      if (!weather || weather === 'none') return;

      const count = weather === 'rain' ? 800 : weather === 'embers' ? 500 : 700;
      const geom = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);

      for (let i = 0; i < count * 3; i += 3) {
        pos[i] = (Math.random() - 0.5) * 45;
        pos[i + 1] = Math.random() * 25;
        pos[i + 2] = -Math.random() * 220;
      }

      geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      this.weatherPositions = pos;

      const pColor = weather === 'rain' ? 0x38bdf8 : weather === 'embers' ? 0xf97316 : 0xa855f7;
      const pSize = weather === 'rain' ? 0.35 : weather === 'embers' ? 0.45 : 0.6;

      this.weatherParticles = new THREE.Points(
        geom,
        new THREE.PointsMaterial({
          color: pColor,
          size: pSize,
          transparent: true,
          opacity: 0.75,
        })
      );
      this.scene.add(this.weatherParticles);
    }
  }

  private buildRoad() {
    const length = 1500;
    this.roadMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(30, length),
      new THREE.MeshStandardMaterial({
        color: this.currentTheme.roadColor,
        roughness: 0.35,
        metalness: 0.8,
      })
    );
    this.roadMesh.rotation.x = -Math.PI / 2;
    this.roadMesh.position.set(0, 0, -length / 2 + 100);
    this.scene.add(this.roadMesh);

    // Guardrails
    [-1, 1].forEach((side, idx) => {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.65, length),
        new THREE.MeshBasicMaterial({
          color: idx === 0 ? this.currentTheme.guardrailColorA : this.currentTheme.guardrailColorB,
        })
      );
      rail.position.set(side * 14, 0.35, -length / 2 + 100);
      this.scene.add(rail);
      this.guardrails.push(rail);
    });

    // 5-lane dividers
    const dividers = [-6.4, -3.2, 0, 3.2, 6.4];
    for (let z = -length + 100; z < 100; z += 12) {
      dividers.slice(0, 4).forEach((x, i) => {
        const line = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 0.04, 5.2),
          new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? this.currentTheme.lineColorA : this.currentTheme.lineColorB,
          })
        );
        line.position.set(x + 1.6, 0.04, z);
        this.scene.add(line);
        this.roadLines.push(line);
      });
    }

    // Street Lamps
    for (let z = -1200; z < 100; z += 35) {
      [-1, 1].forEach((side, idx) => {
        const color = idx === 0 ? this.currentTheme.lineColorA : this.currentTheme.lineColorB;
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.08, 5.5, 8),
          new THREE.MeshBasicMaterial({ color })
        );
        pole.position.set(side * 15, 2.75, z);
        this.scene.add(pole);

        const lamp = new THREE.Mesh(
          new THREE.SphereGeometry(0.24, 8, 8),
          new THREE.MeshBasicMaterial({ color })
        );
        lamp.position.set(side * 15, 5.5, z);
        this.scene.add(lamp);
      });
    }
  }

  private buildCity() {
    this.buildings.forEach((b) => this.scene.remove(b));
    this.buildings = [];
    this.roadsideTrees.forEach((t) => this.scene.remove(t));
    this.roadsideTrees = [];

    const isDay = this.currentTheme.skyType === 'daytime';

    // Day/Night Materials
    const dayBuildingColors = [0xedf2f7, 0xe2e8f0, 0xcbd5e1, 0x94a3b8, 0x38bdf8, 0x64748b];
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
    const treeFoliageMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6 });

    for (let z = -1200; z < 100; z += 28) {
      [-1, 1].forEach((side) => {
        // 1. Realistic Roadside Greenery / Trees along the highway in daytime
        if (isDay && Math.random() > 0.15) {
          const treeGroup = new THREE.Group();
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 3.2, 8), treeTrunkMat);
          trunk.position.y = 1.6;
          treeGroup.add(trunk);

          // Foliage layers
          [2.8, 4.0, 5.0].forEach((fy, idx) => {
            const rad = (3 - idx) * 0.9 + 0.4;
            const crown = new THREE.Mesh(new THREE.ConeGeometry(rad, 2.0, 8), treeFoliageMat);
            crown.position.y = fy;
            treeGroup.add(crown);
          });

          treeGroup.position.set(side * (17.5 + Math.random() * 3.5), 0, z + (Math.random() - 0.5) * 8);
          this.scene.add(treeGroup);
          this.roadsideTrees.push(treeGroup);
        }

        // 2. High-rise Architecture
        const h = 35 + Math.random() * 140;
        const w = 12 + Math.random() * 20;
        const d = 14 + Math.random() * 22;
        const group = new THREE.Group();

        if (isDay) {
          const colorPick = dayBuildingColors[Math.floor(Math.random() * dayBuildingColors.length)];
          const b = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d),
            new THREE.MeshStandardMaterial({
              color: colorPick,
              metalness: 0.45,
              roughness: 0.25,
            })
          );
          b.position.y = h / 2;
          group.add(b);

          // Realistic blue reflective office windows
          for (let y = 6; y < h; y += 9) {
            const windowStrip = new THREE.Mesh(
              new THREE.BoxGeometry(w * 0.88, 3.5, 0.12),
              new THREE.MeshStandardMaterial({
                color: 0x38bdf8,
                metalness: 0.9,
                roughness: 0.1,
              })
            );
            windowStrip.position.set(0, y, -d / 2 - 0.08);
            group.add(windowStrip);
          }
        } else {
          // Night Cyberpunk
          const b = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d),
            new THREE.MeshStandardMaterial({
              color: 0x040816,
              emissive: side < 0 ? 0x120018 : 0x001420,
              emissiveIntensity: 0.35,
              roughness: 0.4,
            })
          );
          b.position.y = h / 2;
          group.add(b);

          for (let y = 6; y < h; y += 8) {
            const strip = new THREE.Mesh(
              new THREE.BoxGeometry(w * 0.75, 0.22, 0.1),
              new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? 0x00eaff : 0xff0077,
                transparent: true,
                opacity: 0.65,
              })
            );
            strip.position.set(0, y, -d / 2 - 0.06);
            group.add(strip);
          }
        }

        group.position.set(side * (28 + Math.random() * 32), 0, z + Math.random() * 10);
        this.scene.add(group);
        this.buildings.push(group);
      });
    }
  }

  private buildPlayerCar() {
    if (this.playerGroup) {
      this.scene.remove(this.playerGroup);
    }

    const group = new THREE.Group();

    // --- REALISTIC SPORTS CAR MODEL ---
    // 1. Sleek Aerodynamic Lower Chassis / Splitter
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0x111625, metalness: 0.85, roughness: 0.3 });
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.22, 4.3), chassisMat);
    chassis.position.y = 0.22;
    group.add(chassis);

    // Front Bumper / Air Dam
    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.32, 0.4), chassisMat);
    frontBumper.position.set(0, 0.28, -2.15);
    group.add(frontBumper);

    // 2. Main Sculpted Car Body
    const bodyMat = new THREE.MeshStandardMaterial({
      color: this.activeCar.bodyColor,
      metalness: 0.9,
      roughness: 0.15,
    });
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.52, 3.9), bodyMat);
    mainBody.position.y = 0.52;
    group.add(mainBody);

    // Hood Slope / Front Bonnet
    const hoodMat = new THREE.MeshStandardMaterial({
      color: this.activeCar.accentColor || this.activeCar.bodyColor,
      metalness: 0.92,
      roughness: 0.12,
    });
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.18, 1.4), hoodMat);
    hood.position.set(0, 0.68, -1.25);
    hood.rotation.x = 0.08;
    group.add(hood);

    // 3. Cabin & Glass Canopy (Front Windshield, Side Windows, Rear Glass)
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0a1424,
      metalness: 0.95,
      roughness: 0.05,
    });
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.45, 1.95), glassMat);
    cabin.position.set(0, 0.96, -0.05);
    group.add(cabin);

    // Roof Top Shell (Body Color)
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.06, 1.35), bodyMat);
    roof.position.set(0, 1.20, -0.05);
    group.add(roof);

    // Front Windshield Frame
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.42, 0.1), glassMat);
    windshield.position.set(0, 0.95, -1.05);
    windshield.rotation.x = -0.55;
    group.add(windshield);

    // 4. Side Mirrors (Left & Right)
    [-0.85, 0.85].forEach((mx) => {
      const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.16), bodyMat);
      mirror.position.set(mx, 0.85, -0.7);
      group.add(mirror);
    });

    // 5. Rear Racing Spoiler / Wing
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x050814, metalness: 0.8, roughness: 0.2 });
    const wingBlade = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.08, 0.4), wingMat);
    wingBlade.position.set(0, 1.15, 1.85);
    group.add(wingBlade);
    [-0.55, 0.55].forEach((sx) => {
      const strut = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.12), wingMat);
      strut.position.set(sx, 0.95, 1.85);
      group.add(strut);
    });

    // 6. Realistic LED Headlights (Crisp White/Ice Blue)
    [-0.65, 0.65].forEach((hx) => {
      const headlight = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.14, 0.12),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      headlight.position.set(hx, 0.58, -1.98);
      group.add(headlight);
    });

    // 7. Realistic Horizontal Rear Light Bar (Ruby Red)
    const taillightBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.65, 0.12, 0.08),
      new THREE.MeshBasicMaterial({ color: 0xff002b })
    );
    taillightBar.position.set(0, 0.65, 1.98);
    group.add(taillightBar);

    // 8. 4 Realistic Wheels (Alloy Rim Spokes + Tread Tire)
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181c, roughness: 0.75 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xd9e2ec, metalness: 0.95, roughness: 0.15 });

    const wheelPositions = [
      [-0.94, 0.38, -1.25],
      [0.94, 0.38, -1.25],
      [-0.94, 0.38, 1.25],
      [0.94, 0.38, 1.25],
    ];

    wheelPositions.forEach(([x, y, z]) => {
      const wheelGroup = new THREE.Group();
      // Tire
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.28, 18), tireMat);
      tire.rotation.z = Math.PI / 2;
      wheelGroup.add(tire);
      // Silver Alloy Rim Center
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.30, 16), rimMat);
      rim.rotation.z = Math.PI / 2;
      wheelGroup.add(rim);

      wheelGroup.position.set(x, y, z);
      group.add(wheelGroup);
    });

    // Underglow Neon Light
    this.underglowLight = new THREE.PointLight(this.activeCar.underglow, 2.5, 6);
    this.underglowLight.position.set(0, 0.15, 0);
    group.add(this.underglowLight);

    // Dual Exhaust Nitro Jets
    const exhGeom = new THREE.CylinderGeometry(0.08, 0.2, 1.2, 8);
    const exhMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });

    this.leftExhaust = new THREE.Mesh(exhGeom, exhMat);
    this.leftExhaust.rotation.x = Math.PI / 2;
    this.leftExhaust.position.set(-0.4, 0.45, 2.4);
    this.leftExhaust.visible = false;
    group.add(this.leftExhaust);

    this.rightExhaust = new THREE.Mesh(exhGeom, exhMat);
    this.rightExhaust.rotation.x = Math.PI / 2;
    this.rightExhaust.position.set(0.4, 0.45, 2.4);
    this.rightExhaust.visible = false;
    group.add(this.rightExhaust);

    // Protective Shield Sphere
    const shieldGeom = new THREE.SphereGeometry(2.3, 24, 24);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x00eaff,
      transparent: true,
      opacity: 0.25,
      wireframe: true,
    });
    this.shieldMesh = new THREE.Mesh(shieldGeom, shieldMat);
    this.shieldMesh.position.y = 0.6;
    this.shieldMesh.visible = this.shields > 0;
    group.add(this.shieldMesh);

    group.position.set(0, 0, 3);
    this.scene.add(group);
    this.playerGroup = group;
  }

  // --- TRAFFIC SPAWNER ---
  private spawnTraffic() {
    const lane = Math.floor(Math.random() * 5) - 2;
    const isPolice = !this.policeActive && Math.random() < 0.18;
    const group = new THREE.Group();

    // Random realistic vehicle paint colors
    const carPaints = [0xd32f2f, 0x1976d2, 0x2e7d32, 0xf57c00, 0x212121, 0xffffff, 0x7b1fa2];
    const color = isPolice ? 0x0f172a : carPaints[Math.floor(Math.random() * carPaints.length)];
    const isSUV = !isPolice && Math.random() > 0.6;

    const w = isSUV ? 1.85 : 1.72;
    const h = isSUV ? 0.78 : 0.60;
    const l = isSUV ? 4.1 : 3.8;

    // Chassis & Main Body
    const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.85, roughness: 0.2 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), bodyMat);
    body.position.y = h / 2 + 0.22;
    group.add(body);

    // Windshield & Glass Cabin
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0a1424, metalness: 0.9, roughness: 0.1 });
    const cabHeight = isSUV ? 0.55 : 0.44;
    const cab = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, cabHeight, l * 0.55), glassMat);
    cab.position.set(0, body.position.y + h / 2 + cabHeight / 2 - 0.05, 0.1);
    group.add(cab);

    // Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w * 0.82, 0.06, l * 0.48), bodyMat);
    roof.position.set(0, cab.position.y + cabHeight / 2 + 0.02, 0.1);
    group.add(roof);

    // Headlights
    [-w * 0.35, w * 0.35].forEach((hx) => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.08), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      hl.position.set(hx, body.position.y, -l / 2 - 0.04);
      group.add(hl);
    });

    // Taillights
    [-w * 0.35, w * 0.35].forEach((tx) => {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.10, 0.08), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      tl.position.set(tx, body.position.y + 0.05, l / 2 + 0.04);
      group.add(tl);
    });

    // 4 Wheels
    const whGeom = new THREE.CylinderGeometry(0.36, 0.36, 0.24, 14);
    const whMat = new THREE.MeshStandardMaterial({ color: 0x18181c, roughness: 0.7 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });

    [[-w / 2 - 0.08, -1.2], [w / 2 + 0.08, -1.2], [-w / 2 - 0.08, 1.2], [w / 2 + 0.08, 1.2]].forEach(([wx, wz]) => {
      const wg = new THREE.Group();
      const tire = new THREE.Mesh(whGeom, whMat);
      tire.rotation.z = Math.PI / 2;
      wg.add(tire);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.26, 12), rimMat);
      rim.rotation.z = Math.PI / 2;
      wg.add(rim);

      wg.position.set(wx, 0.36, wz);
      group.add(wg);
    });

    let lights: { r: THREE.PointLight; b: THREE.PointLight } | undefined;
    if (isPolice) {
      // Police Roof Lightbar
      const barBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.25), new THREE.MeshStandardMaterial({ color: 0x050508 }));
      barBase.position.set(0, roof.position.y + 0.08, 0.1);
      group.add(barBase);

      const redLight = new THREE.PointLight(0xff0000, 2.5, 10);
      redLight.position.set(-0.35, roof.position.y + 0.15, 0.1);
      group.add(redLight);

      const blueLight = new THREE.PointLight(0x0055ff, 2.5, 10);
      blueLight.position.set(0.35, roof.position.y + 0.15, 0.1);
      group.add(blueLight);

      lights = { r: redLight, b: blueLight };
    }

    group.position.set(lane * this.laneWidth, 0, -260);
    this.scene.add(group);

    this.traffic.push({
      group,
      lane,
      speed: 70 + Math.random() * 45,
      isPolice,
      policeLights: lights,
      passed: false,
      cycle: 0,
      width: w,
      length: l,
    });
  }

  // --- CASH PICKUP SPAWNER ---
  private spawnCashPickup() {
    const lane = Math.floor(Math.random() * 5) - 2;
    const group = new THREE.Group();

    const roll = Math.random();
    let type: CashPickup['type'] = 'cash_bundle';
    let value = 500;

    if (roll < 0.45) {
      // ৳ 500 Bundle
      type = 'cash_bundle';
      value = 500;
      const bundle = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.28, 1.3),
        new THREE.MeshStandardMaterial({ color: 0x00e676, roughness: 0.3, emissive: 0x004d20 })
      );
      group.add(bundle);
    } else if (roll < 0.75) {
      // ৳ 200 Gold Coin
      type = 'gold_coin';
      value = 200;
      const coin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.48, 0.16, 20),
        new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.1 })
      );
      coin.rotation.x = Math.PI / 2;
      group.add(coin);
    } else if (roll < 0.90) {
      // Nitro Refill
      type = 'nitro';
      value = 100;
      const canister = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 1.1, 16),
        new THREE.MeshBasicMaterial({ color: 0x00ffff })
      );
      group.add(canister);
    } else {
      // Shield Battery
      type = 'shield';
      value = 150;
      const shield = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.55),
        new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true })
      );
      group.add(shield);
    }

    group.position.set(lane * this.laneWidth, 0.9, -240);
    this.scene.add(group);

    this.pickups.push({
      group,
      type,
      lane,
      z: -240,
      value,
      active: true,
    });
  }

  // --- CONTROLS ---
  public moveLeft() {
    if (!this.isRunning || this.isPaused) return;
    if (this.lane > -2) {
      this.lane--;
      this.targetX = this.lane * this.laneWidth;
      sound.playTurn(true);
      sound.vibrate(20);
    }
  }

  public moveRight() {
    if (!this.isRunning || this.isPaused) return;
    if (this.lane < 2) {
      this.lane++;
      this.targetX = this.lane * this.laneWidth;
      sound.playTurn(false);
      sound.vibrate(20);
    }
  }

  public setBoost(boosting: boolean) {
    if (!this.isRunning || this.isPaused) return;
    if (boosting && this.nitro > 10) {
      this.isBoosting = true;
    } else {
      this.isBoosting = false;
    }
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (!e || typeof e.key !== 'string') return;
    const k = e.key.toLowerCase();
    if (e.key === 'ArrowLeft' || k === 'a') {
      this.moveLeft();
    } else if (e.key === 'ArrowRight' || k === 'd') {
      this.moveRight();
    } else if (e.key === 'ArrowUp' || k === 'w' || e.key === 'Shift') {
      this.setBoost(true);
    } else if (e.key === 'Escape' || e.key === ' ') {
      e.preventDefault();
      this.togglePause();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (!e || typeof e.key !== 'string') return;
    const k = e.key.toLowerCase();
    if (e.key === 'ArrowUp' || k === 'w' || e.key === 'Shift') {
      this.setBoost(false);
    }
  };

  public togglePause() {
    if (!this.isRunning) return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.isBoosting = false;
      sound.stopEngine();
    } else {
      sound.startEngine();
    }
  }

  // --- MISSION PROGRESS ---
  private checkMissionProgress(type: CashMission['type'], amount: number) {
    const mission = this.missions[this.activeMissionIndex];
    if (mission && mission.type === type) {
      mission.progress += amount;
      if (mission.progress >= mission.target) {
        this.cashCollectedThisRun += mission.rewardTaka;
        this.onMissionComplete(mission);

        this.activeMissionIndex = (this.activeMissionIndex + 1) % this.missions.length;
        this.missions[this.activeMissionIndex].progress = 0;
      }
    }
  }

  // --- START & RESET ---
  public start() {
    this.isRunning = true;
    this.isPaused = false;
    this.isBoosting = false;

    this.score = 0;
    this.distance = 0;
    this.speed = 140;
    this.maxSpeedAchieved = 140;
    this.nitro = 100;
    this.shields = this.activeCar.maxShields + (this.upgrades.shieldLevel - 1);
    this.maxShields = this.shields;
    this.combo = 1;
    this.comboTimer = 0;
    this.nearMisses = 0;
    this.cashCollectedThisRun = 0;

    this.lane = 0;
    this.targetX = 0;
    this.spawnTimer = 0;
    this.pickupTimer = 0;
    this.policeTimer = 0;
    this.policeActive = false;
    this.invulnerableTimer = 0;

    this.traffic.forEach((t) => this.scene.remove(t.group));
    this.traffic = [];
    this.pickups.forEach((p) => this.scene.remove(p.group));
    this.pickups = [];
    this.debrisList.forEach((d) => this.scene.remove(d.mesh));
    this.debrisList = [];

    if (this.playerGroup) {
      this.playerGroup.position.set(0, 0, 3);
      this.playerGroup.rotation.set(0, 0, 0);
      this.playerGroup.visible = true;
    }
    if (this.shieldMesh) this.shieldMesh.visible = this.shields > 0;

    // Reset Dynamic Weather
    this.currentWeatherType = 'clear';
    this.weatherTimer = 0;
    this.weatherDuration = 0;
    this.nextWeatherInterval = 18 + Math.random() * 12;
    this.weatherAlert = null;
    this.weatherAlertTimer = 0;
    this.setWeather('clear');

    sound.startEngine();
    sound.startMusic();
  }

  public stop() {
    this.isRunning = false;
    this.isPaused = false;
    this.isBoosting = false;
    sound.stopEngine();
    sound.stopMusic();
  }

  private triggerCrash() {
    if (!this.isRunning) return;

    if (this.shields > 0) {
      this.shields--;
      if (this.shieldMesh) this.shieldMesh.visible = this.shields > 0;
      this.cameraShake = 0.85;
      this.invulnerableTimer = 1.0;
      sound.playCrash();
      sound.vibrate(100);
      return;
    }

    // Vehicle Destroyed
    this.isRunning = false;
    this.isBoosting = false;
    this.cameraShake = 1.4;
    sound.playCrash();
    sound.vibrate(260);

    if (this.playerGroup) {
      this.playerGroup.visible = false;
    }

    setTimeout(() => {
      this.onCrash();
    }, 650);
  }

  // --- UPDATE LOOP ---
  private update(dt: number) {
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
      if (this.playerGroup) {
        this.playerGroup.visible = Math.floor(performance.now() / 80) % 2 === 0;
      }
    } else if (this.playerGroup) {
      this.playerGroup.visible = true;
    }

    if (this.weatherAlertTimer > 0) {
      this.weatherAlertTimer -= dt;
      if (this.weatherAlertTimer <= 0) {
        this.weatherAlert = null;
      }
    }

    // Dynamic Weather Cycle & Random Triggers
    this.weatherTimer += dt;
    if (this.currentWeatherType !== 'clear') {
      this.weatherDuration -= dt;
      if (this.weatherDuration <= 0) {
        this.setWeather('clear');
        this.weatherTimer = 0;
        this.nextWeatherInterval = 22 + Math.random() * 20; // 22-42s until next weather event
      }
    } else if (this.weatherTimer >= this.nextWeatherInterval) {
      const choices: DynamicWeatherType[] = ['rain', 'fog', 'neon_snow'];
      const chosen = choices[Math.floor(Math.random() * choices.length)];
      this.setWeather(chosen);
      this.weatherDuration = 18 + Math.random() * 16; // lasts 18-34s
      this.weatherTimer = 0;
    }

    // Smooth transition for fog and lighting
    if (this.scene.fog && this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.density += (this.targetFogDensity - this.scene.fog.density) * Math.min(1, dt * 1.5);
      this.scene.fog.color.lerp(this.targetFogColor, Math.min(1, dt * 1.5));
      this.scene.background = this.scene.fog.color;
    }

    if (this.ambientLight) {
      this.ambientLight.color.lerp(this.targetAmbientColor, Math.min(1, dt * 1.5));
      this.ambientLight.intensity += (this.targetAmbientIntensity - this.ambientLight.intensity) * Math.min(1, dt * 1.5);
    }

    const weather = this.getWeatherState();

    // Global Upgrades calculation
    const engineUpgradeBonus = (this.upgrades.engineLevel - 1) * 16;
    const nitroUpgradeBonus = (this.upgrades.nitroLevel - 1) * 18;
    const baseTop = this.activeCar.topSpeed + engineUpgradeBonus;
    const boostPower = this.activeCar.nitroBoost + nitroUpgradeBonus;

    const difficulty = Math.min(2.5, 1 + this.distance / 2800);
    const grip = weather.gripFactor;
    let targetSpeed = baseTop * (0.68 + 0.32 * difficulty) * (0.90 + 0.10 * grip);

    if (this.isBoosting && this.nitro > 0) {
      targetSpeed += boostPower;
      const drainRate = Math.max(16, 36 - (this.upgrades.nitroLevel - 1) * 4);
      this.nitro = Math.max(0, this.nitro - dt * drainRate);
      if (this.nitro <= 0) this.isBoosting = false;
    } else {
      const chargeRate = 3.0 + (this.upgrades.nitroLevel - 1) * 0.8;
      this.nitro = Math.min(100, this.nitro + dt * chargeRate);
    }

    this.speed += (targetSpeed - this.speed) * Math.min(1, dt * (this.isBoosting ? 4.8 : 2.2));
    this.maxSpeedAchieved = Math.max(this.maxSpeedAchieved, this.speed);
    sound.updateEngine(this.speed / 380, this.isBoosting);

    if (this.leftExhaust && this.rightExhaust) {
      this.leftExhaust.visible = this.isBoosting;
      this.rightExhaust.visible = this.isBoosting;
    }

    const forward = this.speed * 0.26 * dt;
    this.distance += forward;
    this.checkMissionProgress('distance', forward);

    // Weather bonus applies to score!
    this.score += this.speed * 0.18 * (this.isBoosting ? 2.4 : 1.0) * dt * this.combo * weather.bonusMultiplier;

    // Combo Timer
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 1;
    }

    // Police pursuit check
    this.policeTimer += dt;
    if (!this.policeActive && this.policeTimer > 28) {
      this.policeActive = true;
      this.policeTimer = 0;
      sound.playSiren();
    } else if (this.policeActive && this.policeTimer > 22) {
      this.policeActive = false;
      this.policeTimer = 0;
    }

    // Steering with dynamic weather handling
    let handlingSpeed = 13.5;
    let bodyRoll = 0.07;

    if (this.currentWeatherType === 'rain') {
      handlingSpeed = 9.8; // hydroplaning slight latency
      bodyRoll = 0.11;
    } else if (this.currentWeatherType === 'neon_snow') {
      handlingSpeed = 7.4; // icy slippery counter-steer
      bodyRoll = 0.16;
    } else if (this.currentWeatherType === 'fog') {
      handlingSpeed = 13.0;
      bodyRoll = 0.07;
    }

    if (this.playerGroup) {
      const dx = this.targetX - this.playerGroup.position.x;
      this.playerGroup.position.x += dx * Math.min(1, dt * handlingSpeed);

      let microDrift = 0;
      if (this.currentWeatherType === 'neon_snow' && this.speed > 130) {
        microDrift = Math.sin(performance.now() * 0.0035) * 0.12;
      }
      this.playerGroup.rotation.z = -dx * bodyRoll + microDrift;
    }

    // Road scroll
    const roadMovement = (this.speed * 0.065 + 12) * dt;
    this.roadLines.forEach((line) => {
      line.position.z += roadMovement;
      if (line.position.z > 25) line.position.z -= 1400;
    });

    this.buildings.forEach((b) => {
      b.position.z += roadMovement * 0.85;
      if (b.position.z > 60) b.position.z -= 1300;
    });

    this.roadsideTrees.forEach((t) => {
      t.position.z += roadMovement;
      if (t.position.z > 40) t.position.z -= 1300;
    });

    // Cloud drift in daytime
    if (this.cloudsGroup) {
      this.cloudsGroup.children.forEach((c) => {
        c.position.x += dt * 4;
        if (c.position.x > 320) c.position.x = -320;
      });
    }

    // Weather particle animation (Rain, Fog, Neon Snow)
    if (this.weatherParticles && this.weatherPositions) {
      const currentActiveWeather = this.currentWeatherType !== 'clear' ? this.currentWeatherType : this.currentTheme.weather;
      const count = this.weatherPositions.length / 3;

      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        if (currentActiveWeather === 'rain') {
          this.weatherPositions[idx + 1] -= dt * 200;
          this.weatherPositions[idx + 2] += roadMovement * 0.95;
          if (this.weatherPositions[idx + 1] < 0) {
            this.weatherPositions[idx + 1] = 23 + Math.random() * 4;
            this.weatherPositions[idx + 2] = -Math.random() * 230;
          }
        } else if (currentActiveWeather === 'fog') {
          this.weatherPositions[idx] += Math.sin(performance.now() * 0.0012 + i) * dt * 3.2;
          this.weatherPositions[idx + 2] += roadMovement * 0.45;
          if (this.weatherPositions[idx + 2] > 25) {
            this.weatherPositions[idx + 2] = -220 - Math.random() * 30;
            this.weatherPositions[idx] = (Math.random() - 0.5) * 55;
          }
        } else if (currentActiveWeather === 'neon_snow') {
          this.weatherPositions[idx + 1] -= dt * 14;
          this.weatherPositions[idx] += Math.sin(performance.now() * 0.0025 + i * 0.8) * dt * 6.5;
          this.weatherPositions[idx + 2] += roadMovement * 0.55;
          if (this.weatherPositions[idx + 1] < 0) {
            this.weatherPositions[idx + 1] = 24 + Math.random() * 3;
            this.weatherPositions[idx + 2] = -Math.random() * 220;
            this.weatherPositions[idx] = (Math.random() - 0.5) * 50;
          }
        } else if (currentActiveWeather === 'embers') {
          this.weatherPositions[idx + 1] += dt * 12;
          this.weatherPositions[idx] += Math.sin(performance.now() * 0.002 + i) * dt * 3;
          if (this.weatherPositions[idx + 1] > 25) {
            this.weatherPositions[idx + 1] = 0;
            this.weatherPositions[idx + 2] = -Math.random() * 220;
          }
        } else if (currentActiveWeather === 'warp_stars') {
          this.weatherPositions[idx + 2] += (this.speed * 0.28 + 20) * dt;
          if (this.weatherPositions[idx + 2] > 20) {
            this.weatherPositions[idx + 2] = -240;
            this.weatherPositions[idx] = (Math.random() - 0.5) * 50;
            this.weatherPositions[idx + 1] = Math.random() * 25;
          }
        }
      }
      this.weatherParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Spawners
    this.spawnTimer += dt;
    const spawnInterval = Math.max(0.65, 1.15 - this.distance / 9000);
    if (this.spawnTimer > spawnInterval) {
      this.spawnTraffic();
      this.spawnTimer = 0;
    }

    this.pickupTimer += dt;
    if (this.pickupTimer > 2.6) {
      this.spawnCashPickup();
      this.pickupTimer = 0;
    }

    // Camera follow & shake
    if (this.cameraShake > 0) {
      this.cameraShake -= dt * 2.8;
      const shakeAmt = Math.max(0, this.cameraShake) * 0.45;
      this.camera.position.x = (Math.random() - 0.5) * shakeAmt;
      this.camera.position.y = 4.8 + (Math.random() - 0.5) * shakeAmt;
    } else {
      this.camera.position.x = (this.playerGroup?.position.x || 0) * 0.25;
      this.camera.position.y = 4.8;
    }

    const px = this.playerGroup?.position.x || 0;
    const pz = this.playerGroup?.position.z || 3;

    // Traffic Update
    for (let i = this.traffic.length - 1; i >= 0; i--) {
      const t = this.traffic[i];
      const relSpeed = (this.speed - t.speed) * 0.055 + 9;
      t.group.position.z += relSpeed * dt;

      if (t.isPolice && t.policeLights) {
        t.cycle += dt * 14;
        const phase = Math.sin(t.cycle);
        t.policeLights.r.intensity = phase > 0 ? 3.5 : 0.2;
        t.policeLights.b.intensity = phase <= 0 ? 3.5 : 0.2;
      }

      const cx = Math.abs(px - t.group.position.x);
      const cz = Math.abs(pz - t.group.position.z);

      // Risky Overtake / Near-Miss Bonus (টাকা ইনকাম!)
      if (!t.passed && t.group.position.z > pz - 2.2) {
        t.passed = true;
        if (cx > 1.6 && cx < 3.0) {
          this.combo = Math.min(8, this.combo + 1);
          this.comboTimer = 3.8;
          this.nearMisses++;
          this.nitro = Math.min(100, this.nitro + 16);

          const multiplierBonus = 1 + (this.upgrades.multiplierLevel - 1) * 0.25;
          const bonusTaka = Math.floor(150 * this.combo * multiplierBonus * weather.bonusMultiplier);
          this.cashCollectedThisRun += bonusTaka;
          this.score += 350 * this.combo * weather.bonusMultiplier;

          sound.playNearMiss();
          this.checkMissionProgress('near_miss', 1);
          this.onNearMissOvertake(this.combo, bonusTaka);
        }
      }

      // Collision
      if (this.invulnerableTimer <= 0 && cx < 1.95 && cz < 3.9) {
        this.triggerCrash();
        break;
      }

      if (t.group.position.z > 30) {
        this.scene.remove(t.group);
        this.traffic.splice(i, 1);
      }
    }

    // Cash Magnet range calculation
    const magnetRadius = 3.5 + this.upgrades.magnetLevel * 3.5; // up to 21 meters!

    // Update Cash & Powerups
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      p.group.position.z += roadMovement;
      p.group.rotation.y += dt * 3.5;

      // Cash Magnet attraction
      if (this.playerGroup && p.active && (p.type === 'cash_bundle' || p.type === 'gold_coin')) {
        const pPos = p.group.position;
        const playerPos = this.playerGroup.position;
        const dist = playerPos.distanceTo(pPos);

        if (dist < magnetRadius) {
          const dir = new THREE.Vector3().subVectors(playerPos, pPos).normalize();
          const pullSpeed = Math.max(16, (magnetRadius - dist) * 7 + 12);
          p.group.position.addScaledVector(dir, pullSpeed * dt);

          if (!p.magnetSoundPlayed) {
            p.magnetSoundPlayed = true;
            sound.playMagnet();
          }
        }
      }

      // Pickup Hit Check
      if (this.playerGroup && p.active && this.playerGroup.position.distanceTo(p.group.position) < 2.5) {
        p.active = false;

        const multiplierBonus = 1 + (this.upgrades.multiplierLevel - 1) * 0.25;
        const finalValue = Math.floor(p.value * multiplierBonus * weather.bonusMultiplier);

        if (p.type === 'cash_bundle' || p.type === 'gold_coin') {
          sound.playCashCollect();
          this.cashCollectedThisRun += finalValue;
          this.score += finalValue * 2;
          this.checkMissionProgress('cash_collect', 1);
          this.onCashCollected(finalValue, p.type === 'cash_bundle' ? 'টাকার বান্ডিল' : 'সোনার কয়েন');
        } else if (p.type === 'nitro') {
          sound.tone(600, 0.1, 'sine', 0.15);
          this.nitro = 100;
          this.score += 200;
        } else if (p.type === 'shield') {
          sound.tone(500, 0.15, 'sine', 0.2);
          this.shields = Math.min(this.maxShields, this.shields + 1);
          if (this.shieldMesh) this.shieldMesh.visible = true;
          this.score += 300;
        }

        this.scene.remove(p.group);
        this.pickups.splice(i, 1);
        continue;
      }

      if (p.group.position.z > 25) {
        this.scene.remove(p.group);
        this.pickups.splice(i, 1);
      }
    }

    // Broadcast stats with Dynamic Weather State
    this.onStatsUpdate({
      score: Math.floor(this.score),
      distance: Math.floor(this.distance),
      speed: Math.floor(this.speed),
      maxSpeed: Math.floor(this.maxSpeedAchieved),
      nitro: Math.floor(this.nitro),
      shields: this.shields,
      maxShields: this.maxShields,
      combo: this.combo,
      comboTimer: this.comboTimer,
      policeActive: this.policeActive,
      nearMisses: this.nearMisses,
      cashCollectedThisRun: this.cashCollectedThisRun,
      activeMission: this.missions[this.activeMissionIndex],
      magnetActive: this.upgrades.magnetLevel > 1,
      weather: this.getWeatherState(),
      weatherAlert: this.weatherAlert,
    });
  }

  private animate = () => {
    this.reqId = requestAnimationFrame(this.animate);
    const dt = Math.min(this.clock.getDelta(), 0.05);

    if (this.isRunning && !this.isPaused) {
      this.update(dt);
    }
    this.renderer.render(this.scene, this.camera);
  };

  private onResize = () => {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  public destroy() {
    if (this.reqId !== null) cancelAnimationFrame(this.reqId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    sound.stopEngine();
    sound.stopMusic();
    this.renderer.dispose();
  }
}
