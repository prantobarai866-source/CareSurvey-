import * as THREE from 'three';

/**
 * 3D Low-Poly Architectural Landmarks of Dhaka City:
 * 1. Jatiya Sangsad Bhaban (National Parliament House by Louis Kahn)
 * 2. Mir Jumla's Dhaka Gate (Historic 1660 Mughal Gateway)
 * 3. Central Shaheed Minar (National Language Monument & Crimson Sun)
 */

export class DhakaLandmarks {
  /**
   * National Parliament House (জাতীয় সংসদ ভবন)
   * Iconic monolithic concrete geometry, Crescent Lake moat reflection & green plaza.
   */
  public static createParliamentHouse(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Landmark_ParliamentHouse';

    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0xd6d3d1,
      roughness: 0.75,
      metalness: 0.15,
    });
    const concreteDarkMat = new THREE.MeshStandardMaterial({
      color: 0xa8a29e,
      roughness: 0.8,
    });
    const lakeWaterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.85,
    });
    const lawnMat = new THREE.MeshStandardMaterial({
      color: 0x166534,
      roughness: 0.9,
    });
    const cutoutWindowMat = new THREE.MeshBasicMaterial({
      color: 0x0c4a6e,
    });

    // 1. Crescent Lake Moat & Plaza Base
    const lake = new THREE.Mesh(new THREE.BoxGeometry(110, 0.6, 95), lakeWaterMat);
    lake.position.set(0, 0.3, 0);
    group.add(lake);

    const lawn = new THREE.Mesh(new THREE.BoxGeometry(125, 0.4, 110), lawnMat);
    lawn.position.set(0, 0.1, 0);
    group.add(lawn);

    // Stepped Podium Island
    const podium = new THREE.Mesh(new THREE.BoxGeometry(75, 2.5, 65), concreteDarkMat);
    podium.position.set(0, 1.4, 0);
    group.add(podium);

    // 2. Central Assembly Hall Cylinder
    const coreHeight = 28;
    const core = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, coreHeight, 16), concreteMat);
    core.position.set(0, 1.4 + coreHeight / 2, 0);
    group.add(core);

    // Central stepped roof dome / clerestory
    const domeTier1 = new THREE.Mesh(new THREE.CylinderGeometry(12, 14, 3.5, 16), concreteDarkMat);
    domeTier1.position.set(0, 1.4 + coreHeight + 1.7, 0);
    group.add(domeTier1);

    const domeTier2 = new THREE.Mesh(new THREE.CylinderGeometry(8, 11, 2.5, 16), concreteMat);
    domeTier2.position.set(0, 1.4 + coreHeight + 4.2, 0);
    group.add(domeTier2);

    // 3. Eight Surrounding Perimeter Pavilion Blocks with Monumental Geometric Cutouts
    const numBlocks = 8;
    const radius = 22;
    for (let i = 0; i < numBlocks; i++) {
      const angle = (i / numBlocks) * Math.PI * 2;
      const bx = Math.cos(angle) * radius;
      const bz = Math.sin(angle) * radius;

      const pBlock = new THREE.Mesh(new THREE.BoxGeometry(12, 24, 10), concreteMat);
      pBlock.position.set(bx, 1.4 + 12, bz);
      pBlock.rotation.y = -angle + Math.PI / 2;
      group.add(pBlock);

      // Kahn Geometric Cutouts: Giant Circular Openings
      const circleCutout = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.25, 16), cutoutWindowMat);
      circleCutout.rotation.x = Math.PI / 2;
      circleCutout.position.set(0, 4, 5.1);
      pBlock.add(circleCutout);

      // Kahn Triangular Fenestration
      const triCutout = new THREE.Mesh(new THREE.ConeGeometry(2.8, 3.8, 3), cutoutWindowMat);
      triCutout.position.set(0, -4, 5.1);
      pBlock.add(triCutout);
    }

    // 4. Bangladesh National Flag on Mast
    const flagMast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.15, 9, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 })
    );
    flagMast.position.set(0, 1.4 + coreHeight + 9, 0);
    group.add(flagMast);

    // Green Flag with Red Circle
    const flagCanvas = document.createElement('canvas');
    flagCanvas.width = 128;
    flagCanvas.height = 80;
    const fCtx = flagCanvas.getContext('2d');
    if (fCtx) {
      fCtx.fillStyle = '#006a4e';
      fCtx.fillRect(0, 0, 128, 80);
      fCtx.fillStyle = '#f42a41';
      fCtx.beginPath();
      fCtx.arc(56, 40, 24, 0, Math.PI * 2);
      fCtx.fill();
    }
    const flagMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 2.2),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(flagCanvas), side: THREE.DoubleSide })
    );
    flagMesh.position.set(1.9, 1.4 + coreHeight + 11.5, 0);
    group.add(flagMesh);

    // 5. Bengali Landmark Signboard
    const signGroup = this.createLandmarkSign('জাতীয় সংসদ ভবন', 'LOUIS KAHN ARCHITECTURE • DHAKA');
    signGroup.position.set(0, 3.5, 38);
    group.add(signGroup);

    return group;
  }

  /**
   * Mir Jumla's Historic Dhaka Gate (মীর জুমলার ঢাকা গেট - ১৬৬০ খ্রিঃ)
   * Twin Mughal ochre-yellow watchtowers, connecting arch, battlements & Bibi Maryam cannon.
   */
  public static createDhakaGate(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Landmark_DhakaGate';

    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Historic Mughal warm ochre sandstone
      roughness: 0.85,
      metalness: 0.1,
    });
    const stoneDarkMat = new THREE.MeshStandardMaterial({
      color: 0x92400e,
      roughness: 0.9,
    });
    const cannonBronzeMat = new THREE.MeshStandardMaterial({
      color: 0x3f3f46,
      metalness: 0.8,
      roughness: 0.3,
    });

    // Plaza Base
    const plaza = new THREE.Mesh(
      new THREE.BoxGeometry(36, 0.5, 16),
      new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.85 })
    );
    plaza.position.set(0, 0.25, 0);
    group.add(plaza);

    // Flanking Twin Mughal Octagonal Watchtowers
    [-9, 9].forEach((towerX) => {
      // Main octagonal tower shaft
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.0, 12, 8), stoneMat);
      tower.position.set(towerX, 6.25, 0);
      group.add(tower);

      // Decorative Mughal Cornice
      const cornice = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 2.6, 1.2, 8), stoneDarkMat);
      cornice.position.set(towerX, 12.6, 0);
      group.add(cornice);

      // Parapet & Battlements (Crenellations)
      const battlements = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 1.0, 8), stoneMat);
      battlements.position.set(towerX, 13.5, 0);
      group.add(battlements);

      // Conical Dome Roof
      const dome = new THREE.Mesh(new THREE.ConeGeometry(3.0, 3.2, 8), stoneDarkMat);
      dome.position.set(towerX, 15.2, 0);
      group.add(dome);

      // Mughal Spire Finial
      const finial = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.4, 2.2, 6),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9 })
      );
      finial.position.set(towerX, 17.5, 0);
      group.add(finial);

      // Arched Windows in Tower
      [4, 8].forEach((wy) => {
        const win = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 1.6, 5.4),
          new THREE.MeshBasicMaterial({ color: 0x1c1917 })
        );
        win.position.set(towerX, wy, 0);
        group.add(win);
      });
    });

    // Central Mughal Arched Span
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(13, 2.2, 2.4), stoneMat);
    archTop.position.set(0, 10.5, 0);
    group.add(archTop);

    // Arch crenellations
    for (let cx = -5; cx <= 5; cx += 2.2) {
      const crenel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 2.5), stoneDarkMat);
      crenel.position.set(cx, 12.0, 0);
      group.add(crenel);
    }

    // Side historic wall wings
    [-14, 14].forEach((wx) => {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(5.5, 5, 2.0), stoneMat);
      wing.position.set(wx, 2.75, 0);
      group.add(wing);
    });

    // Historic Bibi Maryam Bronze Cannon beside gate
    const cannonGroup = new THREE.Group();
    const cannonBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.45, 3.5, 12),
      cannonBronzeMat
    );
    cannonBarrel.rotation.x = Math.PI / 2 + 0.15;
    cannonBarrel.position.set(0, 1.1, 0);
    cannonGroup.add(cannonBarrel);

    const carriage = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.7, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 })
    );
    carriage.position.set(0, 0.6, -0.2);
    cannonGroup.add(carriage);

    // Wooden wheels
    [-0.8, 0.8].forEach((wheelX) => {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, 0.25, 12),
        new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.7 })
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wheelX, 0.55, -0.2);
      cannonGroup.add(wheel);
    });

    cannonGroup.position.set(8.5, 0.4, 5.5);
    group.add(cannonGroup);

    // Bengali Landmark Signboard
    const signGroup = this.createLandmarkSign('মীর জুমলার ঢাকা গেট', 'HISTORIC MUGHAL GATEWAY (1660 AD) • DHAKA');
    signGroup.position.set(0, 2.2, 6.8);
    group.add(signGroup);

    return group;
  }

  /**
   * Central Shaheed Minar (কেন্দ্রীয় শহীদ মিনার)
   * Sacred national language monument with pure white marble pillars & vibrant crimson sun disc.
   */
  public static createShaheedMinar(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Landmark_ShaheedMinar';

    const marbleMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.35,
      metalness: 0.1,
    });
    const marbleDarkMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.5,
    });
    const crimsonSunMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0xef4444,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.1,
    });

    // 1. Stepped Marble Podium & Base Stairs
    const basePlaza = new THREE.Mesh(new THREE.BoxGeometry(26, 0.5, 20), marbleDarkMat);
    basePlaza.position.set(0, 0.25, 0);
    group.add(basePlaza);

    const step1 = new THREE.Mesh(new THREE.BoxGeometry(22, 0.4, 16), marbleMat);
    step1.position.set(0, 0.6, 0);
    group.add(step1);

    const step2 = new THREE.Mesh(new THREE.BoxGeometry(18, 0.4, 12), marbleMat);
    step2.position.set(0, 0.9, 0);
    group.add(step2);

    // 2. Radiant Crimson Sun Disk (রক্তিম সূর্য)
    const sunDisc = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 0.3, 32), crimsonSunMat);
    sunDisc.rotation.x = Math.PI / 2;
    sunDisc.position.set(0, 9.8, -1.8);
    group.add(sunDisc);

    // 3. Central Bent Pillar Structure (Mother shielding children)
    const centralPillarGroup = new THREE.Group();
    // Vertical columns
    [-1.8, 1.8].forEach((cx) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.7, 16.5, 0.7), marbleMat);
      col.position.set(cx, 9.0, 0);
      centralPillarGroup.add(col);
    });

    // Top horizontal connecting canopy
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.9, 0.9), marbleMat);
    topBar.position.set(0, 17.0, 0);
    centralPillarGroup.add(topBar);

    // Forward angled protective canopy roof
    const canopyRoof = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.4, 4.5), marbleMat);
    canopyRoof.position.set(0, 17.5, 1.8);
    canopyRoof.rotation.x = 0.25; // Angled forward
    centralPillarGroup.add(canopyRoof);
    group.add(centralPillarGroup);

    // 4. Flanking Angled Side Pillars
    // Inner Pair (medium height)
    [-3.8, 3.8].forEach((cx, idx) => {
      const sideGroup = new THREE.Group();
      const colA = new THREE.Mesh(new THREE.BoxGeometry(0.55, 11.5, 0.55), marbleMat);
      colA.position.set(0, 6.4, 0);
      sideGroup.add(colA);

      const topA = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.6), marbleMat);
      topA.position.set(0, 12.0, 0);
      sideGroup.add(topA);

      sideGroup.position.set(cx, 0, -0.4);
      sideGroup.rotation.z = idx === 0 ? 0.08 : -0.08;
      group.add(sideGroup);
    });

    // Outer Pair (shorter height)
    [-6.2, 6.2].forEach((cx, idx) => {
      const sideGroup = new THREE.Group();
      const colB = new THREE.Mesh(new THREE.BoxGeometry(0.5, 8.0, 0.5), marbleMat);
      colB.position.set(0, 4.6, 0);
      sideGroup.add(colB);

      const topB = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, 0.5), marbleMat);
      topB.position.set(0, 8.6, 0);
      sideGroup.add(topB);

      sideGroup.position.set(cx, 0, -0.8);
      sideGroup.rotation.z = idx === 0 ? 0.12 : -0.12;
      group.add(sideGroup);
    });

    // 5. Floral Wreaths / Altar offerings
    [-2.2, 0, 2.2].forEach((wx) => {
      const wreath = new THREE.Mesh(
        new THREE.TorusGeometry(0.8, 0.3, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6 })
      );
      wreath.rotation.x = Math.PI / 2;
      wreath.position.set(wx, 1.25, 2.8);
      group.add(wreath);
    });

    // Bengali Landmark Signboard
    const signGroup = this.createLandmarkSign('কেন্দ্রীয় শহীদ মিনার', 'CENTRAL SHAHEED MINAR • DHAKA');
    signGroup.position.set(0, 2.0, 7.5);
    group.add(signGroup);

    return group;
  }

  /**
   * Helper to generate crisp Bengali identification signboards in 3D
   */
  private static createLandmarkSign(title: string, sub: string): THREE.Group {
    const signGroup = new THREE.Group();

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Dark green border & background with gold trim
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(0, 0, 512, 140);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 8;
      ctx.strokeRect(6, 6, 500, 128);

      // Bengali Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, 256, 60);

      // English Subtitle
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 22px "Rajdhani", sans-serif';
      ctx.fillText(sub, 256, 105);
    }

    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 2.2),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), side: THREE.DoubleSide })
    );
    signMesh.position.y = 1.6;
    signGroup.add(signMesh);

    // Support posts
    [-3.2, 3.2].forEach((px) => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 3.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
      );
      post.position.set(px, 0.8, 0);
      signGroup.add(post);
    });

    return signGroup;
  }
}
