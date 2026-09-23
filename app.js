// AnatoVi 3D - Complete Anatomy Master Edition
// Photorealistic Medical PBR Materials & Multi-Layer Vascular & Muscular Control

let scene, camera, renderer, controls;
let allMeshes = [];
let anatomyData = { clinical: {}, translations: {} };

let selectedMesh = null;
let hoveredMesh = null;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

let isAutoRotating = false;
let globalDissectionLevel = 1;

// 15 Anatomical Systems Configuration (BodyParts3D 4.0 MRI/CT Standard Specification)
const SYSTEMS_CONFIG = {
  skeletal: {
    name: 'Skeletal',
    viName: 'Hệ Xương',
    active: true,
    statusText: 'Bật'
  },
  connective: {
    name: 'Connective T.',
    viName: 'Khớp & Dây Chằng',
    active: false,
    statusText: 'Tắt'
  },
  muscular: {
    name: 'Muscular',
    viName: 'Hệ Cơ Bắp',
    active: false,
    layer: 8,
    statusText: 'Tắt'
  },
  arterial: {
    name: 'Arterial',
    viName: 'Hệ Động Mạch',
    active: false,
    layer: 2,
    statusText: 'Tắt'
  },
  venous: {
    name: 'Venous',
    viName: 'Hệ Tĩnh Mạch',
    active: false,
    layer: 2,
    statusText: 'Tắt'
  },
  cardiac: {
    name: 'Cardiac',
    viName: 'Tim Mạch (Tim)',
    active: false,
    statusText: 'Tắt'
  },
  nervous: {
    name: 'Nervous',
    viName: 'Hệ Thần Kinh',
    active: false,
    statusText: 'Tắt'
  },
  respiratory: {
    name: 'Respiratory',
    viName: 'Hệ Hô Hấp',
    active: false,
    statusText: 'Tắt'
  },
  digestive: {
    name: 'Digestive',
    viName: 'Hệ Tiêu Hóa',
    active: false,
    statusText: 'Tắt'
  },
  urinary: {
    name: 'Urinary',
    viName: 'Hệ Tiết Niệu',
    active: false,
    statusText: 'Tắt'
  },
  reproductive: {
    name: 'Reproductive',
    viName: 'Hệ Sinh Dục',
    active: false,
    statusText: 'Tắt'
  },
  urogenital: {
    name: 'Urogenital',
    viName: 'Tiết Niệu & Sinh Dục',
    active: false,
    statusText: 'Tắt'
  },
  endocrine: {
    name: 'Endocrine',
    viName: 'Hệ Nội Tiết',
    active: false,
    statusText: 'Tắt'
  },
  lymphatic: {
    name: 'Lymphatic',
    viName: 'Hệ Bạch Huyết',
    active: false,
    statusText: 'Tắt'
  },
  sensory: {
    name: 'Sensory',
    viName: 'Giác Quan (Mắt & Tai)',
    active: false,
    statusText: 'Tắt'
  },
  integumentary: {
    name: 'Integumentary',
    viName: 'Hệ Da & Mạc Nông',
    active: false,
    statusText: 'Tắt'
  }
};

// Model files loader tracking (Cached)
const MODEL_FILES = {};

// PHOTOREALISTIC COMPLETE ANATOMY COLOR PALETTE
const PALETTE = {
  // Bone: distinctly warm yellowish ivory anatomical bone with natural organic calcium tone
  bone: { color: 0xdece9a, roughness: 0.35, metalness: 0.01 },
  
  // Cartilage: soft translucent pearlescent articular cartilage
  cartilage: { color: 0xa8bccb, roughness: 0.26, metalness: 0.03, transparent: true, opacity: 0.85 },
  
  // Teeth: glossy enamel ivory white
  teeth: { color: 0xfcfaf2, roughness: 0.16, metalness: 0.02 },
  
  // Ligaments & Joint Capsules: glistening pearlescent silver-white
  ligament: { color: 0xe2e8f0, roughness: 0.28, metalness: 0.06 },
  meniscus: { color: 0x94a3b8, roughness: 0.28, metalness: 0.04 },
  
  // Muscle Bellies: deep, rich striated anatomical crimson
  muscle: { color: 0x6e1315, roughness: 0.30, metalness: 0.03 },
  
  // Tendons & Aponeuroses: gleaming pearl-white fibrous bands
  tendon: { color: 0xf8fafc, roughness: 0.22, metalness: 0.04 },
  
  // Cardio
  heart: { color: 0x6e0d0d, roughness: 0.22, metalness: 0.02 },
  artery: { color: 0x73080b, roughness: 0.18, metalness: 0.02 },
  vein: { color: 0x2435b8, roughness: 0.18, metalness: 0.02 },
  
  // Nervous
  cerebrum: { color: 0xd8938a, roughness: 0.38, metalness: 0.0 },
  cerebellum: { color: 0xc98279, roughness: 0.40, metalness: 0.0 },
  brainstem: { color: 0xdccbb2, roughness: 0.35, metalness: 0.0 },
  nerve: { color: 0xfacc15, roughness: 0.30, metalness: 0.02, emissive: 0x2c2200 },
  
  // Visceral: Moist, living organ colors
  liver: { color: 0x541311, roughness: 0.22, metalness: 0.02 },
  gallbladder: { color: 0x15803d, roughness: 0.16, metalness: 0.02 },
  stomach: { color: 0xbf6736, roughness: 0.32, metalness: 0.01 },
  pancreas: { color: 0xd99841, roughness: 0.38, metalness: 0.01 },
  spleen: { color: 0x50122b, roughness: 0.24, metalness: 0.02 },
  kidney: { color: 0x6e1723, roughness: 0.26, metalness: 0.02 },
  adrenal: { color: 0xd49320, roughness: 0.36, metalness: 0.01 },
  lung: { color: 0xc45e69, roughness: 0.45, metalness: 0.0 },
  bronch: { color: 0x76aab8, roughness: 0.28, metalness: 0.05 },
  smallIntestine: { color: 0xc97a4f, roughness: 0.32, metalness: 0.01 },
  largeIntestine: { color: 0xa85e4c, roughness: 0.34, metalness: 0.01 },
  bladder: { color: 0xc7784e, roughness: 0.30, metalness: 0.02 },
  thyroid: { color: 0xad4137, roughness: 0.36, metalness: 0.01 },
  integumentary: { color: 0xe2e8f0, roughness: 0.45, transparent: true, opacity: 0.18 }
};

// Application Bootstrap
window.addEventListener('DOMContentLoaded', async () => {
  initThree();
  await loadAnatomyData();
  setupEvents();
  setupSearch();
  initAnatomyModels();
});

function initThree() {
  const container = document.getElementById('webgl-container');

  // Scene
  scene = new THREE.Scene();

  // Camera positioned for full standing human body with comfortable margins
  const h = window.innerHeight - 68;
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / h, 0.05, 50);
  camera.position.set(0, 0.85, 2.6);

  // Renderer with ACES Filmic tone mapping for rich cinematic color
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance", alpha: true });
  renderer.setSize(window.innerWidth, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  // OrbitControls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 0.85, 0);
  controls.maxDistance = 5.0;
  controls.minDistance = 0.12;
  controls.panSpeed = 2.4; // Tăng tốc độ di chuyển / kéo chuột phải (pan) mượt mà và nhanh hơn đáng kể
  controls.screenSpacePanning = true; // Di chuyển theo mặt phẳng khung nhìn trực quan

  window.camera = camera;
  window.controls = controls;
  window.scene = scene;

  // Complete Anatomy Studio Lighting Setup (Warm natural illumination matching anatomical atlases)
  const ambientLight = new THREE.AmbientLight(0xfff8ee, 0.28);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xfff7ea, 0.95);
  keyLight.position.set(2.4, 3.4, 3.0);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xf5ede2, 0.35);
  fillLight.position.set(-2.4, 1.8, 2.0);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffeedd, 0.30);
  rimLight.position.set(0, -1, -3.5);
  scene.add(rimLight);

  // Animation Loop
  animate();

  // Resize handler
  window.addEventListener('resize', onWindowResize);
}

let targetCamPos = null;
let targetCamLookAt = null;

function animate() {
  requestAnimationFrame(animate);

  // Smooth camera glide towards target in Atlas or focus mode
  if (targetCamPos && targetCamLookAt) {
    camera.position.lerp(targetCamPos, 0.08);
    controls.target.lerp(targetCamLookAt, 0.08);
    if (camera.position.distanceTo(targetCamPos) < 0.005) {
      targetCamPos = null;
      targetCamLookAt = null;
    }
  }

  // Pulsing highlight for marked / selected organ
  if (selectedMesh && selectedMesh.material && selectedMesh.material.emissive) {
    const pulse = 0.40 + 0.30 * Math.sin(Date.now() * 0.007);
    selectedMesh.material.emissiveIntensity = pulse;
  }

  // Dynamic pulsing for 3D silhouette outline borders
  if (typeof updateOutlinesAnimation === 'function') {
    updateOutlinesAnimation();
  }

  controls.update();

  if (isAutoRotating) {
    scene.rotation.y += 0.005;
  }

  renderer.render(scene, camera);
}

function onWindowResize() {
  const h = window.innerHeight - 68;
  camera.aspect = window.innerWidth / h;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, h);
}

// Load Medical Database
async function loadAnatomyData() {
  try {
    const cacheBuster = new Date().getTime();
    const res = await fetch(`data/anatomy_data.json?t=${cacheBuster}`);
    if (res.ok) {
      anatomyData = await res.json();
      anatomyData._lowerTranslations = {};
      if (anatomyData.translations) {
        for (let k in anatomyData.translations) {
          anatomyData._lowerTranslations[k.toLowerCase().trim()] = anatomyData.translations[k];
        }
      }
      anatomyData._lowerLatin = {};
      if (anatomyData.latin) {
        for (let k in anatomyData.latin) {
          anatomyData._lowerLatin[k.toLowerCase().trim()] = anatomyData.latin[k];
        }
      }
    }
  } catch (e) {
    console.warn("Could not fetch anatomy_data.json:", e);
  }
}

// ========================================================
// BODYPARTS3D 4.0 HIGH-PRECISION MRI/CT SCAN LOADER
// Direct ArrayBuffer 16-bit Decoded Chunks
// ========================================================
let bodyParts3DAtlas = null;
let bodyParts3DVi = null;

const SYSTEM_MATERIALS_BP3D = {
  skeletal: new THREE.MeshStandardMaterial({ color: 0xdece9a, roughness: 0.38, metalness: 0.02 }),
  connective: new THREE.MeshStandardMaterial({ color: 0xd5d9dc, roughness: 0.32, metalness: 0.02 }),
  muscular: new THREE.MeshStandardMaterial({ color: 0xa8483e, roughness: 0.45, metalness: 0.01 }),
  arterial: new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.28, metalness: 0.04 }),
  venous: new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.28, metalness: 0.04 }),
  cardiac: new THREE.MeshStandardMaterial({ color: 0x9b1b1b, roughness: 0.30, metalness: 0.02 }),
  nervous: new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.32, metalness: 0.03 }),
  respiratory: new THREE.MeshStandardMaterial({ color: 0x67e8f9, roughness: 0.38, metalness: 0.01 }),
  digestive: new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.35, metalness: 0.01 }),
  urinary: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.32, metalness: 0.02 }),
  reproductive: new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.34, metalness: 0.02 }),
  endocrine: new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.36, metalness: 0.01 }),
  lymphatic: new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.38, metalness: 0.02 }),
  sensory: new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.30, metalness: 0.04 }),
  integumentary: new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.50, transparent: true, opacity: 0.18 })
};

async function initAnatomyModels() {
  const overlay = document.getElementById('loading-overlay');
  const status = document.getElementById('loading-status');
  const fill = document.getElementById('loading-fill');

  function updateProgress(percent, msg) {
    if (fill) fill.style.width = percent + '%';
    if (status) status.textContent = msg || `Đang nạp mô hình BodyParts3D: ${percent}%`;
  }

  function dismissOverlay() {
    if (overlay && overlay.style.display !== 'none') {
      if (fill) fill.style.width = '100%';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 350);
    }
  }

  try {
    updateProgress(5, 'Đang đọc chỉ mục giải phẫu BodyParts3D 4.0...');

    const [atlasRes, viRes] = await Promise.all([
      fetch('models/bodyparts3d/atlas.json'),
      fetch('data/bodyparts3d_vi.json')
    ]);

    if (!atlasRes.ok) throw new Error('Không thể tải file atlas.json');
    bodyParts3DAtlas = await atlasRes.json();
    bodyParts3DVi = viRes.ok ? await viRes.json() : null;

    updateProgress(15, 'Đang giải mã và dựng mô hình giải phẫu...');

    const parts = bodyParts3DAtlas.parts || [];
    const chunks = bodyParts3DAtlas.chunks || [];
    const totalChunks = chunks.length;
    let chunksLoaded = 0;

    const concurrency = 3;
    let chunkCursor = 0;

    async function fetchBufferWithRetry(url, maxRetries = 3) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
          return await res.arrayBuffer();
        } catch (err) {
          if (attempt === maxRetries) throw err;
          await new Promise(r => setTimeout(r, attempt * 400));
        }
      }
    }

    const failedChunks = [];

    async function processChunk(ci) {
      const chunkUrl = `models/bodyparts3d/body-${ci}.bp3d`;
      try {
        const buffer = await fetchBufferWithRetry(chunkUrl, 3);
        const chunkParts = parts.filter(p => p.chunk === ci);
        for (let p of chunkParts) {
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(buffer, p.positions, p.vertexCount * 3), 3));
          g.setAttribute('normal', new THREE.BufferAttribute(new Int16Array(buffer, p.normals, p.vertexCount * 3), 3, true));
          g.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer, p.indices, p.indexCount), 1));

          if (p.bounds) {
            g.boundingBox = new THREE.Box3(
              new THREE.Vector3().fromArray(p.bounds[0]),
              new THREE.Vector3().fromArray(p.bounds[1])
            );
            g.computeBoundingSphere();
          }

          let mat = SYSTEM_MATERIALS_BP3D[p.system] || SYSTEM_MATERIALS_BP3D.skeletal;
          if (p.system === 'integumentary') {
            mat = mat.clone();
            mat.transparent = true;
            mat.opacity = 0.18;
          } else {
            mat = mat.clone();
          }

          const mesh = new THREE.Mesh(g, mat);
          mesh.name = p.name;
          mesh.frustumCulled = true;

          const viEntry = bodyParts3DVi?.parts?.[p.id] || {};
          const viName = viEntry.vi || p.name;
          const latinName = viEntry.latin || '';
          const sysVi = SYSTEMS_CONFIG[p.system]?.viName || p.system;
          const desc = viEntry.desc || `Cấu trúc thuộc ${sysVi}. Mã định danh FMA: ${p.conceptId}. Nguồn ảnh quét y khoa chuẩn BodyParts3D 4.0 (CC BY 4.0 - DBCLS).`;

          mesh.userData = {
            id: p.id,
            conceptId: p.conceptId,
            cleanName: p.name,
            rawName: p.name,
            enName: p.name,
            viName: viName,
            latinName: latinName,
            system: p.system,
            desc: desc,
            originalColor: mesh.material.color.getHex(),
            originalMaterial: mesh.material,
            bounds: p.bounds,
            center: p.bounds ? [
              (p.bounds[0][0] + p.bounds[1][0]) / 2,
              (p.bounds[0][1] + p.bounds[1][1]) / 2,
              (p.bounds[0][2] + p.bounds[1][2]) / 2
            ] : [0, 0.865, 0]
          };

          scene.add(mesh);
          allMeshes.push(mesh);
        }

        chunksLoaded++;
        const pct = Math.round(15 + (chunksLoaded / totalChunks) * 80);
        updateProgress(pct, `Đang nạp dữ liệu giải phẫu: ${chunksLoaded}/${totalChunks} khối (${pct}%)...`);
      } catch (err) {
        console.error(`Lỗi nạp khối ${ci}:`, err);
        failedChunks.push(ci);
      }
    }

    async function loadChunkWorker() {
      while (chunkCursor < totalChunks) {
        const ci = chunkCursor++;
        await processChunk(ci);
      }
    }

    const workers = [];
    for (let w = 0; w < concurrency; w++) {
      workers.push(loadChunkWorker());
    }
    await Promise.all(workers);

    // Fallback retry for any chunk that failed during parallel loading
    if (failedChunks.length > 0) {
      console.warn(`Đang thử lại ${failedChunks.length} khối dữ liệu bị gián đoạn...`, failedChunks);
      const toRetry = [...failedChunks];
      failedChunks.length = 0;
      for (let ci of toRetry) {
        await processChunk(ci);
      }
    }

    if (failedChunks.length > 0) {
      console.error(`Không thể nạp hoàn chỉnh ${failedChunks.length} khối giải phẫu:`, failedChunks);
      if (status) {
        status.innerHTML = `⚠️ Một số phần mô hình bị gián đoạn kết nối tải (${failedChunks.length} khối). <button onclick="location.reload()" style="margin-left:8px;padding:3px 10px;background:#00d2ff;color:#000;border:none;border-radius:6px;cursor:pointer;font-weight:700;">Tải lại trang</button>`;
      }
    }

    // ========================================================
    // LOAD HYBRID CERVICAL VASCULATURE & CRANIAL NERVES
    // (Farabeuf's Triangle, External Carotid, Jugular & CN XII/VII)
    // ========================================================
    updateProgress(96, 'Đang ghép nối mô hình mạch máu & thần kinh cổ (Tam giác Farabeuf)...');
    try {
      const hybridMetaRes = await fetch('data/hybrid_cervical_meta.json');
      const hybridMetaList = hybridMetaRes.ok ? await hybridMetaRes.json() : [];
      const hybridMetaMap = {};
      for (let m of hybridMetaList) {
        hybridMetaMap[m.name] = m;
      }

      const gltfLoader = new THREE.GLTFLoader();
      await new Promise((resolve) => {
        gltfLoader.load(
          'models/hybrid_cervical.glb',
          (gltf) => {
            const root = gltf.scene;
            const hybridMeshes = [];
            root.traverse((child) => {
              if (child.isMesh) {
                hybridMeshes.push(child);
              }
            });

            for (let mesh of hybridMeshes) {
              const meta = hybridMetaMap[mesh.name] || {};
              const sysKey = meta.system || 'arterial';
              let mat = SYSTEM_MATERIALS_BP3D[sysKey] || SYSTEM_MATERIALS_BP3D.arterial;
              mesh.material = mat.clone();

              if (!mesh.geometry.boundingBox) {
                mesh.geometry.computeBoundingBox();
              }
              mesh.geometry.computeBoundingSphere();

              const bounds = meta.bounds || [
                [mesh.geometry.boundingBox.min.x, mesh.geometry.boundingBox.min.y, mesh.geometry.boundingBox.min.z],
                [mesh.geometry.boundingBox.max.x, mesh.geometry.boundingBox.max.y, mesh.geometry.boundingBox.max.z]
              ];
              const center = meta.center || [
                (bounds[0][0] + bounds[1][0]) / 2,
                (bounds[0][1] + bounds[1][1]) / 2,
                (bounds[0][2] + bounds[1][2]) / 2
              ];

              const viEntry = bodyParts3DVi?.parts?.[mesh.name] || {};
              const viName = viEntry.vi || meta.vi || mesh.name;
              const latinName = viEntry.latin || meta.latin || '';
              const desc = viEntry.desc || meta.desc || `Cấu trúc giải phẫu vùng cổ thuộc ${SYSTEMS_CONFIG[sysKey]?.viName || sysKey}. Nguồn: Mô hình giải phẫu ghép nối siêu chi tiết (Hybrid Integration).`;

              mesh.userData = {
                id: 'HYBRID_' + mesh.name.replace(/[^a-zA-Z0-9]/g, '_'),
                cleanName: viName,
                rawName: mesh.name,
                enName: mesh.name,
                viName: viName,
                latinName: latinName,
                system: sysKey,
                desc: desc,
                originalColor: mesh.material.color.getHex(),
                originalMaterial: mesh.material,
                bounds: bounds,
                center: center
              };

              mesh.frustumCulled = true;
              scene.add(mesh);
              allMeshes.push(mesh);
            }
            console.log(`Đã nạp thành công ${hybridMeshes.length} meshes Hybrid Cổ (Tam giác Farabeuf & Cảnh Ngoài)!`);
            resolve();
          },
          undefined,
          (err) => {
            console.warn('Lỗi nạp hybrid_cervical.glb:', err);
            resolve();
          }
        );
      });
    } catch (hybridErr) {
      console.warn('Lỗi nạp hybrid cervical:', hybridErr);
    }

    updateProgress(100, 'Hoàn tất khởi tạo mô hình giải phẫu BodyParts3D & Hybrid!');
    console.log(`Đã nạp thành công ${allMeshes.length} meshes vào không gian 3D!`);
    window.allMeshes = allMeshes;

    applyAllSystemsVisibility();
    updateBottomBarUI();

    if (controls) {
      controls.target.set(0, 0.865, 0);
    }
  } catch (err) {
    console.error('Lỗi khởi tạo BodyParts3D:', err);
    if (status) status.textContent = 'Lỗi nạp mô hình giải phẫu: ' + err.message;
  } finally {
    setTimeout(dismissOverlay, 350);
  }
}

// ========================================================
// COMPREHENSIVE MEDICAL ANATOMY TRANSLATION ENGINE
// Terminologia Anatomica (TA2) & Vietnamese Medical Atlas
// ========================================================
const MEDICAL_TRANSLATIONS = {
  // Celiac & Upper Abdomen Arteries & Veins
  'inferior phrenic artery': {
    vi: 'Động Mạch Hoành Dưới',
    latin: 'Arteria phrenica inferior',
    en: 'Inferior phrenic artery',
    desc: 'Xuất phát từ mặt trước động mạch chủ bụng ngay trên thân tạng hoặc từ thân tạng, cấp máu cho mặt dưới cơ hoành và cho các nhánh động mạch thượng thận trên.',
    landmarkId: 'abdominal_aorta'
  },
  'superior phrenic artery': {
    vi: 'Động Mạch Hoành Trên',
    latin: 'Arteria phrenica superior',
    en: 'Superior phrenic artery',
    desc: 'Tách từ động mạch chủ ngực, cấp máu cho mặt trên cơ hoành.'
  },
  'coeliac trunk': {
    vi: 'Thân Động Mạch Tạng',
    latin: 'Truncus coeliacus',
    en: 'Celiac trunk',
    desc: 'Thân động mạch lớn xuất phát từ mặt trước động mạch chủ bụng ngang mức T12/L1, chia thành 3 nhánh chính: ĐM vị trái, ĐM gan chung và ĐM lách.',
    landmarkId: 'celiac_trunk'
  },
  'celiac trunk': {
    vi: 'Thân Động Mạch Tạng',
    latin: 'Truncus coeliacus',
    en: 'Celiac trunk',
    desc: 'Thân động mạch lớn xuất phát từ mặt trước động mạch chủ bụng ngang mức T12/L1, chia thành 3 nhánh chính: ĐM vị trái, ĐM gan chung và ĐM lách.',
    landmarkId: 'celiac_trunk'
  },
  'left gastric artery': {
    vi: 'Động Mạch Vị Trái & Nhánh Thực Quản',
    latin: 'Arteria gastrica sinistra',
    en: 'Left gastric artery',
    desc: 'Nhánh nhỏ nhất của thân tạng, chạy đến tâm vị rồi quặt dọc theo bờ cong nhỏ dạ dày trong mạc nối nhỏ, cấp máu cho đáy vị và bờ cong nhỏ.',
    landmarkId: 'left_gastric_artery'
  },
  'right gastric artery': {
    vi: 'Động Mạch Vị Phải (Vòng Bờ Cong Nhỏ)',
    latin: 'Arteria gastrica dextra',
    en: 'Right gastric artery',
    desc: 'Xuất phát từ ĐM gan riêng hoặc gan chung, đi dọc bờ cong nhỏ dạ dày nối với ĐM vị trái tạo thành vòng mạch bờ cong nhỏ.',
    landmarkId: 'right_gastric_artery'
  },
  'splenic artery': {
    vi: 'Động Mạch Lách & Nhánh Tụy',
    latin: 'Arteria splenica / lienalis',
    en: 'Splenic artery',
    desc: 'Nhánh lớn nhất của thân tạng, đi ngoằn ngoèo dọc theo bờ trên tụy đến rốn lách, cấp máu cho thân tụy, đuôi tụy, đáy vị và lách.',
    landmarkId: 'splenic_artery'
  },
  'common hepatic artery': {
    vi: 'Động Mạch Gan Chung',
    latin: 'Arteria hepatica communis',
    en: 'Common hepatic artery',
    desc: 'Chạy sang phải dọc bờ trên đầu tụy đến môn vị, chia thành ĐM gan riêng đi lên cuống gan và ĐM vị - tá tràng đi xuống sau môn vị.',
    landmarkId: 'common_hepatic_artery'
  },
  'proper hepatic artery': {
    vi: 'Động Mạch Gan Riêng & Các Nhánh Gan',
    latin: 'Arteria hepatica propria',
    en: 'Proper hepatic artery',
    desc: 'Đi trong cuống gan (bên trái ống mật chủ, trước tĩnh mạch cửa), chia nhánh nuôi thùy gan trái, thùy gan phải và cho ĐM túi mật.',
    landmarkId: 'proper_hepatic_artery'
  },
  'gastroduodenal artery': {
    vi: 'Động Mạch Vị - Tá Tràng',
    latin: 'Arteria gastroduodenalis',
    en: 'Gastroduodenal artery',
    desc: 'Chạy xuống sau môn vị và đoạn 1 tá tràng, cho ĐM tá tụy trên và ĐM vị - mạc nối phải. Nằm ngay sát thành sau hành tá tràng, dễ bị tổn thương gây xuất huyết tiêu hóa ồ ạt.',
    landmarkId: 'gastroduodenal_artery'
  },
  'inferior pancreaticoduodenal artery': {
    vi: 'Động Mạch Tá Tụy Dưới',
    latin: 'Arteria pancreaticoduodenalis inferior',
    en: 'Inferior pancreaticoduodenal artery',
    desc: 'Xuất phát từ động mạch mạc treo tràng trên, chia thành nhánh trước và sau nối với các nhánh tá tụy trên của ĐM vị tá tràng để nuôi đầu tụy và tá tràng.',
    landmarkId: 'pancreas_duodenum'
  },
  'anterior inferior pancreaticoduodenal artery': {
    vi: 'Động Mạch Tá Tụy Trước Dưới',
    latin: 'Arteria pancreaticoduodenalis anterior inferior',
    en: 'Anterior inferior pancreaticoduodenal artery',
    desc: 'Nhánh trước của động mạch tá tụy dưới, tạo vòng nối trước đầu tụy cùng với ĐM tá tụy trước trên, cấp máu dồi dào cho mặt trước đầu tụy và tá tràng.',
    landmarkId: 'pancreas_duodenum'
  },
  'posterior inferior pancreaticoduodenal artery': {
    vi: 'Động Mạch Tá Tụy Sau Dưới',
    latin: 'Arteria pancreaticoduodenalis posterior inferior',
    en: 'Posterior inferior pancreaticoduodenal artery',
    desc: 'Nhánh sau của động mạch tá tụy dưới, tạo vòng nối sau đầu tụy cấp máu cho mặt sau đầu tụy và tá tràng.',
    landmarkId: 'pancreas_duodenum'
  },
  'superior pancreaticoduodenal artery': {
    vi: 'Động Mạch Tá Tụy Trên',
    latin: 'Arteria pancreaticoduodenalis superior',
    en: 'Superior pancreaticoduodenal artery',
    desc: 'Nhánh tách từ động mạch vị - tá tràng, cấp máu cho mặt trước và sau của đầu tụy và tá tràng.',
    landmarkId: 'pancreas_duodenum'
  },
  'right gastro-omental artery': {
    vi: 'ĐM Vị - Mạc Nối Phải (Vòng Bờ Cong Lớn)',
    latin: 'Arteria gastroomentalis dextra',
    en: 'Right gastro-omental artery',
    desc: 'Tách từ ĐM vị tá tràng, chạy trong hai lá mạc nối lớn dọc bờ cong lớn dạ dày nối với ĐM vị - mạc nối trái tạo thành vòng mạch bờ cong lớn.',
    landmarkId: 'right_gastroepiploic'
  },
  'left gastro-omental artery': {
    vi: 'Động Mạch Vị - Mạc Nối Trái',
    latin: 'Arteria gastroomentalis sinistra',
    en: 'Left gastro-omental artery',
    desc: 'Nhánh của ĐM lách chạy dọc bờ cong lớn dạ dày nối với ĐM vị - mạc nối phải.',
    landmarkId: 'left_gastroepiploic'
  },
  'gastro-omental arch': {
    vi: 'Cung Động Mạch Vị - Mạc Nối (Vòng Bờ Cong Lớn)',
    latin: 'Arcus arteriosus gastroomentalis',
    en: 'Gastro-omental arterial arch',
    desc: 'Hợp thành bởi ĐM vị - mạc nối phải và ĐM vị - mạc nối trái, chạy dọc theo toàn bộ bờ cong lớn dạ dày trong mạc nối lớn.',
    landmarkId: 'right_gastroepiploic'
  },
  'short gastric arteries': {
    vi: 'Các Động Mạch Vị Ngắn (Đáy Vị)',
    latin: 'Arteriae gastricae breves',
    en: 'Short gastric arteries',
    desc: '5 - 7 nhánh nhỏ tách từ ĐM lách ở gần rốn lách, đi qua dây chằng vị lách cấp máu cho phần đáy vị dạ dày.',
    landmarkId: 'short_gastric_arteries'
  },
  'cystic artery': {
    vi: 'Động Mạch Túi Mật',
    latin: 'Arteria cystica',
    en: 'Cystic artery',
    desc: 'Xuất phát từ nhánh phải của ĐM gan riêng trong tam giác gan - mật (tam giác Calot), cấp máu cho túi mật.',
    landmarkId: 'cystic_artery'
  },
  'abdominal aorta': {
    vi: 'Động Mạch Chủ Bụng',
    latin: 'Aorta abdominalis',
    en: 'Abdominal aorta',
    desc: 'Đoạn động mạch chủ đi từ lỗ cơ hoành (T12) đến mức L4, cấp máu cho toàn bộ các tạng trong ổ bụng, khung chậu và hai chi dưới.',
    landmarkId: 'abdominal_aorta'
  },
  'thoracic aorta': {
    vi: 'Động Mạch Chủ Ngực',
    latin: 'Aorta thoracica',
    en: 'Thoracic aorta',
    desc: 'Đoạn động mạch chủ trong trung thất sau, cho các nhánh nuôi phổi, thực quản và thành ngực.'
  },
  'hepatic portal vein': {
    vi: 'Tĩnh Mạch Cửa (Tĩnh Mạch Gánh)',
    latin: 'Vena portae hepatis',
    en: 'Hepatic portal vein',
    desc: 'Trục tĩnh mạch lớn hợp thành từ TM mạc treo tràng trên và TM lách ở sau cổ tụy, đưa toàn bộ máu giàu dưỡng chất từ ống tiêu hóa về gan để khử độc và chuyển hóa.',
    landmarkId: 'portal_vein'
  },
  'portal vein': {
    vi: 'Tĩnh Mạch Cửa & Ống Mật Chủ',
    latin: 'Vena portae hepatis',
    en: 'Hepatic portal vein',
    desc: 'Trục tĩnh mạch lớn dẫn máu từ các tạng tiêu hóa về gan.',
    landmarkId: 'portal_vein'
  },
  'left gastro-omental vein': {
    vi: 'Tĩnh Mạch Vị - Mạc Nối Trái',
    latin: 'Vena gastroomentalis sinistra',
    en: 'Left gastro-omental vein',
    desc: 'Chạy dọc theo bờ cong lớn dạ dày trong mạc nối lớn, nhận máu từ dạ dày và mạc nối lớn đổ về tĩnh mạch lách.',
    landmarkId: 'left_gastroepiploic'
  },
  'right gastro-omental vein': {
    vi: 'Tĩnh Mạch Vị - Mạc Nối Phải',
    latin: 'Vena gastroomentalis dextra',
    en: 'Right gastro-omental vein',
    desc: 'Chạy dọc theo bờ cong lớn dạ dày đổ về tĩnh mạch mạc treo tràng trên hoặc thân tĩnh mạch vị - kết tràng Henle.',
    landmarkId: 'right_gastroepiploic'
  },
  'left gastro-omental artery': {
    vi: 'Động Mạch Vị - Mạc Nối Trái',
    latin: 'Arteria gastroomentalis sinistra',
    en: 'Left gastro-omental artery',
    desc: 'Nhánh của ĐM lách chạy dọc bờ cong lớn dạ dày trong 2 lá mạc nối lớn, nối với ĐM vị - mạc nối phải.',
    landmarkId: 'left_gastroepiploic'
  },
  'right gastro-omental artery': {
    vi: 'Động Mạch Vị - Mạc Nối Phải (Vòng Bờ Cong Lớn)',
    latin: 'Arteria gastroomentalis dextra',
    en: 'Right gastro-omental artery',
    desc: 'Nhánh của ĐM vị - tá tràng chạy dọc bờ cong lớn dạ dày trong mạc nối lớn, nối với ĐM vị - mạc nối trái tạo nên Vòng ĐM bờ cong lớn.',
    landmarkId: 'right_gastroepiploic'
  },
  'short gastric arteries': {
    vi: 'Các Động Mạch Vị Ngắn (Đáy Vị)',
    latin: 'Arteriae gastricae breves',
    en: 'Short gastric arteries',
    desc: 'Các nhánh nhỏ xuất phát từ ĐM lách ở rốn lách đi trong dây chằng vị lách cấp máu cho đáy vị dạ dày.',
    landmarkId: 'short_gastric_arteries'
  },
  'common bile duct': {
    vi: 'Ống Mật Chủ',
    latin: 'Ductus choledochus',
    en: 'Common bile duct',
    desc: 'Ống dẫn mật chính hợp thành từ ống gan chung và ống túi mật, đi trong cuống gan sau tá tràng đổ vào bóng gan tụy (nhú tá lớn).',
    landmarkId: 'portal_vein'
  },
  'pancreatic duct': {
    vi: 'Ống Tụy Chính (Ống Wirsung)',
    latin: 'Ductus pancreaticus',
    en: 'Main pancreatic duct',
    desc: 'Chạy dọc suốt chiều dài tụy từ đuôi đến đầu, kết hợp với ống mật chủ đổ vào nhú tá lớn ở đoạn II tá tràng.',
    landmarkId: 'pancreas_duodenum'
  },
  'stomach': {
    vi: 'Dạ Dày',
    latin: 'Gaster / Ventriculus',
    en: 'Stomach',
    desc: 'Cơ quan tiêu hóa hình chữ J nối giữa thực quản và tá tràng, gồm tâm vị, đáy vị, thân vị, hang vị và môn vị.',
    landmarkId: 'left_gastric_artery'
  },
  'duodenum': {
    vi: 'Tá Tràng',
    latin: 'Duodenum',
    en: 'Duodenum',
    desc: 'Đoạn đầu dài 25 cm của ruột non hình chữ C ôm lấy đầu tụy, là nơi đón nhận dịch mật và dịch tụy để tiêu hóa thức ăn.',
    landmarkId: 'pancreas_duodenum'
  },
  'pancreas': {
    vi: 'Tuyến Tụy (Tụy)',
    latin: 'Pancreas',
    en: 'Pancreas',
    desc: 'Tuyến nội - ngoại tiết nằm vắt ngang sau phúc mạc, đầu tụy nằm trong quai tá tràng, thân và đuôi tụy hướng sang lách.',
    landmarkId: 'pancreas_duodenum'
  },
  'liver': {
    vi: 'Gan',
    latin: 'Hepar',
    en: 'Liver',
    desc: 'Tạng đặc lớn nhất cơ thể nằm ở hạ sườn phải, đảm nhiệm khử độc, tổng hợp protein huyết tương, đông máu và sản xuất mật.',
    landmarkId: 'proper_hepatic_artery'
  },
  'gallbladder': {
    vi: 'Túi Mật',
    latin: 'Vesica biliaris / fellea',
    en: 'Gallbladder',
    desc: 'Túi hình quả lê nằm dưới mặt tạng của gan, có chức năng dự trữ và cô đặc dịch mật từ gan chuyển xuống.',
    landmarkId: 'cystic_artery'
  },
  'spleen': {
    vi: 'Lách (Lá Lách)',
    latin: 'Lien / Splen',
    en: 'Spleen',
    desc: 'Cơ quan bạch huyết lớn nhất nằm ở hạ sườn trái áp sát vòm hoành và đáy vị, tham gia lọc máu, tiêu hủy hồng cầu già và đáp ứng miễn dịch.',
    landmarkId: 'spleen'
  },
  'left medial segment of liver (iv)': {
    vi: 'Hạ Phân Thùy IV Của Gan (Thùy Vuông)',
    latin: 'Segmentum mediale sinistrum hepatis (IV)',
    en: 'Left medial segment of liver (IV)',
    desc: 'Phân thùy giữa của gan trái theo phân chia Couinaud, nằm giữa rãnh dây chằng tròn và hố túi mật.',
    landmarkId: 'proper_hepatic_artery'
  },
  'left anterior lateral segment of liver (iii)': {
    vi: 'Hạ Phân Thùy III Của Gan',
    latin: 'Segmentum anterius laterale sinistrum hepatis (III)',
    en: 'Left anterior lateral segment of liver (III)',
    desc: 'Nằm ở phần trước dưới của gan trái, nhận máu từ nhánh phân thùy III của động mạch gan trái và tĩnh mạch cửa.',
    landmarkId: 'proper_hepatic_artery'
  },
  'left posterior lateral segment of liver (ii)': {
    vi: 'Hạ Phân Thùy II Của Gan',
    latin: 'Segmentum posterius laterale sinistrum hepatis (II)',
    en: 'Left posterior lateral segment of liver (II)',
    desc: 'Nằm ở phần sau trên của gan trái, áp sát cơ hoành và thực quản.',
    landmarkId: 'proper_hepatic_artery'
  },
  'posterior segment of liver (i)': {
    vi: 'Thùy Đuôi (Hạ Phân Thùy I Của Gan)',
    latin: 'Lobus caudatus hepatis (Segmentum I)',
    en: 'Caudate lobe of liver (Segment I)',
    desc: 'Nằm ở mặt sau gan giữa tĩnh mạch chủ dưới và rãnh dây chằng tĩnh mạch, nhận máu từ cả hai nhánh cửa và đổ trực tiếp vào tĩnh mạch chủ dưới.',
    landmarkId: 'proper_hepatic_artery'
  }
};

function translateToVietnameseMedical(name) {
  if (!name) return '';
  const clean = name.trim();
  const low = clean.toLowerCase();

  // 1. Direct dictionary match
  if (MEDICAL_TRANSLATIONS[low]) {
    return MEDICAL_TRANSLATIONS[low].vi;
  }

  // 2. Anatomical keywords
  if (low.includes('inferior phrenic artery')) return 'Động mạch hoành dưới';
  if (low.includes('superior phrenic artery')) return 'Động mạch hoành trên';
  if (low.includes('phrenic artery')) return 'Động mạch hoành';
  if (low.includes('phrenic nerve')) return 'Thần kinh hoành';
  if (low.includes('phrenic vein')) return 'Tĩnh mạch hoành';

  if (low === 'stomach') return 'Dạ dày';
  if (low === 'liver') return 'Gan';
  if (low === 'gallbladder') return 'Túi mật';
  if (low === 'pancreas') return 'Tuyến tụy (Tụy)';
  if (low === 'duodenum') return 'Tá tràng';
  if (low === 'spleen') return 'Lách (Lá lách)';
  if (low === 'kidney') return 'Thận';
  if (low === 'urinary bladder' || low === 'bladder') return 'Bàng quang';
  if (low === 'heart') return 'Tim';
  if (low === 'lung') return 'Phổi';
  if (low === 'esophagus' || low === 'oesophagus') return 'Thực quản';
  if (low === 'trachea') return 'Khí quản';

  // Segments of liver
  if (low.includes('segment of liver') || low.includes('segmentum hepatis')) {
    if (low.includes('(iv)') || low.includes(' iv')) return 'Hạ phân thùy IV của gan (Thùy vuông)';
    if (low.includes('(iii)') || low.includes(' iii')) return 'Hạ phân thùy III của gan';
    if (low.includes('(ii)') || low.includes(' ii')) return 'Hạ phân thùy II của gan';
    if (low.includes('(i)') || low.includes(' i') || low.includes('posterior segment')) return 'Thùy đuôi (Hạ phân thùy I của gan)';
    return 'Phân thùy gan';
  }

  // General systematic translations
  let vi = clean;
  vi = vi.replace(/anterior\s+inferior\s+pancreaticoduodenal\s+artery/gi, 'Động mạch tá tụy trước dưới');
  vi = vi.replace(/posterior\s+inferior\s+pancreaticoduodenal\s+artery/gi, 'Động mạch tá tụy sau dưới');
  vi = vi.replace(/inferior\s+pancreaticoduodenal\s+artery/gi, 'Động mạch tá tụy dưới');
  vi = vi.replace(/superior\s+pancreaticoduodenal\s+artery/gi, 'Động mạch tá tụy trên');
  vi = vi.replace(/gastro-omental\s+vein|gastroepiploic\s+vein/gi, 'Tĩnh mạch vị - mạc nối');
  vi = vi.replace(/gastro-omental\s+artery|gastroepiploic\s+artery/gi, 'Động mạch vị - mạc nối');
  vi = vi.replace(/coeliac\s+trunk|celiac\s+trunk/gi, 'Thân động mạch tạng');
  vi = vi.replace(/left\s+gastric\s+artery/gi, 'Động mạch vị trái');
  vi = vi.replace(/right\s+gastric\s+artery/gi, 'Động mạch vị phải');
  vi = vi.replace(/splenic\s+artery/gi, 'Động mạch lách');
  vi = vi.replace(/common\s+hepatic\s+artery/gi, 'Động mạch gan chung');
  vi = vi.replace(/proper\s+hepatic\s+artery/gi, 'Động mạch gan riêng');
  vi = vi.replace(/gastroduodenal\s+artery/gi, 'Động mạch vị - tá tràng');
  vi = vi.replace(/hepatic\s+portal\s+vein|portal\s+vein/gi, 'Tĩnh mạch cửa');
  vi = vi.replace(/common\s+bile\s+duct/gi, 'Ống mật chủ');
  vi = vi.replace(/pancreatic\s+duct/gi, 'Ống tụy chính');
  vi = vi.replace(/cystic\s+artery/gi, 'Động mạch túi mật');
  vi = vi.replace(/abdominal\s+aorta/gi, 'Động mạch chủ bụng');
  vi = vi.replace(/thoracic\s+aorta/gi, 'Động mạch chủ ngực');
  vi = vi.replace(/aorta/gi, 'Động mạch chủ');

  // Specific Vascular Systems
  vi = vi.replace(/thoraco[- ]?acromial\s+artery/gi, 'Động mạch ngực - cùng vai');
  vi = vi.replace(/suprascapular\s+artery/gi, 'Động mạch trên vai');
  vi = vi.replace(/thoracodorsal\s+artery/gi, 'Động mạch ngực - lưng');
  vi = vi.replace(/subscapular\s+artery/gi, 'Động mạch dưới vai');
  vi = vi.replace(/common\s+carotid\s+artery/gi, 'Động mạch cảnh chung');
  vi = vi.replace(/internal\s+carotid\s+artery/gi, 'Động mạch cảnh trong');
  vi = vi.replace(/external\s+carotid\s+artery/gi, 'Động mạch cảnh ngoài');
  vi = vi.replace(/middle\s+meningeal\s+artery/gi, 'Động mạch màng não giữa');
  vi = vi.replace(/basilar\s+artery/gi, 'Động mạch nền');
  vi = vi.replace(/(?:deep\s+brachial|profunda\s+brachii)\s+artery/gi, 'Động mạch cánh tay sâu');
  vi = vi.replace(/common\s+interosseous\s+artery/gi, 'Động mạch gian cốt chung');
  vi = vi.replace(/anterior\s+interosseous\s+artery/gi, 'Động mạch gian cốt trước');
  vi = vi.replace(/posterior\s+interosseous\s+artery/gi, 'Động mạch gian cốt sau');
  vi = vi.replace(/superior\s+gluteal\s+artery/gi, 'Động mạch mông trên');
  vi = vi.replace(/inferior\s+gluteal\s+artery/gi, 'Động mạch mông dưới');
  vi = vi.replace(/deep\s+circumflex\s+iliac\s+artery/gi, 'Động mạch mũ chậu sâu');
  vi = vi.replace(/superior\s+epigastric\s+artery/gi, 'Động mạch thượng vị trên');
  vi = vi.replace(/inferior\s+epigastric\s+artery/gi, 'Động mạch thượng vị dưới');
  vi = vi.replace(/subcostal\s+artery/gi, 'Động mạch dưới sườn');

  vi = vi.replace(/submental\s+artery/gi, 'Động mạch dưới cằm');
  vi = vi.replace(/sublingual\s+artery/gi, 'Động mạch dưới lưỡi');
  vi = vi.replace(/mental\s+artery/gi, 'Động mạch cằm');
  vi = vi.replace(/facial\s+artery/gi, 'Động mạch mặt');
  vi = vi.replace(/lingual\s+artery/gi, 'Động mạch lưỡi');
  vi = vi.replace(/maxillary\s+artery/gi, 'Động mạch hàm');
  vi = vi.replace(/sphenopalatine\s+artery/gi, 'Động mạch bướm - khẩu cái');
  vi = vi.replace(/ascending\s+palatine\s+artery/gi, 'Động mạch khẩu cái lên');
  vi = vi.replace(/descending\s+palatine\s+artery/gi, 'Động mạch khẩu cái xuống');
  vi = vi.replace(/greater\s+palatine\s+artery/gi, 'Động mạch khẩu cái lớn');
  vi = vi.replace(/lesser\s+palatine\s+arteries/gi, 'Các động mạch khẩu cái bé');
  vi = vi.replace(/inferior\s+alveolar\s+artery/gi, 'Động mạch huyệt răng dưới');
  vi = vi.replace(/anterior\s+superior\s+alveolar\s+artery/gi, 'Động mạch huyệt răng trên trước');
  vi = vi.replace(/middle\s+superior\s+alveolar\s+artery/gi, 'Động mạch huyệt răng trên giữa');
  vi = vi.replace(/posterior\s+superior\s+alveolar\s+artery/gi, 'Động mạch huyệt răng trên sau');
  vi = vi.replace(/supra[- ]?orbital\s+artery/gi, 'Động mạch trên ổ mắt');
  vi = vi.replace(/infra[- ]?orbital\s+artery/gi, 'Động mạch dưới ổ mắt');
  vi = vi.replace(/supratrochlear\s+artery/gi, 'Động mạch trên ròng rọc');
  vi = vi.replace(/lacrimal\s+artery/gi, 'Động mạch lệ');
  vi = vi.replace(/ophthalmic\s+artery/gi, 'Động mạch mắt');
  vi = vi.replace(/transverse\s+facial\s+artery/gi, 'Động mạch ngang mặt');
  vi = vi.replace(/angular\s+artery/gi, 'Động mạch góc');
  vi = vi.replace(/obturator\s+artery/gi, 'Động mạch bịt');
  vi = vi.replace(/internal\s+pudendal\s+artery/gi, 'Động mạch thẹn trong');
  vi = vi.replace(/external\s+pudendal\s+artery/gi, 'Động mạch thẹn ngoài');
  vi = vi.replace(/perineal\s+artery/gi, 'Động mạch đáy chậu');

  vi = vi.replace(/\bthoraco[- ]?acromial\b/gi, 'ngực - cùng vai');
  vi = vi.replace(/\bsuprascapular\b/gi, 'trên vai');
  vi = vi.replace(/\bthoracodorsal\b/gi, 'ngực - lưng');
  vi = vi.replace(/\bsubscapular\b/gi, 'dưới vai');
  vi = vi.replace(/\bsubmental\b/gi, 'dưới cằm');
  vi = vi.replace(/\bsublingual\b/gi, 'dưới lưỡi');
  vi = vi.replace(/\bmental\b/gi, 'cằm');
  vi = vi.replace(/\balveolar\b/gi, 'huyệt răng');
  vi = vi.replace(/\bpalatine\b/gi, 'khẩu cái');
  vi = vi.replace(/\bsphenopalatine\b/gi, 'bướm - khẩu cái');
  vi = vi.replace(/\bnasopalatine\b/gi, 'mũi - khẩu cái');
  vi = vi.replace(/\bsupra[- ]?orbital\b/gi, 'trên ổ mắt');
  vi = vi.replace(/\binfra[- ]?orbital\b/gi, 'dưới ổ mắt');
  vi = vi.replace(/\bsupratrochlear\b/gi, 'trên ròng rọc');
  vi = vi.replace(/\binfratrochlear\b/gi, 'dưới ròng rọc');
  vi = vi.replace(/\blacrimal\b/gi, 'lệ');
  vi = vi.replace(/\binterosseous\b/gi, 'gian cốt');
  vi = vi.replace(/\bperforating\b/gi, 'xuyên');
  vi = vi.replace(/\bcarotid\b/gi, 'cảnh');
  vi = vi.replace(/\bbasilar\b/gi, 'nền');
  vi = vi.replace(/\bacromial\b/gi, 'cùng vai');
  vi = vi.replace(/\bobturator\b/gi, 'bịt');
  vi = vi.replace(/\bpudendal\b/gi, 'thẹn');

  vi = vi.replace(/\bartery\b/gi, 'Động mạch');
  vi = vi.replace(/\barteries\b/gi, 'Các động mạch');
  vi = vi.replace(/\bvein\b/gi, 'Tĩnh mạch');
  vi = vi.replace(/\bveins\b/gi, 'Các tĩnh mạch');
  vi = vi.replace(/\bnerve\b/gi, 'Thần kinh');
  vi = vi.replace(/\bnerves\b/gi, 'Các thần kinh');
  vi = vi.replace(/\bmuscle\b/gi, 'Cơ');
  vi = vi.replace(/\bmuscles\b/gi, 'Các cơ');
  vi = vi.replace(/\bligament\b/gi, 'Dây chằng');
  vi = vi.replace(/\bligaments\b/gi, 'Các dây chằng');
  vi = vi.replace(/\btendon\b/gi, 'Gân');
  vi = vi.replace(/\btendons\b/gi, 'Các gân');
  vi = vi.replace(/\bbone\b/gi, 'Xương');
  vi = vi.replace(/\bbones\b/gi, 'Các xương');
  vi = vi.replace(/\bcartilage\b/gi, 'Sụn');

  vi = vi.replace(/\binferior\b/gi, 'dưới');
  vi = vi.replace(/\bsuperior\b/gi, 'trên');
  vi = vi.replace(/\banterior\b/gi, 'trước');
  vi = vi.replace(/\bposterior\b/gi, 'sau');
  vi = vi.replace(/\bmedial\b/gi, 'trong');
  vi = vi.replace(/\blateral\b/gi, 'ngoài');
  vi = vi.replace(/\bascending\b/gi, 'lên');
  vi = vi.replace(/\bdescending\b/gi, 'xuống');
  vi = vi.replace(/\bsuperficial\b/gi, 'nông');
  vi = vi.replace(/\bdeep\b/gi, 'sâu');
  vi = vi.replace(/\binternal\b/gi, 'trong');
  vi = vi.replace(/\bexternal\b/gi, 'ngoài');
  vi = vi.replace(/\bsupreme\b/gi, 'trên cùng');
  vi = vi.replace(/\bhighest\b/gi, 'cao nhất');
  vi = vi.replace(/\baccessory\b/gi, 'phụ');
  vi = vi.replace(/\bproper\b/gi, 'riêng');
  vi = vi.replace(/\bmain\b/gi, 'chính');
  vi = vi.replace(/\bdeepest\b/gi, 'sâu nhất');

  return vi;
}

function translateToLatinMedical(name) {
  if (!name) return '';
  const raw = name.trim();
  const low = raw.toLowerCase();

  // 1. Direct Latin database lookup
  if (anatomyData && anatomyData.latin) {
    if (anatomyData.latin[raw]) return anatomyData.latin[raw];
    if (anatomyData._lowerLatin && anatomyData._lowerLatin[low]) return anatomyData._lowerLatin[low];
  }

  // 2. Clinical dictionary lookup
  if (MEDICAL_TRANSLATIONS[low] && MEDICAL_TRANSLATIONS[low].latin) {
    return MEDICAL_TRANSLATIONS[low].latin;
  }

  // 3. Fallback regex transformations
  let lat = raw;
  lat = lat.replace(/\bartery\b/gi, 'Arteria');
  lat = lat.replace(/\barteries\b/gi, 'Arteriae');
  lat = lat.replace(/\bvein\b/gi, 'Vena');
  lat = lat.replace(/\bveins\b/gi, 'Venae');
  lat = lat.replace(/\bnerve\b/gi, 'Nervus');
  lat = lat.replace(/\bnerves\b/gi, 'Nervi');
  lat = lat.replace(/\bmuscle\b/gi, 'Musculus');
  lat = lat.replace(/\bmuscles\b/gi, 'Musculi');
  lat = lat.replace(/\bligament\b/gi, 'Ligamentum');
  lat = lat.replace(/\bligaments\b/gi, 'Ligamenta');
  return lat;
}

function getCeliacStructureInfo(meshName, landmarkId) {
  if (!meshName) return { vi: 'Cấu trúc giải phẫu', latin: 'Structura anatomica', en: '', desc: '' };
  const raw = meshName.trim();
  const low = raw.toLowerCase();

  // 1. Direct dictionary match
  if (MEDICAL_TRANSLATIONS[low]) {
    const d = MEDICAL_TRANSLATIONS[low];
    return {
      vi: d.vi,
      latin: d.latin || raw,
      en: d.en || raw,
      desc: d.desc || 'Cấu trúc giải phẫu tầng trên mạc treo đại tràng ngang.',
      landmarkId: d.landmarkId || landmarkId || null
    };
  }

  // 2. Partial substring search in medical dictionary
  for (let k in MEDICAL_TRANSLATIONS) {
    if (low.includes(k)) {
      const d = MEDICAL_TRANSLATIONS[k];
      return {
        vi: d.vi,
        latin: d.latin || raw,
        en: d.en || raw,
        desc: d.desc || 'Cấu trúc giải phẫu tầng trên mạc treo đại tràng ngang.',
        landmarkId: d.landmarkId || landmarkId || null
      };
    }
  }

  // 3. Algorithmic translation fallback
  const vi = translateToVietnameseMedical(raw);
  const latin = translateToLatinMedical(raw);
  return {
    vi: vi,
    latin: latin,
    en: raw,
    desc: 'Cấu trúc giải phẫu thuộc hệ thống mạch máu và tạng tầng trên mạc treo đại tràng ngang.',
    landmarkId: landmarkId || null
  };
}

function loadModelFile(file) {
  return Promise.resolve();
}

// Classify Meshes into 12 Systems, Layers, and Medical Materials with Strict Medical Accuracy
function setupMesh(mesh, sourceFile) {
  const rawName = mesh.name || "";
  let cleanName = rawName.split('.')[0].trim();
  cleanName = cleanName.replace(/_/g, ' ').replace(/\s+\d+$/, '').trim();
  
  // Clean trailing isolated ' l' or ' r'
  if (/\s+[lr]$/i.test(cleanName)) {
    cleanName = cleanName.replace(/\s+[lr]$/i, '').trim();
  } else if (/[a-zA-Z]{3,}[lr]$/i.test(cleanName)) {
    // If three.js sanitized without space (e.g. "Parietal bonel" -> "Parietal bone")
    const cand = cleanName.slice(0, -1).trim();
    if (anatomyData.translations && (anatomyData.translations[cand] || anatomyData._lowerTranslations?.[cand.toLowerCase()])) {
      cleanName = cand;
    }
  }

  const nameLower = cleanName.toLowerCase();
  const anyMatch = (str, arr) => arr.some(k => str.includes(k));

  // Fix outlier scaling (e.g. Pleura in visceral.glb) and stray nodes
  if (nameLower.includes('pleura') || mesh.scale.x > 2.0) {
    mesh.scale.set(1, 1, 1);
  }
  if (mesh.position.y < -0.8 || mesh.position.y > 2.6 || Math.abs(mesh.position.x) > 2.0) {
    mesh.visible = false;
  }

  // Fix clipping issue where gastric arteries appear inside the stomach
  if (nameLower.includes('gastric artery') || nameLower.includes('gastro-omental')) {
    mesh.position.z += 0.025; // Push them forward onto the stomach surface
  }
  if (nameLower === 'stomach') {
    mesh.position.z -= 0.01; // Push stomach slightly back to prevent swallowing anterior vessels
  }

  let targetSystem = 'skeletal';
  let matConfig = PALETTE.bone;
  let muscleLayer = 3;
  let vesselLayer = 1;

  // Brain ventricles (Cerebrospinal fluid cavities -> Nervous system)
  if (nameLower.includes('fourth ventricle') || nameLower.includes('third ventricle') || nameLower.includes('lateral ventricle')) {
    targetSystem = 'nervous';
    matConfig = { color: 0x93c5fd, roughness: 0.3, transparent: true, opacity: 0.6 };
  }
  // 1. SKELETAL
  else if (sourceFile.includes('skeleton')) {
    targetSystem = 'skeletal';
    if (nameLower.includes('cartilage') || nameLower.includes('cartilago') || nameLower.includes('costal') || nameLower.includes('nasal') || nameLower.includes('thyroid cartilage')) {
      matConfig = PALETTE.cartilage;
    } else if (nameLower.includes('tooth') || nameLower.includes('teeth') || nameLower.includes('incisor') || nameLower.includes('canine') || nameLower.includes('molar')) {
      matConfig = PALETTE.teeth;
    } else {
      matConfig = PALETTE.bone;
    }
  } 
  // 2. CONNECTIVE / JOINTS
  else if (sourceFile.includes('joints') || (sourceFile.includes('muscles') && (nameLower.includes('ligament') || nameLower.includes('articular disc') || nameLower.includes('articular capsule') || nameLower.includes('labrum')) && !nameLower.includes('inguinal'))) {
    targetSystem = 'connective';
    if (nameLower.includes('meniscus') || nameLower.includes('disc') || nameLower.includes('discus')) {
      matConfig = PALETTE.meniscus;
    } else {
      matConfig = PALETTE.ligament;
    }
  } 
  // 3. PULMONARY VEINS (Venous System, but Oxygenated Blood -> RED in Complete Anatomy & Medical Atlases)
  else if (nameLower.includes('pulmonary vein')) {
    targetSystem = 'venous';
    vesselLayer = 1;
    matConfig = PALETTE.artery; // Distinct physiological RED
  }
  // 4. PULMONARY ARTERIES & TRUNK (Arterial System, but Deoxygenated Blood -> BLUE in Complete Anatomy & Medical Atlases)
  else if (nameLower.includes('pulmonary artery') || nameLower.includes('pulmonary trunk')) {
    targetSystem = 'arterial';
    vesselLayer = 1;
    matConfig = PALETTE.vein; // Distinct physiological BLUE
  }
  // 5. REGULAR VEINS (Exact Anatomical 5-Layer Spec)
  else if (!nameLower.includes('brachiocephalic trunk') && !nameLower.includes('nerve') && (nameLower.includes('vein') || nameLower.includes('vena') || nameLower.includes('venous') || (nameLower.includes('sinus') && !nameLower.includes('nasal') && !nameLower.includes('frontal') && !nameLower.includes('maxillary') && !nameLower.includes('sphenoid')) || nameLower.includes('jugular') || nameLower.includes('saphenous') || nameLower.includes('cephalic vein') || nameLower.includes('basilic vein') || nameLower.includes('cubital'))) {
    targetSystem = 'venous';
    matConfig = PALETTE.vein; // Royal Cobalt Blue

    const isAxillaryV = nameLower.includes('axillary') && !nameLower.includes('maxillary');
    const isMinorBranchV = anyMatch(nameLower, ['periosteal', 'perforat', 'cutaneous']);
    const isDeepBranchV = anyMatch(nameLower, ['deep femoral', 'profunda femoris']);
    const isArchOrDigitalV = anyMatch(nameLower, ['palmar', 'plantar', 'digital']);
    const isThoracoOrSuperficialEpigastric = anyMatch(nameLower, ['thoracoepigastric', 'superficial epigastric']);

    // Layer 1: Thân tĩnh mạch trung tâm & Trục sâu chính (Lớp gốc)
    // Trung thất & Tim: SVC, IVC, Brachiocephalic veins, Pulmonary veins, Cardiac veins, Coronary sinus
    // Đầu cổ: Internal jugular
    // Trục chậu & Đùi: Common iliac, External iliac, Femoral vein (main)
    // Trục chi trên: Subclavian, Axillary
    if (!isMinorBranchV && !isDeepBranchV && !isArchOrDigitalV && (
        anyMatch(nameLower, [
            'cava', 'cardiac vein', 'coronary sinus', 'pulmonary vein',
            'brachiocephalic vein',
            'internal jugular',
            'common iliac', 'external iliac',
            'femoral vein',
            'subclavian vein'
        ]) || isAxillaryV
    )) {
      if (nameLower.includes('internal iliac') || nameLower.includes('deep femoral') || nameLower.includes('profunda femoris')) {
        vesselLayer = 2;
      } else {
        vesselLayer = 1;
      }
    }
    // Layer 2: Trục tĩnh mạch tạng bụng, thành ngực & Sâu ở cẳng chân/tay
    // Ổ bụng & Tạng: Hepatic portal, Hepatic veins, Renal, Splenic, SMV (superior mesenteric), Internal iliac
    // Thành ngực sâu: Azygos, Hemiazygos
    // Chi: Deep femoral (profunda femoris), Popliteal vein, Brachial veins
    else if (anyMatch(nameLower, [
        'portal', 'hepatic vein', 'renal vein', 'splenic vein',
        'superior mesenteric', 'internal iliac',
        'azygos', 'hemiazygos',
        'deep femoral', 'profunda femoris', 'popliteal vein', 'brachial vein'
    ])) {
      vesselLayer = 2;
    }
    // Layer 3: Hệ thống tĩnh mạch nông lớn & Nhánh tạng thứ cấp
    // Tĩnh mạch nông chi dưới: Great saphenous, Small saphenous
    // Tĩnh mạch nông chi trên: Cephalic, Basilic, Median cubital
    // Đầu mặt cổ: External jugular, Facial vein, Retromandibular
    // Ổ bụng & Chậu: IMV (inferior mesenteric), Gonadal (testicular, ovarian), Gluteal
    // Cẳng tay & Cẳng chân: Anterior tibial, Posterior tibial, Radial veins, Ulnar veins
    else if (anyMatch(nameLower, [
        'saphenous', 'cephalic', 'basilic', 'cubital',
        'external jugular', 'facial vein', 'retromandibular',
        'inferior mesenteric', 'gonadal', 'testicular', 'ovarian', 'gluteal vein',
        'anterior tibial', 'posterior tibial', 'radial vein', 'ulnar vein'
    ])) {
      vesselLayer = 3;
    }
    // Layer 4: Đám rối tĩnh mạch, Mạch liên lạc & Nhánh cơ
    // Đầu mặt sọ: Pterygoid venous plexus, Anterior jugular, Superficial temporal
    // Hệ thần kinh & Màng não: Dural venous sinuses (Superior sagittal, Transverse, Sigmoid, etc.)
    // Chậu & Thành ngực: Đám rối bàng quang/tiền liệt/tử cung (plexus), Intercostal, Internal thoracic
    // Bàn tay & Bàn chân: Deep palmar venous arch, Plantar venous arch, Fibular / peroneal
    // Mạch nối: Perforating veins
    else if (!isThoracoOrSuperficialEpigastric && !anyMatch(nameLower, ['dorsal venous', 'network of hand', 'digital']) && anyMatch(nameLower, [
        'pterygoid', 'anterior jugular', 'temporal vein',
        'sinus', 'plexus',
        'intercostal vein', 'internal thoracic vein',
        'deep palmar', 'plantar venous', 'fibular vein', 'peroneal vein',
        'perforat'
    ])) {
      vesselLayer = 4;
    }
    // Layer 5: Mạng lưới tĩnh mạch nông mu, ngón & Dưới da toàn thân
    // Bàn tay/ngón: Dorsal venous network of hand, Intermetacarpal, Digital veins
    // Bàn chân/ngón: Dorsal venous arch of foot, Digital veins of foot, Plantar superficial
    // Thành bụng & ngực: Thoracoepigastric, Superficial epigastric
    // Dưới da ngoại vi: vi tĩnh mạch, mao mạch
    else {
      vesselLayer = 5;
    }
  }
  // 6. HEART CHAMBERS & MYOCARDIUM (In Arterial view: semi-transparent so coronary arteries & aorta shine through)
  else if ((nameLower.includes('atrium') || nameLower.includes('ventricle') || nameLower.includes('papillary muscle')) && !nameLower.includes('artery') && !nameLower.includes('vein')) {
    targetSystem = 'arterial';
    vesselLayer = 1;
    matConfig = { color: 0x6e0d0d, roughness: 0.28, metalness: 0.02, transparent: true, opacity: 0.65 };
  }
  // 6.5 NERVES IN CARDIO & MEDIASTINUM (Ensure nerves, ganglia, plexuses are not misclassified as arterial trunk)
  else if (nameLower.includes('nerve') || nameLower.includes('plexus') || nameLower.includes('ganglion') || nameLower.includes('spinal cord') || nameLower.includes('sympathetic trunk')) {
    targetSystem = 'nervous';
    matConfig = PALETTE.nerve;
  }
  // 7. ARTERIES & HEART (Anatomical 5-Layer Spec)
  else if (nameLower.includes('arter') || nameLower.includes('aort') || nameLower.includes('brachiocephalic trunk') || nameLower.includes('coeliac trunk') || nameLower.includes('celiac trunk') || nameLower.includes('anastomosis') || (nameLower.includes('arch') && (nameLower.includes('palmar') || nameLower.includes('plantar') || nameLower.includes('aortic'))) || (nameLower.includes('trunk') && (nameLower.includes('costocervical') || nameLower.includes('thyrocervical'))) || nameLower.includes('heart') || nameLower.includes('myocard') || nameLower.includes('mitral') || nameLower.includes('tricuspid') || nameLower.includes('trabeculae carneae') || nameLower.includes('sinu-atrial') || nameLower.includes('atrioventricular') || (nameLower.includes('valve') && (nameLower.includes('pulmonary') || nameLower.includes('aortic') || nameLower.includes('cardiac') || nameLower.includes('semilunar')))) {
    targetSystem = 'arterial';
    const isHeartValv = nameLower.includes('valve') || nameLower.includes('leaflet') || nameLower.includes('mitral') || nameLower.includes('tricuspid') || nameLower.includes('trabecula');
    matConfig = isHeartValv ? { color: 0xe2e8f0, roughness: 0.3 } : PALETTE.artery; // Vivid Arterial Red

    const isMinorBranchA = anyMatch(nameLower, ['periosteal', 'perforat', 'cutaneous', 'muscular branch']);
    const isDeepBranchA = anyMatch(nameLower, ['profunda', 'deep brachial', 'deep femoral', 'interosseous']);
    const isArchOrDigitalA = anyMatch(nameLower, ['palmar', 'plantar', 'digital']);
    const isEpigastricA = nameLower.includes('epigastric');
    const isGastricA = nameLower.includes('gastric') && !isEpigastricA;
    const isAxillaryA = nameLower.includes('axillary') && !nameLower.includes('maxillary');

    // Layer 1: Thân động mạch chính & Trục dẫn máu lớn (Lớp gốc)
    // Tim & Trung thất: Ascending aorta, Aortic arch, Brachiocephalic trunk/artery, Pulmonary trunk & arteries
    // Đầu cổ: Common carotid
    // Thân mình & Chậu: Thoracic aorta, Abdominal aorta, Common iliac, External iliac
    // Chi trên: Subclavian, Axillary, Brachial, Radial, Ulnar
    // Chi dưới: Femoral, Popliteal, Anterior tibial, Posterior tibial
    if (isHeartValv || (!isMinorBranchA && !isDeepBranchA && !isArchOrDigitalA && (
        anyMatch(nameLower, [
            'ascending aorta', 'aortic arch', 'brachiocephalic', 'pulmonary trunk', 'pulmonary artery',
            'thoracic aorta', 'abdominal aorta', 'aorta',
            'common carotid',
            'common iliac', 'external iliac',
            'subclavian', 'brachial artery', 'radial artery', 'ulnar artery',
            'femoral artery', 'popliteal artery', 'anterior tibial', 'posterior tibial'
        ]) || isAxillaryA
    ))) {
      if (nameLower.includes('internal iliac') || nameLower.includes('internal carotid') || nameLower.includes('external carotid')) {
        vesselLayer = 2;
      } else if (nameLower.includes('arch') && !nameLower.includes('aortic')) {
        vesselLayer = 3;
      } else {
        vesselLayer = 1;
      }
    }
    // Layer 2: Các nhánh tạng lớn & Nhánh bên chính ở các chi
    // Đầu cổ: Internal carotid, External carotid, Vertebral
    // Bụng & Chậu: Celiac trunk, Splenic, Common hepatic, Left gastric, SMA, IMA, Renal, Gonadal, Internal iliac
    // Chi trên & Chi dưới: Deep brachial, Interosseous, Deep femoral / Profunda femoris, Fibular, Internal thoracic, Posterior intercostal
    else if (isGastricA || anyMatch(nameLower, [
        'internal carotid', 'external carotid', 'vertebral',
        'celiac', 'coeliac', 'splenic', 'hepatic',
        'mesenteric', 'renal', 'gonadal', 'testicular', 'ovarian',
        'internal iliac',
        'deep brachial', 'profunda brachii', 'interosseous',
        'deep femoral', 'profunda femoris', 'fibular', 'peroneal',
        'internal thoracic', 'posterior intercostal', 'intercostal', 'coronary'
    ])) {
      vesselLayer = 2;
    }
    // Layer 3: Nhánh phân phối vùng & Các vòng nối lớn
    // Đầu mặt cổ: Facial, Maxillary, Superior thyroid, Lingual, Cerebral arterial circle (Willis), Basilar
    // Ổ bụng & Ống tiêu hóa: Jejunal, Ileal, Ileocolic, Colic, Superior rectal, Cystic, Pancreaticoduodenal
    // Vùng chậu: Superior/Inferior gluteal, Obturator, Internal pudendal, Uterine, Vesical
    // Bàn tay & Bàn chân: Superficial/Deep palmar arch, Dorsalis pedis, Plantar arch, Genicular anastomoses, Circumflex
    else if (anyMatch(nameLower, [
        'facial', 'maxillary', 'thyroid', 'lingual', 'pharyngeal',
        'cerebral', 'communicating artery', 'basilar', 'ophthalmic',
        'jejunal', 'ileal', 'ileocolic', 'colic', 'rectal', 'cystic', 'pancreatic',
        'gluteal', 'obturator', 'pudendal', 'uterine', 'vesical',
        'palmar arch', 'dorsalis pedis', 'plantar arch', 'genicular', 'circumflex'
    ])) {
      vesselLayer = 3;
    }
    // Layer 4: Động mạch nuôi cơ, mô liên kết & Nhánh tận ngón
    // Đầu mặt: Superficial temporal, Occipital, Angular, Labial
    // Bàn tay & Bàn chân: Common palmar digital, Dorsal metacarpal, Medial/Lateral plantar, Common plantar digital
    // Thành ngực - bụng & Cột sống: Phrenic, Superior/Inferior epigastric, Radicular, Spinal, Lumbar, Muscular
    else if (isEpigastricA || anyMatch(nameLower, [
        'temporal', 'occipital', 'angular', 'labial', 'auricular',
        'common palmar digital', 'metacarpal', 'plantar artery', 'common plantar digital',
        'phrenic', 'radicular', 'spinal', 'lumbar', 'muscular'
    ])) {
      vesselLayer = 4;
    }
    // Layer 5: Mạng lưới vi mạch tận cùng & Nhánh xuyên nông (Lớp đầy đủ nhất)
    // Proper palmar digital, Proper plantar digital, Cutaneous perforators, Periosteal, vi mạch
    else {
      vesselLayer = 5;
    }
  }
  // 8. RESPIRATORY (Lungs, Trachea, Bronchi, Larynx, Epiglottis, Pleura)
  else if (nameLower.includes('lung') || nameLower.includes('pulmo') || nameLower.includes('bronch') || nameLower.includes('trachea') || nameLower.includes('larynx') || nameLower.includes('epiglottis') || nameLower.includes('pleura')) {
    targetSystem = 'respiratory';
    matConfig = (nameLower.includes('trachea') || nameLower.includes('bronch')) ? PALETTE.bronch : PALETTE.lung;
  }
  // 9. DIGESTIVE (Stomach, Liver, Gallbladder, Pancreas, Intestines, Colon, Esophagus, Mouth, Tongue)
  else if (nameLower.includes('stomach') || nameLower.includes('liver') || nameLower.includes('gallbladder') || nameLower.includes('bile') || nameLower.includes('pancreas') || nameLower.includes('pancreatic') || nameLower.includes('colon') || nameLower.includes('intestine') || nameLower.includes('duodenum') || nameLower.includes('jejunum') || nameLower.includes('ileum') || nameLower.includes('rectum') || nameLower.includes('appendix') || nameLower.includes('caecum') || nameLower.includes('oesophagus') || nameLower.includes('esophagus') || nameLower.includes('tongue') || nameLower.includes('palate') || nameLower.includes('pharynx') || nameLower.includes('parotid') || nameLower.includes('sublingual') || nameLower.includes('submandibular') || nameLower.includes('gingiva') || nameLower.includes('taenia')) {
    targetSystem = 'digestive';
    if (nameLower.includes('liver')) matConfig = PALETTE.liver;
    else if (nameLower.includes('gallbladder') || nameLower.includes('bile')) matConfig = PALETTE.gallbladder;
    else if (nameLower.includes('pancreas')) matConfig = PALETTE.pancreas;
    else if (nameLower.includes('colon') || nameLower.includes('appendix')) matConfig = PALETTE.largeIntestine;
    else if (nameLower.includes('intestine') || nameLower.includes('duodenum') || nameLower.includes('jejunum')) matConfig = PALETTE.smallIntestine;
    else matConfig = PALETTE.stomach;
  }
  // 10. UROGENITAL (Kidneys, Ureters, Bladder, Urethra, Penis, Testes, Prostate, Ovaries, Uterus)
  else if (nameLower.includes('kidney') || nameLower.includes('renal') || nameLower.includes('ureter') || nameLower.includes('bladder') || nameLower.includes('urethra') || nameLower.includes('penis') || nameLower.includes('testis') || nameLower.includes('testicle') || nameLower.includes('scrotum') || nameLower.includes('epididymis') || nameLower.includes('prostate') || nameLower.includes('seminal') || nameLower.includes('ductus deferens') || nameLower.includes('ejaculatory') || nameLower.includes('ovary') || nameLower.includes('uterus') || nameLower.includes('vagina')) {
    targetSystem = 'urogenital';
    matConfig = nameLower.includes('kidney') ? PALETTE.kidney : PALETTE.bladder;
  }
  // 11. ENDOCRINE (Thyroid, Parathyroid, Adrenal, Pineal, Pituitary)
  else if (nameLower.includes('thyroid') || nameLower.includes('parathyroid') || nameLower.includes('suprarenal') || nameLower.includes('adrenal') || nameLower.includes('pineal') || nameLower.includes('pituitary') || nameLower.includes('hypophysis')) {
    targetSystem = 'endocrine';
    matConfig = nameLower.includes('thyroid') ? PALETTE.thyroid : PALETTE.adrenal;
  }
  // 12. LYMPHATIC (Spleen, Lymph nodes, Omentum, Mesentery)
  else if (nameLower.includes('spleen') || nameLower.includes('lymph') || nameLower.includes('cisterna chyli') || nameLower.includes('thoracic duct') || nameLower.includes('omentum') || nameLower.includes('meso-appendix') || nameLower.includes('mesocolon')) {
    targetSystem = 'lymphatic';
    matConfig = PALETTE.spleen;
  }
  // 13. NERVOUS / SENSORY (Brain, Brainstem, Spinal Cord, Nerves, Eye, Ear, models/nervous.glb)
  else if (sourceFile.includes('nervous') || nameLower.includes('nerve') || nameLower.includes('plexus') || nameLower.includes('ganglion') || nameLower.includes('cerebr') || nameLower.includes('cerebell') || nameLower.includes('brain') || nameLower.includes('cortex') || nameLower.includes('gyrus') || nameLower.includes('sulcus') || nameLower.includes('pons') || nameLower.includes('medulla') || nameLower.includes('olive') || nameLower.includes('pyramid') || nameLower.includes('nucleus') || nameLower.includes('colliculus') || nameLower.includes('thalamus') || nameLower.includes('spinal cord') || nameLower.includes('eyeball') || nameLower.includes('retina') || nameLower.includes('cornea') || nameLower.includes('sclera') || nameLower.includes('iris') || nameLower.includes('lens') || nameLower.includes('vitreous') || nameLower.includes('cochlea') || nameLower.includes('tympanic')) {
    targetSystem = 'nervous';
    if (anyMatch(nameLower, ['cerebrum', 'cortex', 'gyrus', 'sulcus', 'hemisphere', 'lobe'])) {
      matConfig = PALETTE.cerebrum;
    } else if (nameLower.includes('cerebellum')) {
      matConfig = PALETTE.cerebellum;
    } else if (anyMatch(nameLower, ['pons', 'medulla', 'pyramid', 'olive', 'brainstem', 'spinal cord', 'peduncle', 'vermis', 'fossa', 'nuclei'])) {
      matConfig = PALETTE.brainstem;
    } else {
      matConfig = PALETTE.nerve;
    }
  }
  // 14. MUSCULAR (Muscles, Tendons, Aponeuroses, Fasciae - 8 Layers Hierarchy)
  else if (sourceFile.includes('muscles') || nameLower.includes('muscle') || nameLower.includes('fascia') || nameLower.includes('tendon') || nameLower.includes('aponeurosis')) {
    targetSystem = 'muscular';

    // Layer 8: Lớp cơ bám da nông nhất (Superficial / Cutaneous Muscles)
    // Cổ: Cơ bám da cổ (Platysma).
    // Mặt: Các cơ biểu cảm nông nằm sát da (Cơ hạ góc miệng, Cơ nâng môi trên, Cơ cau mày, Cơ mút đoạn nông, Cơ mũi, Cơ cằm, Cơ hạ môi dưới...)
    // Bàn tay: Cơ gan tay ngắn (Palmaris brevis).
    if (anyMatch(nameLower, [
      'platysma', 'palmaris brevis',
      'depressor anguli oris', 'levator labii', 'corrugator supercilii', 'depressor supercilii',
      'buccinator', 'bucinator', 'nasalis', 'mentalis', 'depressor labii',
      'risorius', 'procerus', 'depressor septi', 'auricularis', 'levator anguli oris',
      'levator nasolabialis', 'subcutaneous bursa', 'subcutaneous acromial',
      'subcutaneous calcaneal', 'subcutaneous infrapatellar', 'subcutaneous prepatellar',
      'subcutaneous trochanteric', 'superficial investing cervical', 'superficial layer of temporal'
    ])) {
      muscleLayer = 8;
    }
    // Layer 7: Các khối cơ nông bao phủ ngoài cùng & Cân mạc nông
    // Lưng & Cổ: Cơ thang (Trapezius), Cơ lưng rộng (Latissimus dorsi), Cơ ức đòn chũm (Sternocleidomastoid).
    // Ngực & Vai: Cơ ngực lớn (Pectoralis major), Cơ delta (Deltoid).
    // Mông: Cơ mông lớn (Gluteus maximus).
    // Đầu mặt: Cơ vòng miệng (Orbicularis oris), Cơ vòng mi (Orbicularis oculi), Cơ gò má lớn/bé (Zygomaticus major/minor), Cơ trán-chẩm (Occipitofrontalis).
    else if (anyMatch(nameLower, [
      'trapezius', 'latissimus dorsi', 'sternocleidomastoid',
      'pectoralis major', 'deltoid',
      'gluteus maximus',
      'orbicularis oris', 'orbicularis oculi', 'zygomaticus',
      'occipitofrontalis', 'frontalis', 'occipitalis', 'epicranius', 'epicranial aponeurosis', 'galea aponeurotica',
      'temporoparietalis',
      'fascia lata', 'crural fascia', 'brachial fascia', 'antebrachial fascia', 'pectoral fascia', 'popliteal fascia', 'dorsal fascia',
      'subfacial prepatellar', 'subtendinous prepatellar', 'subtendinous calcaneal'
    ])) {
      muscleLayer = 7;
    }
    // Layer 6: Các cơ vận động lớn ở bề mặt (Bắt đầu phủ toàn diện)
    // Thành bụng: Cơ thẳng bụng (Rectus abdominis), Cơ chéo bụng ngoài (External abdominal oblique), Pyramidalis, Linea alba.
    // Chi trên: Cơ nhị đầu cánh tay (Biceps brachii), Đầu dài cơ tam đầu (Long head of triceps),
    //           Cơ sấp tròn (Pronator teres), Cơ gấp cổ tay quay (Flexor carpi radialis), Cơ gấp cổ tay trụ (Flexor carpi ulnaris),
    //           Cơ gan tay dài (Palmaris longus), Cân gan tay (Palmar aponeurosis).
    // Chi dưới: Cơ thẳng đùi (Rectus femoris), Cơ may (Sartorius), Cơ căng mạc đùi (Tensor fasciae latae),
    //           Cơ bụng chân (Gastrocnemius - 2 đầu trong và ngoài), Gân gót (Calcaneal tendon), Dải chậu chày (Iliotibial tract), Cân gan chân (Plantar aponeurosis), Cơ gan chân (Plantaris).
    // Đầu mặt: Các cơ nhai chính: Cơ cắn (Masseter), Cơ thái dương (Temporalis).
    else if (anyMatch(nameLower, [
      'rectus abdominis', 'obliquus externus', 'external abdominal oblique', 'external oblique', 'pyramidalis', 'linea alba', 'inguinal ligament',
      'biceps brachii', 'long head of triceps', 'triceps brachii long head',
      'pronator teres', 'flexor carpi radialis', 'flexor carpi ulnaris', 'palmaris longus', 'palmar aponeurosis',
      'rectus femoris', 'sartorius', 'tensor fasciae', 'gastrocnemius', 'calcaneal tendon', 'achilles', 'iliotibial tract', 'plantar aponeurosis',
      'masseter', 'temporalis', 'plantaris',
      'extensor retinaculum', 'flexor retinaculum', 'fibular retinaculum', 'patellar retinaculum',
      'posterior layer of thoracolumbar fascia'
    ])) {
      muscleLayer = 6;
    }
    // Layer 5: Lớp cơ trung - nông & Cơ vận động chính các chi
    // Lưng & Vai: Cơ trám lớn (Rhomboid major), Cơ trám bé (Rhomboid minor), Cơ nâng vai (Levator scapulae), Cơ răng sau trên/dưới (Serratus posterior superior/inferior).
    // Chi trên: Cơ cánh tay (Brachialis), Đầu trong & đầu ngoài của cơ tam đầu (Triceps brachii - medial & lateral heads), Anconeus,
    //           Cơ cánh tay quay (Brachioradialis), Cơ duỗi cổ tay quay dài/ngắn (Extensor carpi radialis longus/brevis),
    //           Cơ duỗi cổ tay trụ (Extensor carpi ulnaris), Cơ duỗi các ngón (Extensor digitorum), Cơ duỗi ngón út (Extensor digiti minimi).
    // Chi dưới: Cơ khép dài (Adductor longus), Cơ thon (Gracilis), Cơ lược (Pectineus),
    //           Nhóm Hamstrings: Cơ bán gân (Semitendinosus), Cơ bán màng (Semimembranosus), Cơ nhị đầu đùi (Biceps femoris),
    //           Cơ mác dài (Fibularis longus / Peroneus longus), Fibularis tertius.
    // Cổ nông trung gian: Cơ hai thân (Digastric), Cơ trâm móng (Stylohyoid), Cơ vai móng (Omohyoid), Cơ ức móng (Sternohyoid).
    else if (
      (nameLower.includes('extensor digitorum') && !anyMatch(nameLower, ['longus', 'brevis'])) ||
      (nameLower.includes('brachialis') && !nameLower.includes('coracobrachialis')) ||
      anyMatch(nameLower, [
        'rhomboid', 'levator scapulae', 'serratus posterior',
        'triceps', 'anconeus',
        'brachioradialis', 'extensor carpi radialis', 'extensor carpi ulnaris', 'extensor digiti minimi',
        'adductor longus', 'gracilis', 'pectineus',
        'semitendinosus', 'semimembranosus', 'biceps femoris',
        'fibularis longus', 'peroneus longus', 'fibularis tertius',
        'digastric', 'stylohyoid', 'omohyoid', 'sternohyoid',
        'intermuscular septum', 'tendon sheath', 'synovial sheath', 'fibrous sheath'
      ])
    ) {
      muscleLayer = 5;
    }
    // Layer 4: Khối cơ trung gian của chi & Thành cơ bụng trong
    // Cổ & Đầu: Cơ gối đầu (Splenius capitis), Cơ gối cổ (Splenius cervicis), Các cơ bậc thang (Scalene muscles: trước, giữa, sau),
    //           Cơ dài đầu (Longus capitis), Cơ dài cổ (Longus colli), Cơ dưới đòn (Subclavius), Cơ ức giáp (Sternothyroid), Cơ giáp móng (Thyrohyoid).
    // Thành bụng: Cơ chéo bụng trong (Internal abdominal oblique).
    // Chi trên: Cơ gấp nông các ngón tay (Flexor digitorum superficialis), Cơ tròn lớn (Teres major), Cơ ngực bé (Pectoralis minor), Cơ răng trước (Serratus anterior).
    // Chi dưới: Nhóm cơ khép: Cơ khép lớn (Adductor magnus), Cơ khép ngắn (Adductor brevis), Cơ khép bé (Adductor minimus);
    //           Cơ mông nhỡ (Gluteus medius), Cơ mông bé (Gluteus minimus);
    //           Cơ rộng trong (Vastus medialis), Cơ rộng ngoài (Vastus lateralis), Cơ rộng giữa (Vastus intermedius);
    //           Cơ mác ngắn (Fibularis brevis / Peroneus brevis), Cơ dép (Soleus).
    // Cơ nhai sâu: Cơ chân bướm trong/ngoài (Medial & Lateral pterygoid).
    else if (anyMatch(nameLower, [
      'splenius', 'scalenus', 'scalene',
      'longus capitis', 'longus colli', 'subclavius', 'sternothyroid', 'thyrohyoid',
      'obliquus internus', 'internal abdominal oblique', 'internal oblique',
      'flexor digitorum superficialis', 'teres major', 'pectoralis minor', 'serratus anterior',
      'adductor magnus', 'adductor brevis', 'adductor minimus',
      'gluteus medius', 'gluteus minimus',
      'vastus medialis', 'vastus lateralis', 'vastus intermedius',
      'fibularis brevis', 'peroneus brevis', 'soleus',
      'pterygoid',
      'middle layer of thoracolumbar fascia', 'investing abdominal fascia'
    ])) {
      muscleLayer = 4;
    }
    // Layer 3: Cơ dựng sống & Lớp sâu cẳng tay / cẳng chân
    // Cột sống: Hệ cơ dựng sống (Erector spinae): Cơ gai (Spinalis), Cơ dài (Longissimus), Cơ chậu sườn (Iliocostalis).
    // Lồng ngực: Cơ gian sườn trong cùng (Innermost intercostals), Cơ gian sườn trong (Internal intercostals), Cơ gian sườn ngoài (External intercostals).
    // Chi trên: Cơ trên gai (Supraspinatus), Cơ dưới gai (Infraspinatus), Cơ tròn bé (Teres minor),
    //           Cơ gấp sâu các ngón tay (Flexor digitorum profundus), Cơ duỗi dài ngón cái (Extensor pollicis longus), Cơ giạng dài ngón cái (Abductor pollicis longus),
    //           Cơ duỗi ngắn ngón cái (Extensor pollicis brevis), Cơ gấp dài ngón cái (Flexor pollicis longus), Cơ duỗi ngón trỏ (Extensor indicis), Cơ ngửa (Supinator).
    // Chi dưới: Cơ chày trước (Anterior tibialis / Tibialis anterior), Cơ duỗi dài các ngón chân (Extensor digitorum longus), Cơ duỗi dài ngón cái (Extensor hallucis longus),
    //           Cơ duỗi ngắn ngón cái (Extensor hallucis brevis), Cơ duỗi ngắn các ngón chân (Extensor digitorum brevis).
    // Bàn tay & Bàn chân: Flexor digitorum brevis, Abductor hallucis, Abductor digiti minimi, Quadratus plantae, Lumbrical.
    // Cơ nhãn cầu & Hầu họng: Superior/Inferior/Medial/Lateral rectus, Superior/Inferior oblique, Levator palpebrae, Pharyngeal constrictors.
    else if (
      nameLower.includes('erector spinae') || nameLower.includes('longissimus') || nameLower.includes('iliocostalis') ||
      (nameLower.includes('spinalis') && !nameLower.includes('semispinalis') && !nameLower.includes('interspinal')) ||
      anyMatch(nameLower, [
        'intercostal', 'subcostal',
        'supraspinatus', 'infraspinatus', 'teres minor',
        'flexor digitorum profundus', 'extensor pollicis longus', 'abductor pollicis longus',
        'extensor pollicis brevis', 'flexor pollicis longus', 'extensor indicis', 'supinator',
        'tibialis anterior', 'anterior tibialis', 'extensor digitorum longus', 'extensor hallucis longus',
        'extensor hallucis brevis', 'extensor digitorum brevis',
        'flexor digitorum brevis', 'abductor hallucis', 'abductor digiti minimi', 'quadratus plantae', 'lumbrical',
        'rectus bulbi', 'superior rectus', 'inferior rectus', 'medial rectus', 'lateral rectus',
        'superior oblique', 'inferior oblique', 'levator palpebrae', 'trochlea of superior oblique',
        'pharyngeal constrictor', 'palatopharyngeus', 'stylopharyngeus',
        'tarsus', 'common tendinous ring', 'subacromial bursa', 'deep infrapatellar', 'suprapatellar bursa',
        'bicipitoradial bursa', 'coracobrachial bursa', 'anserine bursa', 'intermuscular gluteal'
      ])
    ) {
      muscleLayer = 3;
    }
    // Layer 2: Cơ sâu thành thân mình & Lớp sâu các chi
    // Cột sống & Lưng: Cơ nhiều chân (Multifidus), Cơ bán gai (Semispinalis capitis, cervicis, thoracis).
    // Thành bụng & Chậu: Cơ ngang bụng (Transversus abdominis), Cơ vuông thắt lưng (Quadratus lumborum),
    //                   Cơ thắt lưng chậu (Psoas major, Psoas minor, Iliacus), Cơ hình lê (Piriformis),
    //                   Cơ vuông đùi (Quadratus femoris), Cơ hoành chậu hông (Levator ani, Coccygeus, Pubo-analis, Anal sphincter).
    // Chi trên: Cơ dưới vai (Subscapularis), Cơ quạ cánh tay (Coracobrachialis), Cơ sấp vuông (Pronator quadratus).
    // Chi dưới: Cơ khoeo (Popliteus), Cơ chày sau (Posterior tibialis / Tibialis posterior),
    //           Cơ gấp dài ngón cái (Flexor hallucis longus), Cơ gấp dài các ngón chân (Flexor digitorum longus).
    // Cơ sàn miệng & thanh quản sâu: Mylohyoid, Geniohyoid, Genioglossus, Hyoglossus, Cricothyroid, Crico-arytenoid, Arytenoid, Thyro-arytenoid.
    // Bàn tay & Chân sâu: Adductor pollicis, Flexor pollicis brevis, Opponens pollicis, Abductor pollicis brevis, Adductor hallucis, Flexor hallucis brevis, Opponens digiti minimi, Flexor digiti minimi.
    else if (anyMatch(nameLower, [
      'multifidus', 'semispinalis',
      'transversus abdominis', 'quadratus lumborum', 'psoas', 'iliacus', 'iliopsoas',
      'piriformis', 'quadratus femoris', 'levator ani', 'coccygeus', 'pubo-analis', 'anal sphincter',
      'subscapularis', 'coracobrachialis', 'pronator quadratus',
      'popliteus', 'tibialis posterior', 'posterior tibialis',
      'flexor hallucis longus', 'flexor digitorum longus',
      'mylohyoid', 'geniohyoid', 'genioglossus', 'hyoglossus',
      'cricothyroid', 'crico-arytenoid', 'arytenoid', 'thyro-arytenoid',
      'adductor pollicis', 'flexor pollicis brevis', 'opponens pollicis', 'abductor pollicis brevis',
      'adductor hallucis', 'flexor hallucis brevis', 'opponens digiti minimi', 'flexor digiti minimi',
      'transversalis fascia', 'anterior layer of thoracolumbar fascia', 'iliopectineal arch', 'iliopectineal bursa'
    ])) {
      muscleLayer = 2;
    }
    // Layer 1: Cơ sâu nhất áp sát màng xương & Ụ khớp (Deepest / Intrinsic Stabilization)
    // Cột sống & Cổ sâu: Cơ quay (Rotatores), Cơ gian gai (Interspinales), Cơ gian mỏm ngang (Intertransversarii),
    //                    Các cơ dưới chẩm (Suboccipital: Rectus posterior major/minor capitis, Obliquus inferior/superior capitis, Rectus anterior/lateralis capitis).
    // Lồng ngực & Bụng: Cơ hoành (Diaphragm - phần bám xương), Cơ ngang ngực (Transversus thoracis), Cơ nâng sườn (Levatores costarum - breves & longi).
    // Khớp háng & Khớp vai: Cơ bịt ngoài (Obturator externus), Cơ bịt trong (Obturator internus), Các cơ sinh đôi trên/dưới (Gemelli - Superior/Inferior gemellus).
    // Bàn tay & Bàn chân: Toàn bộ các cơ gian cốt mu tay/chân và gian cốt gan tay/chân (Interossei - Dorsal/Palmar/Plantar interossei).
    else if (anyMatch(nameLower, [
      'rotator', 'interspinal', 'intertransversari',
      'rectus capitis posterior', 'obliquus capitis', 'suboccipital',
      'rectus posterior major capitis', 'rectus posterior minor capitis', 'obliquus inferior capitis', 'obliquus superior capitis',
      'rectus anterior capitis', 'rectus lateralis capitis',
      'diaphragm', 'transversus thoracis', 'levator cost', 'levatores costarum', 'levatores breves', 'levatores longi',
      'obturator externus', 'obturator internus', 'obturator',
      'gemellus', 'gemelli',
      'interossei', 'interosseus'
    ])) {
      muscleLayer = 1;
    }
    // Fallback: Intermediate layer
    else {
      muscleLayer = 4;
    }

    if (nameLower.includes('tendon') || nameLower.includes('aponeurosis') || nameLower.includes('retinaculum') || nameLower.includes('linea alba') || nameLower.includes('tendo') || nameLower.includes('tractus') || nameLower.includes('iliotibial')) {
      matConfig = PALETTE.tendon;
    } else if (targetSystem === 'muscular') {
      matConfig = PALETTE.muscle;
    }
  } 
  // 15. FALLBACK / INTEGUMENTARY
  else {
    targetSystem = 'integumentary';
    matConfig = PALETTE.integumentary;
  }

  // Resolve Vietnamese Translation
  let viName = cleanName;
  const noParens = cleanName.replace(/^\(|\)$/g, '').trim();
  const withParens = `(${noParens})`;
  const lowClean = cleanName.toLowerCase().trim();
  const lowNoParens = noParens.toLowerCase().trim();

  if (anatomyData.translations) {
    if (anatomyData.translations[cleanName]) {
      viName = anatomyData.translations[cleanName];
    } else if (anatomyData.translations[noParens]) {
      viName = anatomyData.translations[noParens];
    } else if (anatomyData.translations[withParens]) {
      viName = anatomyData.translations[withParens];
    } else if (anatomyData._lowerTranslations) {
      if (anatomyData._lowerTranslations[lowClean]) {
        viName = anatomyData._lowerTranslations[lowClean];
      } else if (anatomyData._lowerTranslations[lowNoParens]) {
        viName = anatomyData._lowerTranslations[lowNoParens];
      }
    }
  }

  if (viName === cleanName) {
    for (let key in anatomyData.clinical) {
      if (nameLower.includes(key.toLowerCase())) {
        viName = anatomyData.clinical[key].vi;
        break;
      }
    }
  }

  // Fallback to comprehensive medical translation engine
  if (viName === cleanName) {
    viName = translateToVietnameseMedical(cleanName);
  }

  // Resolve Latin Name
  let latinName = cleanName;
  if (anatomyData.latin) {
    if (anatomyData.latin[cleanName]) {
      latinName = anatomyData.latin[cleanName];
    } else if (anatomyData.latin[noParens]) {
      latinName = anatomyData.latin[noParens];
    } else if (anatomyData._lowerLatin) {
      if (anatomyData._lowerLatin[lowClean]) {
        latinName = anatomyData._lowerLatin[lowClean];
      } else if (anatomyData._lowerLatin[lowNoParens]) {
        latinName = anatomyData._lowerLatin[lowNoParens];
      }
    }
  }

  if (latinName === cleanName) {
    for (let key in anatomyData.clinical) {
      if (nameLower.includes(key.toLowerCase())) {
        latinName = anatomyData.clinical[key].latin;
        break;
      }
    }
  }
  if (latinName === cleanName) {
    latinName = translateToLatinMedical(cleanName);
  }

  // Store metadata
  mesh.userData = {
    cleanName: cleanName,
    viName: viName,
    latinName: latinName,
    enName: cleanName,
    system: targetSystem,
    muscleLayer: muscleLayer,
    vesselLayer: vesselLayer,
    originalColor: matConfig.color,
    originalRoughness: matConfig.roughness,
    originalMetalness: matConfig.metalness || 0.0,
    isHidden: false,
    isXRay: false
  };

  mesh.material = new THREE.MeshStandardMaterial({
    color: matConfig.color,
    roughness: matConfig.roughness,
    metalness: matConfig.metalness || 0.0,
    transparent: matConfig.transparent || false,
    opacity: matConfig.opacity !== undefined ? matConfig.opacity : 1.0,
    depthWrite: true,
    emissive: matConfig.emissive || 0x000000,
    emissiveIntensity: matConfig.emissive ? 0.35 : 0.0
  });
}

function anyMatch(str, arr) {
  return arr.some(k => str.includes(k));
}

// Raycasting Mouse Events
function setupEvents() {
  const container = document.getElementById('webgl-container');
  const tooltip = document.getElementById('hover-tooltip');
  const tooltipTitle = document.getElementById('hover-tooltip-title');
  const tooltipSub = document.getElementById('hover-tooltip-sub');

  container.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -((e.clientY) / (window.innerHeight - 68)) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const visibleMeshes = allMeshes.filter(m => m.visible && !m.userData.isHidden);
    const intersects = raycaster.intersectObjects(visibleMeshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hoveredMesh !== hit) {
        if (hoveredMesh && hoveredMesh !== selectedMesh) {
          unhighlightMesh(hoveredMesh);
        }
        hoveredMesh = hit;
        highlightMesh(hoveredMesh);
      }

      tooltip.style.display = 'block';
      tooltip.style.left = (e.clientX + 14) + 'px';
      tooltip.style.top = (e.clientY + 14) + 'px';
      tooltipTitle.textContent = hoveredMesh.userData.viName || hoveredMesh.userData.cleanName;
      tooltipSub.textContent = hoveredMesh.userData.latinName || hoveredMesh.userData.enName;
    } else {
      if (hoveredMesh && hoveredMesh !== selectedMesh) {
        unhighlightMesh(hoveredMesh);
      }
      hoveredMesh = null;
      tooltip.style.display = 'none';
    }
  });

  container.addEventListener('click', (e) => {
    raycaster.setFromCamera(mouse, camera);
    const visibleMeshes = allMeshes.filter(m => m.visible && !m.userData.isHidden);
    const intersects = raycaster.intersectObjects(visibleMeshes);

    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object;
      selectOrgan(clickedMesh);
      if (isStudyMode) {
        if (!isMeshInStudy(clickedMesh)) {
          addMeshToStudy(clickedMesh);
        } else {
          const idx = studyList.findIndex(s => s.cleanName.toLowerCase() === clickedMesh.userData.cleanName.toLowerCase());
          if (idx >= 0) goToStudyItem(idx);
        }
      }
    } else {
      closeInspector();
    }
  });
}

function highlightMesh(mesh) {
  if (mesh === selectedMesh) return;
  mesh.material.emissive.setHex(0x38bdf8);
  mesh.material.emissiveIntensity = 0.35;
}

function unhighlightMesh(mesh) {
  if (mesh === selectedMesh) return;
  const origEmissive = (mesh.userData.system === 'nervous' && !mesh.userData.cleanName.toLowerCase().includes('brain')) ? 0x2c2200 : 0x000000;
  mesh.material.emissive.setHex(origEmissive);
  mesh.material.emissiveIntensity = origEmissive ? 0.35 : 0.0;
}

// ========================================================
// 3D SILHOUETTE OUTLINE BORDER SYSTEM (INVERTED HULL)
// Dual Modes: Classic (Như Cũ - Default) & Glow Outline (Phát Sáng)
// ========================================================
let activeOutlines = [];
let isGlowOutlineMode = false;
try {
  const savedGlowMode = localStorage.getItem('anatovi_glow_mode');
  if (savedGlowMode === 'glow') {
    isGlowOutlineMode = true;
  }
} catch (e) {}

function setHighlightMode(enableGlow) {
  isGlowOutlineMode = !!enableGlow;
  try {
    localStorage.setItem('anatovi_glow_mode', isGlowOutlineMode ? 'glow' : 'classic');
  } catch (e) {}
  updateHighlightModeUI();

  if (selectedMesh) {
    if (isGlowOutlineMode) {
      const relations = getVascularRelations(selectedMesh);
      applyVesselTreeOutlines(selectedMesh, relations);
    } else {
      clearAllOutlines();
    }
  }
}

function toggleHighlightMode() {
  setHighlightMode(!isGlowOutlineMode);
}

function updateHighlightModeUI() {
  const btnTop = document.getElementById('btn-highlight-mode');
  const txtTop = document.getElementById('txt-highlight-mode');
  const iconTop = document.getElementById('icon-highlight-mode');
  const btnClassic = document.getElementById('insp-mode-classic');
  const btnGlow = document.getElementById('insp-mode-glow');

  if (isGlowOutlineMode) {
    if (btnTop) {
      btnTop.classList.add('active');
      btnTop.title = 'Chế độ xem: Phát Sáng (Click để chuyển sang Như Cũ)';
    }
    if (txtTop) txtTop.textContent = 'Phát Sáng ✨';
    if (iconTop) iconTop.className = 'fa-solid fa-wand-magic-sparkles';
    if (btnClassic) btnClassic.classList.remove('active');
    if (btnGlow) btnGlow.classList.add('active');
  } else {
    if (btnTop) {
      btnTop.classList.remove('active');
      btnTop.title = 'Chế độ xem: Như Cũ (Click để chuyển sang Phát Sáng)';
    }
    if (txtTop) txtTop.textContent = 'Như Cũ';
    if (iconTop) iconTop.className = 'fa-solid fa-palette';
    if (btnClassic) btnClassic.classList.add('active');
    if (btnGlow) btnGlow.classList.remove('active');
  }
}

function escapeJsStr(str) {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function createOutlineMesh(mesh, colorHex = 0x00f0ff, thickness = 0.0035, opacity = 0.85) {
  if (!mesh || !mesh.geometry) return null;

  if (!mesh.geometry.attributes.normal) {
    mesh.geometry.computeVertexNormals();
  }

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      outlineColor: { value: new THREE.Color(colorHex) },
      outlineThickness: { value: thickness },
      opacityVal: { value: opacity },
      timeVal: { value: 0.0 }
    },
    vertexShader: [
      'uniform float outlineThickness;',
      'uniform float timeVal;',
      'void main() {',
      '  float pulse = 1.0 + 0.16 * sin(timeVal * 4.0);',
      '  vec3 extruded = position + normal * (outlineThickness * pulse);',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(extruded, 1.0);',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 outlineColor;',
      'uniform float opacityVal;',
      'uniform float timeVal;',
      'void main() {',
      '  float glow = 0.88 + 0.12 * sin(timeVal * 5.0);',
      '  gl_FragColor = vec4(outlineColor * glow, opacityVal);',
      '}'
    ].join('\n'),
    side: THREE.BackSide,
    depthTest: true,
    depthWrite: false,
    transparent: true,
    blending: THREE.NormalBlending
  });

  const outlineMesh = new THREE.Mesh(mesh.geometry, mat);
  outlineMesh.raycast = () => {};
  outlineMesh.renderOrder = 999;
  mesh.add(outlineMesh);
  activeOutlines.push({ outlineMesh, parentMesh: mesh, material: mat });
  return outlineMesh;
}

function clearAllOutlines() {
  activeOutlines.forEach(item => {
    if (item.parentMesh && item.outlineMesh) {
      item.parentMesh.remove(item.outlineMesh);
    }
    if (item.material) {
      item.material.dispose();
    }
  });
  activeOutlines = [];
}

function updateOutlinesAnimation() {
  if (activeOutlines.length === 0) return;
  const t = performance.now() * 0.001;
  activeOutlines.forEach(item => {
    if (item.material && item.material.uniforms && item.material.uniforms.timeVal) {
      item.material.uniforms.timeVal.value = t;
    }
  });
}

// ========================================================
// VASCULAR TREE GRAPH & ANATOMICAL HIERARCHY
// ========================================================
const VASCULAR_TREE_GRAPH = {
  // Aorta & Main Trunks
  'ascending aorta': { parent: 'heart', branches: ['right coronary artery', 'left coronary artery'] },
  'arch of aorta': { parent: 'ascending aorta', branches: ['brachiocephalic trunk', 'left common carotid artery', 'left subclavian artery'] },
  'thoracic aorta': { parent: 'arch of aorta', branches: ['posterior intercostal', 'bronchial artery', 'esophageal branch', 'superior phrenic artery'] },
  'abdominal aorta': { parent: 'thoracic aorta', branches: ['celiac trunk', 'superior mesenteric artery', 'inferior mesenteric artery', 'renal artery', 'common iliac artery', 'inferior phrenic artery', 'lumbar artery'] },
  'brachiocephalic trunk': { parent: 'arch of aorta', branches: ['right common carotid artery', 'right subclavian artery'] },

  // Head & Neck
  'common carotid artery': { parent: 'brachiocephalic trunk', branches: ['external carotid artery', 'internal carotid artery'] },
  'left common carotid artery': { parent: 'arch of aorta', branches: ['external carotid artery', 'internal carotid artery'] },
  'right common carotid artery': { parent: 'brachiocephalic trunk', branches: ['external carotid artery', 'internal carotid artery'] },
  'external carotid artery': { parent: 'common carotid artery', branches: ['superior thyroid artery', 'ascending pharyngeal artery', 'lingual artery', 'facial artery', 'occipital artery', 'posterior auricular artery', 'maxillary artery', 'superficial temporal artery'] },
  'maxillary artery': { parent: 'external carotid artery', branches: ['middle meningeal artery', 'inferior alveolar artery', 'infra-orbital artery', 'sphenopalatine artery'] },
  'facial artery': { parent: 'external carotid artery', branches: ['superior labial artery', 'inferior labial artery', 'angular artery', 'submental artery'] },
  'internal carotid artery': { parent: 'common carotid artery', branches: ['ophthalmic artery', 'anterior cerebral artery', 'middle cerebral artery', 'posterior communicating artery', 'anterior choroidal artery'] },
  'vertebral artery': { parent: 'subclavian artery', branches: ['anterior spinal artery', 'posterior inferior cerebellar artery', 'basilar artery'] },
  'basilar artery': { parent: 'vertebral artery', branches: ['posterior cerebral artery', 'superior cerebellar artery', 'anterior inferior cerebellar artery', 'pontine branches', 'labyrinthine artery'] },

  // Upper Limb & Shoulder
  'subclavian artery': { parent: 'brachiocephalic trunk', branches: ['vertebral artery', 'internal thoracic artery', 'thyrocervical trunk', 'costocervical trunk', 'dorsal scapular artery', 'transverse cervical artery', 'deep branch of transverse cervical artery', 'axillary artery'] },
  'left subclavian artery': { parent: 'arch of aorta', branches: ['vertebral artery', 'internal thoracic artery', 'thyrocervical trunk', 'costocervical trunk', 'dorsal scapular artery', 'transverse cervical artery', 'deep branch of transverse cervical artery', 'axillary artery'] },
  'right subclavian artery': { parent: 'brachiocephalic trunk', branches: ['vertebral artery', 'internal thoracic artery', 'thyrocervical trunk', 'costocervical trunk', 'dorsal scapular artery', 'transverse cervical artery', 'deep branch of transverse cervical artery', 'axillary artery'] },
  'thyrocervical trunk': { parent: 'subclavian artery', branches: ['inferior thyroid artery', 'suprascapular artery', 'transverse cervical artery'] },
  'transverse cervical artery': { parent: 'thyrocervical trunk', branches: ['deep branch of transverse cervical artery', 'superficial branch of transverse cervical artery', 'dorsal scapular artery'] },
  'deep branch of transverse cervical artery': { parent: 'transverse cervical artery', branches: ['suprascapular artery', 'circumflex scapular artery'] },
  'dorsal scapular artery': { parent: 'subclavian artery', branches: ['suprascapular artery', 'circumflex scapular artery'] },
  'suprascapular artery': { parent: 'thyrocervical trunk', branches: ['acromial branch of suprascapular artery', 'circumflex scapular artery'] },
  'axillary artery': { parent: 'subclavian artery', branches: ['superior thoracic artery', 'thoraco-acromial artery', 'lateral thoracic artery', 'subscapular artery', 'anterior circumflex humeral artery', 'posterior circumflex humeral artery', 'brachial artery'] },
  'thoraco-acromial artery': { parent: 'axillary artery', branches: ['pectoral branches of thoraco-acromial artery', 'acromial branch of thoraco-acromial artery', 'deltoid branch of thoraco-acromial artery', 'clavicular branch of thoraco-acromial artery'] },
  'subscapular artery': { parent: 'axillary artery', branches: ['circumflex scapular artery', 'thoracodorsal artery'] },
  'circumflex scapular artery': { parent: 'subscapular artery', branches: ['suprascapular artery', 'deep branch of transverse cervical artery'] },
  'thoracodorsal artery': { parent: 'subscapular artery', branches: ['lateral thoracic artery'] },
  'anterior circumflex humeral artery': { parent: 'axillary artery', branches: ['posterior circumflex humeral artery'] },
  'posterior circumflex humeral artery': { parent: 'axillary artery', branches: ['anterior circumflex humeral artery'] },
  'brachial artery': { parent: 'axillary artery', branches: ['deep brachial artery', 'superior ulnar collateral artery', 'inferior ulnar collateral artery', 'radial artery', 'ulnar artery'] },
  'deep brachial artery': { parent: 'brachial artery', branches: ['radial collateral artery', 'middle collateral artery'] },
  'radial artery': { parent: 'brachial artery', branches: ['radial recurrent artery', 'palmar carpal branch of radial artery', 'superficial palmar branch of radial artery', 'deep palmar arch', 'dorsal carpal branch of radial artery'] },
  'ulnar artery': { parent: 'brachial artery', branches: ['ulnar recurrent artery', 'common interosseous artery', 'dorsal carpal branch of ulnar artery', 'palmar carpal branch of ulnar artery', 'superficial palmar arch'] },
  'common interosseous artery': { parent: 'ulnar artery', branches: ['anterior interosseous artery', 'posterior interosseous artery', 'recurrent interosseous artery'] },

  // Abdomen & Visceral
  'celiac trunk': { parent: 'abdominal aorta', branches: ['left gastric artery', 'common hepatic artery', 'splenic artery'] },
  'left gastric artery': { parent: 'celiac trunk', branches: ['esophageal branches of left gastric artery'] },
  'common hepatic artery': { parent: 'celiac trunk', branches: ['proper hepatic artery', 'right gastric artery', 'gastroduodenal artery'] },
  'proper hepatic artery': { parent: 'common hepatic artery', branches: ['right hepatic artery', 'left hepatic artery', 'cystic artery'] },
  'gastroduodenal artery': { parent: 'common hepatic artery', branches: ['right gastro-omental artery', 'superior pancreaticoduodenal artery'] },
  'splenic artery': { parent: 'celiac trunk', branches: ['short gastric arteries', 'left gastro-omental artery', 'pancreatic branches of splenic artery', 'posterior gastric artery'] },
  'superior mesenteric artery': { parent: 'abdominal aorta', branches: ['inferior pancreaticoduodenal artery', 'jejunal arteries', 'ileal arteries', 'ileocolic artery', 'right colic artery', 'middle colic artery'] },
  'inferior mesenteric artery': { parent: 'abdominal aorta', branches: ['left colic artery', 'sigmoid arteries', 'superior rectal artery'] },
  'renal artery': { parent: 'abdominal aorta', branches: ['anterior branch of renal artery', 'inferior suprarenal artery', 'posterior branch of renal artery'] },

  // Pelvis & Lower Limb
  'common iliac artery': { parent: 'abdominal aorta', branches: ['internal iliac artery', 'external iliac artery'] },
  'internal iliac artery': { parent: 'common iliac artery', branches: ['anterior division of internal iliac artery', 'posterior division of internal iliac artery', 'superior gluteal artery', 'inferior gluteal artery', 'obturator artery', 'internal pudendal artery', 'uterine artery', 'middle rectal artery'] },
  'external iliac artery': { parent: 'common iliac artery', branches: ['inferior epigastric artery', 'deep circumflex iliac artery', 'femoral artery'] },
  'femoral artery': { parent: 'external iliac artery', branches: ['deep femoral artery', 'lateral circumflex femoral artery', 'medial circumflex femoral artery', 'perforating femoral arteries', 'popliteal artery', 'descending genicular artery'] },
  'deep femoral artery': { parent: 'femoral artery', branches: ['lateral circumflex femoral artery', 'medial circumflex femoral artery', 'descending branch of lateral circumflex femoral artery', 'perforating femoral arteries'] },
  'lateral circumflex femoral artery': { parent: 'deep femoral artery', branches: ['descending branch of lateral circumflex femoral artery', 'ascending branch of lateral circumflex femoral artery'] },
  'popliteal artery': { parent: 'femoral artery', branches: ['anterior tibial artery', 'posterior tibial artery', 'superior lateral genicular artery', 'superior medial genicular artery', 'inferior lateral genicular artery', 'inferior medial genicular artery'] },
  'anterior tibial artery': { parent: 'popliteal artery', branches: ['anterior tibial recurrent artery', 'dorsalis pedis artery', 'lateral malleolar artery', 'medial malleolar artery'] },
  'posterior tibial artery': { parent: 'popliteal artery', branches: ['fibular artery', 'calcaneal branches of posterior tibial artery', 'medial plantar artery', 'lateral plantar artery'] },
  'fibular artery': { parent: 'posterior tibial artery', branches: ['perforating branch of fibular artery', 'calcaneal branches of fibular artery'] },

  // Venous System
  'superior vena cava': { parent: 'heart', branches: ['left brachiocephalic vein', 'right brachiocephalic vein', 'azygos vein'] },
  'brachiocephalic vein': { parent: 'superior vena cava', branches: ['internal jugular vein', 'subclavian vein', 'vertebral vein', 'inferior thyroid vein'] },
  'internal jugular vein': { parent: 'brachiocephalic vein', branches: ['facial vein', 'lingual vein', 'superior thyroid vein'] },
  'subclavian vein': { parent: 'brachiocephalic vein', branches: ['axillary vein', 'external jugular vein'] },
  'axillary vein': { parent: 'subclavian vein', branches: ['brachial vein', 'cephalic vein', 'basilic vein', 'subscapular vein'] },
  'inferior vena cava': { parent: 'heart', branches: ['common iliac vein', 'hepatic veins', 'renal vein', 'inferior phrenic vein'] },
  'common iliac vein': { parent: 'inferior vena cava', branches: ['internal iliac vein', 'external iliac vein'] },
  'external iliac vein': { parent: 'common iliac vein', branches: ['femoral vein', 'inferior epigastric vein'] },
  'femoral vein': { parent: 'external iliac vein', branches: ['great saphenous vein', 'deep femoral vein', 'popliteal vein'] },
  'popliteal vein': { parent: 'femoral vein', branches: ['small saphenous vein', 'anterior tibial veins', 'posterior tibial veins', 'fibular veins'] },
  'hepatic portal vein': { parent: 'liver', branches: ['splenic vein', 'superior mesenteric vein', 'inferior mesenteric vein'] }
};

function isBloodVessel(mesh) {
  if (!mesh || !mesh.userData) return false;
  const sys = mesh.userData.system;
  if (sys === 'arterial' || sys === 'venous') return true;
  const clean = (mesh.userData.cleanName || '').toLowerCase();
  const vi = (mesh.userData.viName || '').toLowerCase();
  return /\b(artery|arteries|arteria|vein|veins|vena|aorta|cava|trunk|vessel|vasa)\b/i.test(clean) ||
         /động mạch|tĩnh mạch|mạch máu/i.test(vi);
}

function getVascularRelations(mesh) {
  if (!mesh || !mesh.userData || !isBloodVessel(mesh)) {
    return { isVessel: false, parent: null, branches: [] };
  }

  const rawName = (mesh.name || '').toLowerCase();
  const cleanName = (mesh.userData.cleanName || '').toLowerCase();
  const viName = (mesh.userData.viName || '').toLowerCase();

  let side = null;
  if (rawName.endsWith('.l') || rawName.endsWith('_l') || rawName.includes(' left') || cleanName.includes('left') || viName.includes('(trái)')) {
    side = 'left';
  } else if (rawName.endsWith('.r') || rawName.endsWith('_r') || rawName.includes(' right') || cleanName.includes('right') || viName.includes('(phải)')) {
    side = 'right';
  }

  let baseKey = cleanName.replace(/\b(left|right)\b/g, '').replace(/[()]/g, '').trim().replace(/\s+/g, ' ');

  let treeEntry = null;
  let matchedKey = null;

  function nameMatchesVessel(candidateName, targetPattern) {
    if (!candidateName || !targetPattern) return false;
    const c = candidateName.toLowerCase().trim();
    const p = targetPattern.toLowerCase().trim();
    if (c === p) return true;
    const escP = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp('\\b' + escP + '\\b', 'i').test(c)) return true;
    const escC = c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp('\\b' + escC + '\\b', 'i').test(p)) return true;
    return false;
  }

  for (const k in VASCULAR_TREE_GRAPH) {
    if (nameMatchesVessel(baseKey, k) || nameMatchesVessel(cleanName, k)) {
      if (!treeEntry || k.length > (matchedKey ? matchedKey.length : 0)) {
        treeEntry = VASCULAR_TREE_GRAPH[k];
        matchedKey = k;
      }
    }
  }

  let parentNamePattern = treeEntry ? treeEntry.parent : null;
  let branchNamePatterns = treeEntry ? [...treeEntry.branches] : [];

  const branchOfMatch = cleanName.match(/(?:branch|branches|tributary|tributaries) of (.+)/i);
  if (branchOfMatch) {
    const inferredParent = branchOfMatch[1].trim();
    if (!parentNamePattern || parentNamePattern === 'heart') {
      parentNamePattern = inferredParent;
    }
  }

  allMeshes.forEach(m => {
    if (m === mesh || !m.userData) return;
    const otherClean = (m.userData.cleanName || '').toLowerCase();
    if (otherClean.includes(`of ${baseKey}`) || otherClean.includes(`of ${cleanName}`)) {
      if (!branchNamePatterns.includes(otherClean)) {
        branchNamePatterns.push(otherClean);
      }
    }
  });

  function meshMatchesSide(m) {
    if (!side) return true;
    const mRaw = (m.name || '').toLowerCase();
    const mClean = (m.userData.cleanName || '').toLowerCase();
    const mVi = (m.userData.viName || '').toLowerCase();
    if (side === 'left') {
      return mRaw.endsWith('.l') || mRaw.endsWith('_l') || mRaw.includes(' left') || mClean.includes('left') || mVi.includes('(trái)');
    } else {
      return mRaw.endsWith('.r') || mRaw.endsWith('_r') || mRaw.includes(' right') || mClean.includes('right') || mVi.includes('(phải)');
    }
  }

  let parentObj = null;
  if (parentNamePattern && parentNamePattern !== 'heart' && parentNamePattern !== 'liver') {
    const parentCandidates = allMeshes.filter(m => {
      if (m === mesh || !m.userData) return false;
      const mClean = (m.userData.cleanName || '').toLowerCase();
      return nameMatchesVessel(mClean, parentNamePattern) && (side ? meshMatchesSide(m) : true);
    });

    if (parentCandidates.length > 0) {
      const pMesh = parentCandidates[0];
      parentObj = {
        mesh: pMesh,
        nameVi: pMesh.userData.viName || pMesh.userData.cleanName,
        nameEn: pMesh.userData.cleanName,
        nameLatin: pMesh.userData.latinName
      };
    }
  }

  const foundBranches = [];
  const seenMeshes = new Set([mesh]);

  branchNamePatterns.forEach(pattern => {
    const branchCandidates = allMeshes.filter(m => {
      if (seenMeshes.has(m) || !m.userData) return false;
      const mClean = (m.userData.cleanName || '').toLowerCase();
      return nameMatchesVessel(mClean, pattern) && (side ? meshMatchesSide(m) : true);
    });

    branchCandidates.forEach(bMesh => {
      if (!seenMeshes.has(bMesh)) {
        seenMeshes.add(bMesh);
        foundBranches.push({
          mesh: bMesh,
          nameVi: bMesh.userData.viName || bMesh.userData.cleanName,
          nameEn: bMesh.userData.cleanName,
          nameLatin: bMesh.userData.latinName
        });
      }
    });
  });

  return {
    isVessel: true,
    side: side,
    parent: parentObj,
    branches: foundBranches
  };
}

function applyVesselTreeOutlines(selectedMesh, relations) {
  clearAllOutlines();

  // 1. Primary Outline for selected mesh (Gold / Cyan)
  selectedMesh.visible = true;
  selectedMesh.userData.isHidden = false;
  const isNervous = selectedMesh.userData && selectedMesh.userData.system === 'nervous';
  const mainOutlineColor = isNervous ? 0x00f0ff : ((relations && relations.isVessel) ? 0x00f0ff : 0xfacc15);
  createOutlineMesh(selectedMesh, mainOutlineColor, 0.0038, 0.95);

  if (!relations || !relations.isVessel) return;

  // 2. Parent outline (Warm Amber)
  if (relations.parent && relations.parent.mesh) {
    relations.parent.mesh.visible = true;
    relations.parent.mesh.userData.isHidden = false;
    createOutlineMesh(relations.parent.mesh, 0xf59e0b, 0.0028, 0.70);
  }

  // 3. Branches outline (Sky Blue)
  if (relations.branches && relations.branches.length > 0) {
    relations.branches.forEach(b => {
      if (b.mesh) {
        b.mesh.visible = true;
        b.mesh.userData.isHidden = false;
        createOutlineMesh(b.mesh, 0x38bdf8, 0.0030, 0.85);
      }
    });
  }
}

function renderVascularCard(mesh, relations) {
  const card = document.getElementById('inspect-vascular-card');
  if (!card) return;

  if (!relations || !relations.isVessel || (!relations.parent && relations.branches.length === 0)) {
    card.style.display = 'none';
    return;
  }

  card.style.display = 'flex';

  const branchCountEl = document.getElementById('vascular-branch-count');
  if (branchCountEl) {
    branchCountEl.textContent = `${relations.branches.length} nhánh`;
  }

  // Parent origin
  const parentRow = document.getElementById('vascular-parent-row');
  const parentNode = document.getElementById('vascular-parent-node');
  if (relations.parent) {
    parentRow.style.display = 'flex';
    parentNode.innerHTML = `
      <div class="vascular-chip parent" onclick="selectVesselBranch('${escapeJsStr(relations.parent.nameEn)}')">
        <i class="fa-solid fa-arrow-up-long"></i>
        <div>
          <span style="font-weight: 700;">${relations.parent.nameVi}</span>
          <span class="vascular-chip-sub">${relations.parent.nameLatin || relations.parent.nameEn}</span>
        </div>
      </div>
    `;
  } else {
    parentRow.style.display = 'none';
    parentNode.innerHTML = '';
  }

  // Branches
  const branchesRow = document.getElementById('vascular-branches-row');
  const branchesNodes = document.getElementById('vascular-branches-nodes');
  if (relations.branches.length > 0) {
    branchesRow.style.display = 'flex';
    branchesNodes.innerHTML = relations.branches.map(b => `
      <div class="vascular-chip branch" onclick="selectVesselBranch('${escapeJsStr(b.nameEn)}')">
        <i class="fa-solid fa-code-branch" style="color: #38bdf8;"></i>
        <div>
          <span style="font-weight: 700;">${b.nameVi}</span>
          <span class="vascular-chip-sub">${b.nameLatin || b.nameEn}</span>
        </div>
      </div>
    `).join('');
  } else {
    branchesRow.style.display = 'none';
    branchesNodes.innerHTML = '<div style="font-size: 0.76rem; color: var(--text-muted); font-style: italic;">Là nhánh tận cùng hoặc tiểu nhánh.</div>';
  }
}

function selectVesselBranch(vesselCleanName) {
  const target = allMeshes.find(m => (m.userData.cleanName || '').toLowerCase() === vesselCleanName.toLowerCase());
  if (target) {
    target.visible = true;
    target.userData.isHidden = false;
    selectOrgan(target);
    focusSelected();
  }
}

function focusVascularTree() {
  if (!selectedMesh) return;
  const relations = getVascularRelations(selectedMesh);
  if (!relations || !relations.isVessel) return;

  const treeMeshes = new Set([selectedMesh]);
  if (relations.parent && relations.parent.mesh) treeMeshes.add(relations.parent.mesh);
  relations.branches.forEach(b => { if (b.mesh) treeMeshes.add(b.mesh); });

  allMeshes.forEach(m => {
    if (!treeMeshes.has(m)) {
      m.material.transparent = true;
      m.material.opacity = 0.12;
      m.material.depthWrite = false;
    } else {
      m.visible = true;
      m.userData.isHidden = false;
      m.material.transparent = false;
      m.material.opacity = 1.0;
      m.material.depthWrite = true;
    }
  });

  const combinedBox = new THREE.Box3();
  treeMeshes.forEach(m => {
    combinedBox.expandByObject(m);
  });
  const center = combinedBox.getCenter(new THREE.Vector3());
  const size = combinedBox.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let distance = maxDim / (2 * Math.tan(fov / 2));
  distance = Math.max(distance * 1.6, 0.5);

  const direction = camera.position.clone().sub(center).normalize();
  if (direction.lengthSq() < 0.001) direction.set(0, 0, 1);
  const newPos = center.clone().add(direction.multiplyScalar(distance));
  smoothMoveCamera(newPos, center);
}

function selectOrgan(mesh) {
  if (selectedMesh) {
    selectedMesh.material.color.setHex(selectedMesh.userData.originalColor);
    const origEmissive = (selectedMesh.userData.system === 'nervous') ? 0x2c2200 : 0x000000;
    selectedMesh.material.emissive.setHex(origEmissive);
    selectedMesh.material.emissiveIntensity = origEmissive ? 0.35 : 0.0;
  }

  selectedMesh = mesh;
  const isNerve = mesh.userData && mesh.userData.system === 'nervous';
  selectedMesh.material.color.setHex(isNerve ? 0x00f0ff : 0xfacc15); // Vivid electric cyan for nerves, gold for other organs
  selectedMesh.material.emissive.setHex(isNerve ? 0x0088ff : 0x5a4800);
  selectedMesh.material.emissiveIntensity = isNerve ? 0.85 : 0.55;

  // Resolve vascular relationships & render 3D silhouette outlines if in Glow mode
  const relations = getVascularRelations(mesh);
  if (isGlowOutlineMode) {
    applyVesselTreeOutlines(mesh, relations);
  } else {
    clearAllOutlines();
  }

  openInspector(mesh, relations);
}

function openInspector(mesh, relations = null) {
  const u = mesh.userData;
  const inspector = document.getElementById('inspector');
  const titleVi = document.getElementById('inspect-title-vi');
  const titleLatin = document.getElementById('inspect-title-latin');
  const titleEn = document.getElementById('inspect-title-en');
  const systemTag = document.getElementById('inspect-system');
  const descCard = document.getElementById('inspect-desc');

  titleVi.textContent = u.viName;
  titleLatin.textContent = u.latinName;
  titleEn.textContent = u.enName;

  const sys = SYSTEMS_CONFIG[u.system];
  const sysColors = {
    skeletal: '#e2d5a8',
    connective: '#38bdf8',
    muscular: '#f43f5e',
    arterial: '#ef4444',
    venous: '#3b82f6',
    cardiac: '#dc2626',
    nervous: '#f59e0b',
    respiratory: '#06b6d4',
    digestive: '#f97316',
    urinary: '#eab308',
    reproductive: '#a855f7',
    urogenital: '#a855f7',
    endocrine: '#8b5cf6',
    lymphatic: '#10b981',
    sensory: '#06b6d4',
    integumentary: '#ec4899'
  };
  const color = sysColors[u.system] || '#00d2ff';
  inspector.style.borderLeftColor = color;
  systemTag.style.color = color;
  systemTag.style.borderColor = `${color}44`;
  systemTag.style.backgroundColor = `${color}18`;
  systemTag.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${sys ? sys.viName : "Giải Phẫu"}`;

  let desc = u.desc || "Cấu trúc giải phẫu người theo chuẩn quốc tế Terminologia Anatomica (TA2).";
  const lowCleanName = (u.cleanName || '').toLowerCase().trim();
  // 1. Exact match in clinical
  for (let k in anatomyData.clinical) {
    if (lowCleanName === k.toLowerCase().trim()) {
      desc = anatomyData.clinical[k].desc;
      break;
    }
  }
  // 2. Word boundary match
  if (!u.desc || desc === "Cấu trúc giải phẫu người theo chuẩn quốc tế Terminologia Anatomica (TA2).") {
    for (let k in anatomyData.clinical) {
      const reg = new RegExp(`\\b${k.trim()}\\b`, 'i');
      if (reg.test(lowCleanName)) {
        desc = anatomyData.clinical[k].desc;
        break;
      }
    }
  }
  descCard.textContent = desc;

  // Render vascular navigation card
  if (!relations) {
    relations = getVascularRelations(mesh);
  }
  renderVascularCard(mesh, relations);

  updateInspectStudyButton();
  inspector.style.display = 'flex';
}

function closeInspector() {
  document.getElementById('inspector').style.display = 'none';
  if (selectedMesh) {
    selectedMesh.material.color.setHex(selectedMesh.userData.originalColor);
    const origEmissive = (selectedMesh.userData.system === 'nervous') ? 0x2c2200 : 0x000000;
    selectedMesh.material.emissive.setHex(origEmissive);
    selectedMesh.material.emissiveIntensity = origEmissive ? 0.35 : 0.0;
    selectedMesh = null;
  }
  clearAllOutlines();
  const vasCard = document.getElementById('inspect-vascular-card');
  if (vasCard) vasCard.style.display = 'none';
}

function isolateSelected() {
  if (!selectedMesh) return;
  allMeshes.forEach(m => {
    if (m !== selectedMesh) {
      m.visible = false;
    }
  });
  focusSelected();
}

function hideSelected() {
  if (!selectedMesh) return;
  selectedMesh.visible = false;
  selectedMesh.userData.isHidden = true;
  closeInspector();
}

function xraySelected() {
  if (!selectedMesh) return;
  allMeshes.forEach(m => {
    if (m !== selectedMesh) {
      m.material.transparent = true;
      m.material.opacity = 0.12;
      m.material.depthWrite = false;
    }
  });
}

function focusSelected() {
  if (!selectedMesh) return;
  const box = new THREE.Box3().setFromObject(selectedMesh);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let distance = maxDim / (2 * Math.tan(fov / 2));
  distance = Math.max(distance * 1.8, 0.45);

  const direction = camera.position.clone().sub(center).normalize();
  if (direction.lengthSq() < 0.001) direction.set(0, 0, 1);
  const newPos = center.clone().add(direction.multiplyScalar(distance));
  smoothMoveCamera(newPos, center);
}

// BodyParts3D 15 Systems Bottom Bar Interactions
function toggleSystem(sysKey) {
  const sys = SYSTEMS_CONFIG[sysKey];
  if (!sys) return;

  sys.active = !sys.active;
  sys.statusText = sys.active ? 'Bật' : 'Tắt';

  // Support composite urogenital toggle
  if (sysKey === 'urogenital') {
    if (SYSTEMS_CONFIG.urinary) {
      SYSTEMS_CONFIG.urinary.active = sys.active;
      SYSTEMS_CONFIG.urinary.statusText = sys.statusText;
    }
    if (SYSTEMS_CONFIG.reproductive) {
      SYSTEMS_CONFIG.reproductive.active = sys.active;
      SYSTEMS_CONFIG.reproductive.statusText = sys.statusText;
    }
  }

  updateBottomBarUI();
  updatePanelSteppersUI();
  applyAllSystemsVisibility();
}

// Muscular System: Toggle & Stepper (0..8)
function toggleMuscularSystem() {
  const sys = SYSTEMS_CONFIG.muscular;
  if (sys.active) {
    sys.active = false;
    sys.statusText = 'Tắt';
  } else {
    sys.active = true;
    sys.statusText = 'Bật';
  }

  updateBottomBarUI();
  updatePanelSteppersUI();
  applyAllSystemsVisibility();
}

function stepMuscularLayer(delta) {
  const sys = SYSTEMS_CONFIG.muscular;
  sys.active = !sys.active;
  sys.statusText = sys.active ? 'Bật' : 'Tắt';

  updateBottomBarUI();
  updatePanelSteppersUI();
  applyAllSystemsVisibility();
}

// Arterial System: Toggle & Stepper
function toggleArterialSystem() {
  const sys = SYSTEMS_CONFIG.arterial;
  if (sys.active) {
    sys.active = false;
    sys.statusText = 'Tắt';
  } else {
    sys.active = true;
    sys.statusText = 'Bật';
    if (SYSTEMS_CONFIG.cardiac) SYSTEMS_CONFIG.cardiac.active = true;
  }

  updateBottomBarUI();
  updatePanelSteppersUI();
  applyAllSystemsVisibility();
}

function stepArterialLayer(delta) {
  toggleArterialSystem();
}

// Venous System: Toggle & Stepper
function toggleVenousSystem() {
  const sys = SYSTEMS_CONFIG.venous;
  if (sys.active) {
    sys.active = false;
    sys.statusText = 'Tắt';
  } else {
    sys.active = true;
    sys.statusText = 'Bật';
  }

  updateBottomBarUI();
  updatePanelSteppersUI();
  applyAllSystemsVisibility();
}

function stepVenousLayer(delta) {
  toggleVenousSystem();
}


// ========================================================
// GLOBAL DISSECTION LAYER SLIDER & PANEL (1 to 6)
// ========================================================
function setDissectionLevel(val) {
  const level = parseInt(val);
  globalDissectionLevel = level;

  const slider = document.getElementById('global-layer-slider');
  if (slider) slider.value = level;

  const levelNames = {
    1: 'Lớp 1: Khung Xương (Bone)',
    2: 'Lớp 2: Khớp & Dây Chằng',
    3: 'Lớp 3: Cơ Sâu & Nội Tạng',
    4: 'Lớp 4: Mạch & Thần Kinh',
    5: 'Lớp 5: Cơ Bắp Bán Nông',
    6: 'Lớp 6: Toàn Bộ Cơ Thể (Full)'
  };

  const currentTitle = levelNames[level] || `Lớp ${level}`;

  const label = document.getElementById('layer-active-name');
  if (label) label.textContent = currentTitle;

  const pillText = document.getElementById('pill-layer-text');
  if (pillText) pillText.textContent = currentTitle;

  for (let i = 1; i <= 6; i++) {
    const mark = document.getElementById(`step-mark-${i}`);
    if (mark) {
      if (i === level) mark.classList.add('active');
      else mark.classList.remove('active');
    }
    const badge = document.getElementById(`badge-layer-${i}`);
    if (badge) {
      if (i === level) badge.classList.add('active');
      else badge.classList.remove('active');
    }
  }

  // 1. Skeletal
  SYSTEMS_CONFIG.skeletal.active = true;
  SYSTEMS_CONFIG.skeletal.statusText = 'Bật';

  // 2. Connective
  SYSTEMS_CONFIG.connective.active = level >= 2;
  SYSTEMS_CONFIG.connective.statusText = level >= 2 ? 'Bật' : 'Tắt';

  // 3. Muscular (8-Layer Hierarchy)
  if (level === 1 || level === 2) {
    SYSTEMS_CONFIG.muscular.active = false;
    SYSTEMS_CONFIG.muscular.layer = 0;
    SYSTEMS_CONFIG.muscular.statusText = 'Tắt';
  } else if (level === 3) {
    SYSTEMS_CONFIG.muscular.active = true;
    SYSTEMS_CONFIG.muscular.layer = 2; // Deepest & Deep Muscles (Lớp 1-2)
    SYSTEMS_CONFIG.muscular.statusText = 'Lớp 2';
  } else if (level === 4) {
    SYSTEMS_CONFIG.muscular.active = true;
    SYSTEMS_CONFIG.muscular.layer = 4; // Intermediate Muscles (Lớp 1-4)
    SYSTEMS_CONFIG.muscular.statusText = 'Lớp 4';
  } else if (level === 5) {
    SYSTEMS_CONFIG.muscular.active = true;
    SYSTEMS_CONFIG.muscular.layer = 6; // Major Surface Muscles (Lớp 1-6)
    SYSTEMS_CONFIG.muscular.statusText = 'Lớp 6';
  } else if (level === 6) {
    SYSTEMS_CONFIG.muscular.active = true;
    SYSTEMS_CONFIG.muscular.layer = 8; // Full Cutaneous & Superficial (Lớp 1-8)
    SYSTEMS_CONFIG.muscular.statusText = 'Lớp 8';
  }

  // 4 & 5. Arterial & Venous Vascular Layering (5-Layer Spec)
  if (level <= 2) {
    SYSTEMS_CONFIG.arterial.active = false;
    SYSTEMS_CONFIG.arterial.layer = 0;
    SYSTEMS_CONFIG.arterial.statusText = 'Tắt';

    SYSTEMS_CONFIG.venous.active = false;
    SYSTEMS_CONFIG.venous.layer = 0;
    SYSTEMS_CONFIG.venous.statusText = 'Tắt';
  } else if (level === 3) {
    // Level 3: Central Great Vessels & Heart (Layer 1)
    SYSTEMS_CONFIG.arterial.active = true;
    SYSTEMS_CONFIG.arterial.layer = 1;
    SYSTEMS_CONFIG.arterial.statusText = 'Lớp 1';

    SYSTEMS_CONFIG.venous.active = true;
    SYSTEMS_CONFIG.venous.layer = 1;
    SYSTEMS_CONFIG.venous.statusText = 'Lớp 1';
  } else if (level === 4) {
    // Level 4: Regional Conducting Vessels (Layer 2)
    SYSTEMS_CONFIG.arterial.active = true;
    SYSTEMS_CONFIG.arterial.layer = 2;
    SYSTEMS_CONFIG.arterial.statusText = 'Lớp 2';

    SYSTEMS_CONFIG.venous.active = true;
    SYSTEMS_CONFIG.venous.layer = 2;
    SYSTEMS_CONFIG.venous.statusText = 'Lớp 2';
  } else if (level === 5) {
    // Level 5: Peripheral Conducting Vessels (Layer 4)
    SYSTEMS_CONFIG.arterial.active = true;
    SYSTEMS_CONFIG.arterial.layer = 4;
    SYSTEMS_CONFIG.arterial.statusText = 'Lớp 4';

    SYSTEMS_CONFIG.venous.active = true;
    SYSTEMS_CONFIG.venous.layer = 4;
    SYSTEMS_CONFIG.venous.statusText = 'Lớp 4';
  } else if (level === 6) {
    // Level 6: Complete Vascular Network (Layer 5 Full)
    SYSTEMS_CONFIG.arterial.active = true;
    SYSTEMS_CONFIG.arterial.layer = 5;
    SYSTEMS_CONFIG.arterial.statusText = 'Lớp 5';

    SYSTEMS_CONFIG.venous.active = true;
    SYSTEMS_CONFIG.venous.layer = 5;
    SYSTEMS_CONFIG.venous.statusText = 'Lớp 5';
  }

  // Visceral & Internal Organs
  const viscActive = level >= 3;
  SYSTEMS_CONFIG.digestive.active = viscActive;
  SYSTEMS_CONFIG.digestive.statusText = viscActive ? 'Bật' : 'Tắt';
  SYSTEMS_CONFIG.respiratory.active = viscActive;
  SYSTEMS_CONFIG.respiratory.statusText = viscActive ? 'Bật' : 'Tắt';
  SYSTEMS_CONFIG.endocrine.active = viscActive;
  SYSTEMS_CONFIG.endocrine.statusText = viscActive ? 'Bật' : 'Tắt';
  SYSTEMS_CONFIG.urogenital.active = viscActive;
  SYSTEMS_CONFIG.urogenital.statusText = viscActive ? 'Bật' : 'Tắt';
  SYSTEMS_CONFIG.lymphatic.active = viscActive;
  SYSTEMS_CONFIG.lymphatic.statusText = viscActive ? 'Bật' : 'Tắt';

  // Nervous
  const nActive = level >= 4;
  SYSTEMS_CONFIG.nervous.active = nActive;
  SYSTEMS_CONFIG.nervous.statusText = nActive ? 'Bật' : 'Tắt';

  updateBottomBarUI();
  updatePanelSteppersUI();
  applyAllSystemsVisibility();

  for (let sysKey in SYSTEMS_CONFIG) {
    const sys = SYSTEMS_CONFIG[sysKey];
    if (sys.active && !MODEL_FILES[sys.file].loaded && !MODEL_FILES[sys.file].loading) {
      loadModelFile(sys.file);
    }
  }
}

function toggleLayerPanel() {
  const panel = document.getElementById('layer-panel');
  const trigger = document.getElementById('layer-pill-trigger');
  if (!panel) return;

  const isCollapsed = panel.classList.contains('collapsed');
  if (isCollapsed) {
    panel.classList.remove('collapsed');
    if (trigger) trigger.style.display = 'none';
  } else {
    panel.classList.add('collapsed');
    if (trigger) trigger.style.display = 'flex';
  }
}

function updateBottomBarUI() {
  for (let key in SYSTEMS_CONFIG) {
    const sys = SYSTEMS_CONFIG[key];
    const btn = document.getElementById(`btn-sys-${key}`);
    const status = document.getElementById(`status-${key}`);
    
    if (btn && status) {
      status.textContent = sys.statusText;
      if (sys.active) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  }

  // Muscular stepper pill visibility
  const musStepper = document.getElementById('muscular-stepper');
  if (musStepper) {
    musStepper.style.display = SYSTEMS_CONFIG.muscular.active ? 'flex' : 'none';
  }

  // Arterial stepper pill visibility
  const artStepper = document.getElementById('arterial-stepper');
  if (artStepper) {
    artStepper.style.display = SYSTEMS_CONFIG.arterial.active ? 'flex' : 'none';
  }

  // Venous stepper pill visibility
  const venStepper = document.getElementById('venous-stepper');
  if (venStepper) {
    venStepper.style.display = SYSTEMS_CONFIG.venous.active ? 'flex' : 'none';
  }
}

function updatePanelSteppersUI() {
  const artText = document.getElementById('panel-art-text');
  if (artText) {
    const l = SYSTEMS_CONFIG.arterial.layer || 0;
    const names = {
      0: 'Tắt (Off)',
      1: 'Lớp 1: Thân ĐM Chính & Trục Dẫn',
      2: 'Lớp 2: Nhánh Tạng Lớn & Trục Sâu',
      3: 'Lớp 3: Nhánh Phân Phối & Vòng Nối',
      4: 'Lớp 4: Mạch Nuôi Cơ & Nhánh Tận',
      5: 'Lớp 5: Mạng Lưới Vi Mạch Tận Cùng'
    };
    artText.textContent = names[l] || `Lớp ${l}/5`;
  }

  const venText = document.getElementById('panel-ven-text');
  if (venText) {
    const l = SYSTEMS_CONFIG.venous.layer || 0;
    const names = {
      0: 'Tắt (Off)',
      1: 'Lớp 1: Thân TM Trung Tâm & Trục Sâu',
      2: 'Lớp 2: TM Tạng Bụng & Ngực Sâu',
      3: 'Lớp 3: TM Nông Lớn & Nhánh Tạng',
      4: 'Lớp 4: Đám Rối TM & Mạch Cơ',
      5: 'Lớp 5: Mạng Lưới Nông Mu & Ngón'
    };
    venText.textContent = names[l] || `Lớp ${l}/5`;
  }

  const musText = document.getElementById('panel-mus-text');
  if (musText) {
    const l = SYSTEMS_CONFIG.muscular.layer || 0;
    const names = {
      0: 'Tắt (Off)',
      1: 'Lớp 1: Cơ Sâu Nhất & Ụ Khớp',
      2: 'Lớp 2: Cơ Sâu Thân Mình & Chi',
      3: 'Lớp 3: Cơ Dựng Sống & Cẳng Chi Sâu',
      4: 'Lớp 4: Khối Cơ Trung Gian & Bụng Trong',
      5: 'Lớp 5: Cơ Vận Động Chính Các Chi',
      6: 'Lớp 6: Cơ Bề Mặt & Cơ Nhai',
      7: 'Lớp 7: Khối Cơ Nông Bao Phủ Ngoài',
      8: 'Lớp 8: Lớp Cơ Bám Da Nông Nhất'
    };
    musText.textContent = names[l] || `Lớp ${l}/8`;
  }
}

function applyAllSystemsVisibility() {
  for (let mesh of allMeshes) {
    if (mesh.userData.isHidden) {
      mesh.visible = false;
      continue;
    }
    const sysKey = mesh.userData.system;
    let isActive = false;
    if (sysKey === 'urinary' || sysKey === 'reproductive') {
      isActive = (SYSTEMS_CONFIG[sysKey] && SYSTEMS_CONFIG[sysKey].active) || (SYSTEMS_CONFIG.urogenital && SYSTEMS_CONFIG.urogenital.active);
    } else if (sysKey === 'cardiac') {
      isActive = (SYSTEMS_CONFIG.cardiac && SYSTEMS_CONFIG.cardiac.active) || (SYSTEMS_CONFIG.arterial && SYSTEMS_CONFIG.arterial.active);
    } else if (SYSTEMS_CONFIG[sysKey]) {
      isActive = SYSTEMS_CONFIG[sysKey].active;
    }
    mesh.visible = !!isActive;
  }
}

// Utility Controls
function toggleAutoRotate() {
  isAutoRotating = !isAutoRotating;
  const btn = document.getElementById('btn-rotate');
  if (btn) btn.classList.toggle('active', isAutoRotating);
}

function resetCamera() {
  scene.rotation.set(0, 0, 0);
  smoothMoveCamera(new THREE.Vector3(0, 0.85, 2.6), new THREE.Vector3(0, 0.85, 0));
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function unhideAll() {
  allMeshes.forEach(m => {
    m.visible = true;
    m.userData.isHidden = false;
    m.material.transparent = (m.userData.system === 'skeletal' && m.userData.cleanName.toLowerCase().includes('cartilage')) || m.userData.system === 'integumentary';
    m.material.opacity = (m.userData.system === 'integumentary') ? 0.18 : (m.material.transparent ? 0.88 : 1.0);
    m.material.depthWrite = true;
  });
  applyAllSystemsVisibility();
}

function setCameraView(view) {
  document.querySelectorAll('.view-presets .view-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`view-${view}`);
  if (btn) btn.classList.add('active');

  const target = new THREE.Vector3(0, 0.85, 0);
  const dist = 2.6;
  let newPos;
  switch (view) {
    case 'front':
      newPos = new THREE.Vector3(0, 0.85, dist);
      break;
    case 'back':
      newPos = new THREE.Vector3(0, 0.85, -dist);
      break;
    case 'left':
      newPos = new THREE.Vector3(-dist, 0.85, 0);
      break;
    case 'right':
      newPos = new THREE.Vector3(dist, 0.85, 0);
      break;
    case 'top':
      newPos = new THREE.Vector3(0, dist + 0.85, 0.01);
      break;
  }
  if (newPos) {
    smoothMoveCamera(newPos, target);
  }
}

// ========================================================
// ADVANCED MEDICAL ANATOMY SEARCH & NERVOUS DIRECTORY
// ========================================================
function stripVietnamese(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim();
}

const CRANIAL_NERVES_MAP = [
  { num: 1, roman: 'i', vi: 'Thần kinh khứu giác (dây I)', en: 'Olfactory nerve (I)', clean: 'Olfactory nerve (I)' },
  { num: 2, roman: 'ii', vi: 'Thần kinh thị giác (dây II)', en: 'Optic nerve (II)', clean: 'Optic nerve (II)' },
  { num: 3, roman: 'iii', vi: 'Thần kinh vận nhãn (dây III)', en: 'Oculomotor nerve (III)', clean: 'Oculomotor nerve (III)' },
  { num: 4, roman: 'iv', vi: 'Thần kinh ròng rọc (dây IV)', en: 'Trochlear nerve (IV)', clean: 'Trochlear nerve (IV)' },
  { num: 5, roman: 'v', vi: 'Thần kinh sinh ba (dây V)', en: 'Trigeminal nerve (V)', clean: 'Trigeminal nerve (V)' },
  { num: 6, roman: 'vi', vi: 'Thần kinh vận nhãn ngoài (dây VI)', en: 'Abducens nerve (VI)', clean: 'Abducens nerve (VI)' },
  { num: 7, roman: 'vii', vi: 'Thần kinh mặt (dây VII)', en: 'Facial nerve (VII)', clean: 'Facial nerve (VII)' },
  { num: 8, roman: 'viii', vi: 'Thần kinh tiền đình ốc tai (dây VIII)', en: 'Vestibulocochlear nerve (VIII)', clean: 'Vestibulocochlear nerve (VIII)' },
  { num: 9, roman: 'ix', vi: 'Thần kinh thiệt hầu (dây IX)', en: 'Glossopharyngeal nerve (IX)', clean: 'Glossopharyngeal nerve (IX)' },
  { num: 10, roman: 'x', vi: 'Thần kinh lang thang (dây X)', en: 'Vagus nerve (X)', clean: 'Vagus nerve (X)' },
  { num: 11, roman: 'xi', vi: 'Thần kinh phụ (dây XI)', en: 'Accessory nerve (XI)', clean: 'Accessory nerve (XI)' },
  { num: 12, roman: 'xii', vi: 'Thần kinh hạ thiệt (dây XII)', en: 'Hypoglossal nerve (XII)', clean: 'Hypoglossal nerve (XII)' }
];

const PREINDEXED_NERVES_CATALOG = [
  // 12 Cranial Nerves
  { cleanName: 'Olfactory nerve (I)', viName: 'Thần kinh khứu giác (dây I)', enName: 'Olfactory nerve (I)', latinName: 'Nervus olfactorius', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Optic nerve (II)', viName: 'Thần kinh thị giác (dây II)', enName: 'Optic nerve (II)', latinName: 'Nervus opticus', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Oculomotor nerve (III)', viName: 'Thần kinh vận nhãn (dây III)', enName: 'Oculomotor nerve (III)', latinName: 'Nervus oculomotorius', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Trochlear nerve (IV)', viName: 'Thần kinh ròng rọc (dây IV)', enName: 'Trochlear nerve (IV)', latinName: 'Nervus trochlearis', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Trigeminal nerve (V)', viName: 'Thần kinh sinh ba (dây V)', enName: 'Trigeminal nerve (V)', latinName: 'Nervus trigeminus', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Ophthalmic nerve', viName: 'Thần kinh mắt (nhánh V1)', enName: 'Ophthalmic nerve', latinName: 'Nervus ophthalmicus', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Maxillary nerve', viName: 'Thần kinh hàm trên (nhánh V2)', enName: 'Maxillary nerve', latinName: 'Nervus maxillaris', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Anterior division of mandibular nerve', viName: 'Thần kinh hàm dưới (nhánh V3)', enName: 'Mandibular nerve', latinName: 'Nervus mandibularis', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Lingual nerve', viName: 'Thần kinh lưỡi', enName: 'Lingual nerve', latinName: 'Nervus lingualis', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Inferior alveolar nerve', viName: 'Thần kinh huyệt răng dưới', enName: 'Inferior alveolar nerve', latinName: 'Nervus alveolaris inferior', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Mental nerve', viName: 'Thần kinh cằm', enName: 'Mental nerve', latinName: 'Nervus mentalis', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Abducens nerve (VI)', viName: 'Thần kinh vận nhãn ngoài (dây VI)', enName: 'Abducens nerve (VI)', latinName: 'Nervus abducens', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Facial nerve (VII)', viName: 'Thần kinh mặt (dây VII)', enName: 'Facial nerve (VII)', latinName: 'Nervus facialis', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Vestibulocochlear nerve (VIII)', viName: 'Thần kinh tiền đình ốc tai (dây VIII)', enName: 'Vestibulocochlear nerve (VIII)', latinName: 'Nervus vestibulocochlearis', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Glossopharyngeal nerve (IX)', viName: 'Thần kinh thiệt hầu (dây IX)', enName: 'Glossopharyngeal nerve (IX)', latinName: 'Nervus glossopharyngeus', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Vagus nerve (X)', viName: 'Thần kinh lang thang (dây X)', enName: 'Vagus nerve (X)', latinName: 'Nervus vagus', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Accessory nerve (XI)', viName: 'Thần kinh phụ (dây XI)', enName: 'Accessory nerve (XI)', latinName: 'Nervus accessorius', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Hypoglossal nerve (XII)', viName: 'Thần kinh hạ thiệt (dây XII)', enName: 'Hypoglossal nerve (XII)', latinName: 'Nervus hypoglossus', system: 'nervous', sourceFile: 'models/nervous.glb' },

  // Chi trên
  { cleanName: 'Radial nerve', viName: 'Thần kinh quay', enName: 'Radial nerve', latinName: 'Nervus radialis', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Deep branch of radial nerve', viName: 'Nhánh sâu thần kinh quay', enName: 'Deep branch of radial nerve', latinName: 'Ramus profundus nervi radialis', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Superficial branch of radial nerve', viName: 'Nhánh nông thần kinh quay', enName: 'Superficial branch of radial nerve', latinName: 'Ramus superficialis nervi radialis', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Median nerve', viName: 'Thần kinh giữa', enName: 'Median nerve', latinName: 'Nervus medianus', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Ulnar nerve', viName: 'Thần kinh trụ', enName: 'Ulnar nerve', latinName: 'Nervus ulnaris', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Axillary nerve', viName: 'Thần kinh nách', enName: 'Axillary nerve', latinName: 'Nervus axillaris', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Musculocutaneous nerve', viName: 'Thần kinh cơ bì', enName: 'Musculocutaneous nerve', latinName: 'Nervus musculocutaneus', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Suprascapular nerve', viName: 'Thần kinh trên vai', enName: 'Suprascapular nerve', latinName: 'Nervus suprascapularis', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Long thoracic nerve', viName: 'Thần kinh ngực dài', enName: 'Long thoracic nerve', latinName: 'Nervus thoracicus longus', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Thoracodorsal nerve', viName: 'Thần kinh ngực lưng', enName: 'Thoracodorsal nerve', latinName: 'Nervus thoracodorsalis', system: 'nervous', sourceFile: 'models/nervous.glb' },

  // Chi dưới
  { cleanName: 'Sciatic nerve', viName: 'Thần kinh ngồi (Thần kinh tọa / hông to)', enName: 'Sciatic nerve', latinName: 'Nervus ischiadicus', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Femoral nerve', viName: 'Thần kinh đùi', enName: 'Femoral nerve', latinName: 'Nervus femoralis', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Obturator nerve', viName: 'Thần kinh bịt', enName: 'Obturator nerve', latinName: 'Nervus obturatorius', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Tibial nerve', viName: 'Thần kinh chày', enName: 'Tibial nerve', latinName: 'Nervus tibialis', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Common fibular nerve', viName: 'Thần kinh mác chung', enName: 'Common fibular nerve', latinName: 'Nervus fibularis communis', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Deep fibular nerve', viName: 'Thần kinh mác sâu', enName: 'Deep fibular nerve', latinName: 'Nervus fibularis profundus', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Superficial fibular nerve', viName: 'Thần kinh mác nông', enName: 'Superficial fibular nerve', latinName: 'Nervus fibularis superficialis', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Saphenous nerve', viName: 'Thần kinh hiển', enName: 'Saphenous nerve', latinName: 'Nervus saphenus', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Sural nerve', viName: 'Thần kinh bắp chân', enName: 'Sural nerve', latinName: 'Nervus suralis', system: 'nervous', sourceFile: 'models/nervous.glb' },

  // Thân mình & Khác
  { cleanName: 'Intercostal nerves', viName: 'Các thần kinh gian sườn', enName: 'Intercostal nerves', latinName: 'Nervi intercostales', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Pudendal nerve', viName: 'Thần kinh thẹn', enName: 'Pudendal nerve', latinName: 'Nervus pudendus', system: 'nervous', sourceFile: 'models/nervous.glb' },
  { cleanName: 'Sympathetic nerves', viName: 'Thần kinh giao cảm', enName: 'Sympathetic nerves', latinName: 'Nervi sympathici', system: 'nervous', sourceFile: 'models/nervous.glb' }
];

let currentSearchMatches = [];

function highlightSearchMatch(text, rawQuery) {
  if (!text || !rawQuery) return text || '';
  const qClean = stripVietnamese(rawQuery)
    .replace(/\b(?:day\s*tk|day\s*than\s*kinh|tk)\b/g, '')
    .trim();
  const tokens = [qClean, ...qClean.split(/\s+/)].filter(t => t.length >= 2);
  if (tokens.length === 0) return text;

  const stripped = stripVietnamese(text);
  for (let t of tokens) {
    const idx = stripped.indexOf(t);
    if (idx !== -1) {
      const matchLen = t.length;
      const before = text.substring(0, idx);
      const match = text.substring(idx, idx + matchLen);
      const after = text.substring(idx + matchLen);
      return `${before}<span style="color:#00d2ff;background:rgba(0,210,255,0.22);padding:1px 4px;border-radius:4px;font-weight:800;">${match}</span>${after}`;
    }
  }
  return text;
}

function findAnatomySearchResults(query) {
  const qStripped = stripVietnamese(query);
  if (!qStripped) return [];

  // Pool: all loaded meshes + preindexed nerves catalog if mesh not yet present in allMeshes
  const pool = [];
  const seenClean = new Set();

  allMeshes.forEach(m => {
    if (!m.userData) return;
    const clean = (m.userData.cleanName || '').trim();
    if (!clean) return;
    seenClean.add(clean.toLowerCase());
    pool.push({
      isMesh: true,
      meshRef: m,
      cleanName: clean,
      viName: m.userData.viName || clean,
      enName: m.userData.enName || clean,
      latinName: m.userData.latinName || clean,
      system: m.userData.system || 'skeletal',
      sourceFile: null
    });
  });

  PREINDEXED_NERVES_CATALOG.forEach(cat => {
    if (!seenClean.has(cat.cleanName.toLowerCase())) {
      const existingMesh = allMeshes.find(m => {
        const cn = (m.userData?.cleanName || '').toLowerCase();
        return cn === cat.cleanName.toLowerCase() || cn.startsWith(cat.cleanName.toLowerCase());
      });
      pool.push({
        isMesh: !!existingMesh,
        meshRef: existingMesh || null,
        cleanName: cat.cleanName,
        viName: cat.viName,
        enName: cat.enName,
        latinName: cat.latinName,
        system: cat.system,
        sourceFile: cat.sourceFile
      });
    }
  });

  // 1. Cranial Nerve direct match: "dây 7", "day 7", "dây vii", "tk 7", "dây số 7", "dây tk 7"
  const cranialMatch = qStripped.match(/^(?:day|tk|day tk|day than kinh)?\s*(?:so\s*)?([1-9]|1[0-2]|i{1,3}|iv|v|vi{1,3}|ix|x|xi{1,2})$/i);
  if (cranialMatch) {
    const token = cranialMatch[1].toLowerCase();
    const cEntry = CRANIAL_NERVES_MAP.find(c => String(c.num) === token || c.roman === token);
    if (cEntry) {
      const match = pool.find(p => p.cleanName === cEntry.clean || p.viName.includes(`(${cEntry.roman.toUpperCase()})`) || p.viName.includes(`dây ${cEntry.roman.toUpperCase()}`));
      if (match) return [match];
    }
  }

  // 2. Query expansion
  let expanded = qStripped
    .replace(/[-_–—/]/g, ' ')
    .replace(/\b(?:day\s*tk|day\s*than\s*kinh|tk)\b/g, 'than kinh')
    .replace(/\b(?:dm|dong mach)\b/g, 'dong mach')
    .replace(/\b(?:tm|tinh mach)\b/g, 'tinh mach')
    .replace(/\b(?:hong to|toa|to\u1ea1)\b/g, 'ngoi');

  const tokens = expanded.split(/\s+/).filter(t => t.length > 0);
  const isNerveQuery = expanded.includes('than kinh');
  const isArteryQuery = expanded.includes('dong mach');
  const isVeinQuery = expanded.includes('tinh mach');

  const scored = [];
  pool.forEach(item => {
    const vi = stripVietnamese(item.viName).replace(/[-_–—/]/g, ' ');
    const en = stripVietnamese(item.enName).replace(/[-_–—/]/g, ' ');
    const lat = stripVietnamese(item.latinName).replace(/[-_–—/]/g, ' ');
    const combined = `${vi} ${en} ${lat}`;

    let matches = tokens.every(t => combined.includes(t));
    if (!matches && (combined.includes(qStripped) || vi.includes(qStripped) || en.includes(qStripped))) {
      matches = true;
    }
    if (!matches) return;

    let score = 0;
    if (vi === qStripped || en === qStripped) score += 1000;
    if (vi.startsWith(qStripped) || en.startsWith(qStripped)) score += 500;

    tokens.forEach(t => {
      const wordRegex = new RegExp('\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
      if (wordRegex.test(vi)) score += 140;
      else if (vi.includes(t)) score += 30;

      if (wordRegex.test(en)) score += 100;
      else if (en.includes(t)) score += 20;

      if (wordRegex.test(lat)) score += 80;
    });

    if (isNerveQuery && item.system === 'nervous') score += 180;
    if (isArteryQuery && item.system === 'arterial') score += 180;
    if (isVeinQuery && item.system === 'venous') score += 180;

    score -= (item.cleanName.length * 0.4);

    scored.push({ item, score });
  });

  scored.sort((a, b) => b.score - a.score);

  const unique = [];
  const seenVi = new Set();
  for (let s of scored) {
    if (!seenVi.has(s.item.viName)) {
      seenVi.add(s.item.viName);
      unique.push(s.item);
    }
  }
  return unique;
}

async function selectSearchedOrgan(target) {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  if (input) input.value = target.userData ? target.userData.viName : target.viName;
  if (results) results.style.display = 'none';

  let targetMesh = target.isMesh ? (target.meshRef || target) : target.meshRef;

  // If model is not yet loaded in 3D scene (e.g. nervous.glb background download)
  if (!targetMesh && target.sourceFile) {
    if (typeof showStudyToast === 'function') {
      showStudyToast(`Đang nạp mô hình ${target.viName}...`);
    }
    await loadModelFile(target.sourceFile);
    targetMesh = allMeshes.find(m => {
      const cn = (m.userData?.cleanName || '').toLowerCase();
      return cn === target.cleanName.toLowerCase() || cn.startsWith(target.cleanName.toLowerCase());
    });
  }

  if (!targetMesh) {
    targetMesh = allMeshes.find(m => {
      const vi = (m.userData?.viName || '').toLowerCase();
      const cn = (m.userData?.cleanName || '').toLowerCase();
      return vi === (target.viName || '').toLowerCase() || cn === (target.cleanName || '').toLowerCase();
    });
  }

  if (!targetMesh) return;

  const sysKey = targetMesh.userData.system;
  if (!SYSTEMS_CONFIG[sysKey].active) {
    if (sysKey === 'muscular') {
      stepMuscularLayer(6);
    } else if (sysKey === 'arterial') {
      stepArterialLayer(3);
    } else if (sysKey === 'venous') {
      stepVenousLayer(3);
    } else {
      toggleSystem(sysKey);
    }
  }

  // If selecting a nervous structure, make sure surrounding opaque muscles don't completely bury it
  if (sysKey === 'nervous') {
    SYSTEMS_CONFIG.nervous.active = true;
    SYSTEMS_CONFIG.nervous.statusText = 'Bật';
    if (SYSTEMS_CONFIG.muscular.active && SYSTEMS_CONFIG.muscular.layer > 4) {
      stepMuscularLayer(3 - SYSTEMS_CONFIG.muscular.layer);
    }
    updateBottomBarUI();
    updatePanelSteppersUI();
    applyAllSystemsVisibility();
  }

  targetMesh.visible = true;
  targetMesh.userData.isHidden = false;
  selectOrgan(targetMesh);
  focusSelected();
}

function setupSearch() {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  if (!input || !results) return;

  // Global Ctrl + K / Cmd + K shortcut to focus search
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentSearchMatches && currentSearchMatches.length > 0) {
        selectSearchedOrgan(currentSearchMatches[0]);
      }
    }
  });

  input.addEventListener('input', () => {
    const query = input.value.trim();
    if (!query) {
      currentSearchMatches = [];
      results.style.display = 'none';
      return;
    }

    const unique = findAnatomySearchResults(query);
    currentSearchMatches = unique;

    results.innerHTML = '';
    if (unique.length === 0) {
      results.innerHTML = '<div style="padding:12px 14px;color:#8492a6;font-size:0.84rem;text-align:center;">Không tìm thấy cấu trúc giải phẫu phù hợp</div>';
      results.style.display = 'block';
      return;
    }

    unique.slice(0, 8).forEach(item => {
      const el = document.createElement('div');
      el.className = 'search-item';
      const sys = SYSTEMS_CONFIG[item.system];
      const sysName = sys?.viName || sys?.name || 'Hệ Thống';
      const viHighlighted = highlightSearchMatch(item.viName, query);
      const enHighlighted = highlightSearchMatch(item.latinName || item.enName, query);
      el.innerHTML = `
        <div>
          <div class="search-item-vi">${viHighlighted}</div>
          <div class="search-item-en">${enHighlighted}</div>
        </div>
        <small style="color:var(--accent);background:rgba(0,210,255,0.12);border:1px solid rgba(0,210,255,0.25);padding:3px 8px;border-radius:6px;font-size:0.72rem;font-weight:700;">${sysName}</small>
      `;
      el.addEventListener('click', () => {
        selectSearchedOrgan(item);
      });
      results.appendChild(el);
    });

    results.style.display = 'block';
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
      results.style.display = 'none';
    }
  });
}

// ========================================================
// STARTUP HUB & ATLAS MODES (Articles Library & Empty Slots)
// ========================================================
let currentAppMode = 'models'; // 'models' or 'atlas'

function openHubOverlay() {
  const hub = document.getElementById('hub-overlay');
  if (hub) hub.classList.remove('hidden');
}

function closeHubOverlay() {
  const hub = document.getElementById('hub-overlay');
  if (hub) hub.classList.add('hidden');
}

function openAtlasOverlay() {
  const atlas = document.getElementById('atlas-overlay');
  if (atlas) atlas.classList.remove('hidden');
}

function closeAtlasOverlay() {
  const atlas = document.getElementById('atlas-overlay');
  if (atlas) atlas.classList.add('hidden');
}

function selectHubMode(mode) {
  currentAppMode = mode;
  closeHubOverlay();

  if (mode === 'atlas') {
    openAtlasOverlay();
  } else {
    closeAtlasOverlay();
    resetCamera();
  }
}

function clickEmptyAtlasSlot(slotId) {
  if (slotId === 'new') {
    alert("Khung bài học mới: Đã sẵn sàng!\nBạn có thể liên kết dữ liệu hoặc nhập nội dung bài giảng mới vào ô này sau.");
  } else {
    alert(`Ô vuông bài học #${slotId} hiện đang để trống.\nĐây là vị trí chờ để bạn nhập nội dung bài viết giải phẫu học sau này!`);
  }
}

function smoothMoveCamera(pos, target) {
  targetCamPos = pos;
  targetCamLookAt = target;
}

// Support Esc key to dismiss overlays, inspector, and search, and H to hide selected
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAtlasOverlay();
    closeHubOverlay();
    closeInspector();
    closeCeliacLecture();
    const results = document.getElementById('search-results');
    if (results) results.style.display = 'none';
  } else if (e.key === 'h' || e.key === 'H') {
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
    const celiacModal = document.getElementById('celiac-lecture-modal');
    if (celiacModal && !celiacModal.classList.contains('hidden')) {
      hideCeliacSelected();
    } else if (selectedMesh) {
      hideSelected();
    }
  }
});

// Atlas live search
window.addEventListener('load', () => {
  const atlasSearch = document.getElementById('atlas-search');
  if (atlasSearch) {
    atlasSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.atlas-square-card');
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (!q || text.includes(q)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }
});



// ========================================================
// CLINICAL LECTURE: CELIAC ARTERIES OF STOMACH, LIVER, SPLEEN
// NETTER BP 64 MASTERCLASS VIEWER
// ========================================================

const CELIAC_LANDMARKS = [
  {
    id: 'celiac_trunk',
    num: 1,
    vi: 'Thân Động Mạch Tạng',
    latin: 'Truncus coeliacus',
    en: 'Celiac trunk',
    pos: [0.0084, 1.1476, 0.0234],
    camTarget: [0.0084, 1.1476, 0.0234],
    camDist: 0.18,
    desc: 'Thân mạch máu lớn xuất phát từ mặt trước ĐM chủ bụng (T12/L1), chia làm 3 ngành cùng Haller: ĐM vị trái, ĐM lách và ĐM gan chung.'
  },
  {
    id: 'left_gastric_artery',
    num: 2,
    vi: 'Động Mạch Vị Trái & Nhánh Thực Quản',
    latin: 'Arteria gastrica sinistra',
    en: 'Left gastric artery',
    pos: [0.0126, 1.1661, 0.0431],
    camTarget: [0.0126, 1.1661, 0.0431],
    camDist: 0.16,
    desc: 'Đi lên bờ cong nhỏ, cho các nhánh thực quản nuôi thực quản dưới, rồi đi dọc bờ cong nhỏ nối với ĐM vị phải.'
  },
  {
    id: 'splenic_artery',
    num: 3,
    vi: 'Động Mạch Lách & Nhánh Tụy',
    latin: 'Arteria splenica / lienalis',
    en: 'Splenic artery',
    pos: [0.0516, 1.1566, 0.0092],
    camTarget: [0.0516, 1.1566, 0.0092],
    camDist: 0.22,
    desc: 'Nhánh lớn nhất, đường đi ngoằn ngoèo đặc trưng dọc bờ trên tụy sang lách, cho các nhánh tụy, các ĐM vị ngắn và ĐM vị - mạc nối trái.'
  },
  {
    id: 'common_hepatic_artery',
    num: 4,
    vi: 'Động Mạch Gan Chung',
    latin: 'Arteria hepatica communis',
    en: 'Common hepatic artery',
    pos: [-0.0063, 1.1519, 0.0458],
    camTarget: [-0.0063, 1.1519, 0.0458],
    camDist: 0.16,
    desc: 'Chạy sang phải dọc bờ trên đầu tụy, chia thành ĐM gan riêng đi lên cuống gan và ĐM vị - tá tràng đi xuống sau môn vị.'
  },
  {
    id: 'proper_hepatic_artery',
    num: 5,
    vi: 'Động Mạch Gan Riêng & Các Nhánh Gan',
    latin: 'Arteria hepatica propria',
    en: 'Proper hepatic artery',
    pos: [-0.025, 1.158, 0.060],
    camTarget: [-0.025, 1.158, 0.060],
    camDist: 0.16,
    desc: 'Đi trong cuống gan (bên trái ống mật chủ, trước tĩnh mạch cửa), chia nhánh nuôi thùy gan trái, thùy gan phải và cho ĐM túi mật.'
  },
  {
    id: 'right_gastric_artery',
    num: 6,
    vi: 'Động Mạch Vị Phải (Vòng Bờ Cong Nhỏ)',
    latin: 'Arteria gastrica dextra',
    en: 'Right gastric artery',
    pos: [-0.005, 1.155, 0.052],
    camTarget: [0.002, 1.160, 0.048],
    camDist: 0.16,
    desc: 'Đi dọc bờ cong nhỏ dạ dày nối với ĐM vị trái tạo thành VÒNG MẠCH BỜ CONG NHỎ DẠ DÀY.'
  },
  {
    id: 'gastroduodenal_artery',
    num: 7,
    vi: 'Động Mạch Vị - Tá Tràng',
    latin: 'Arteria gastroduodenalis',
    en: 'Gastroduodenal artery',
    pos: [-0.0275, 1.1388, 0.0737],
    camTarget: [-0.0275, 1.1388, 0.0737],
    camDist: 0.15,
    desc: 'Đi sau đoạn 1 tá tràng, cho ĐM tá tụy trên nuôi đầu tụy/tá tràng và ĐM vị - mạc nối phải đi vào bờ cong lớn dạ dày.'
  },
  {
    id: 'right_gastroepiploic',
    num: 8,
    vi: 'ĐM Vị - Mạc Nối Phải (Vòng Bờ Cong Lớn)',
    latin: 'Arteria gastroomentalis dextra',
    en: 'Right gastro-omental artery',
    pos: [0.005, 1.100, 0.068],
    camTarget: [0.015, 1.102, 0.065],
    camDist: 0.18,
    desc: 'Chạy dọc bờ cong lớn dạ dày trong 2 lá mạc nối lớn, nối với ĐM vị - mạc nối trái tạo thành VÒNG MẠCH BỜ CONG LỚN DẠ DÀY.'
  },
  {
    id: 'left_gastroepiploic',
    num: 9,
    vi: 'Động Mạch Vị - Mạc Nối Trái',
    latin: 'Arteria gastroomentalis sinistra',
    en: 'Left gastro-omental artery',
    pos: [0.0606, 1.1285, 0.0364],
    camTarget: [0.0606, 1.1285, 0.0364],
    camDist: 0.18,
    desc: 'Nhánh của ĐM lách chạy dọc bờ cong lớn dạ dày nối với ĐM vị - mạc nối phải.'
  },
  {
    id: 'short_gastric_arteries',
    num: 10,
    vi: 'Các Động Mạch Vị Ngắn (Đáy Vị)',
    latin: 'Arteriae gastricae breves',
    en: 'Short gastric arteries',
    pos: [0.065, 1.185, 0.020],
    camTarget: [0.065, 1.185, 0.020],
    camDist: 0.16,
    desc: '5 - 7 nhánh nhỏ tách từ ĐM lách đi trong dây chằng vị lách cấp máu cho phần đáy vị dạ dày.'
  },
  {
    id: 'cystic_artery',
    num: 11,
    vi: 'Động Mạch Túi Mật & Túi Mật',
    latin: 'Arteria cystica & Vesica biliaris',
    en: 'Cystic artery & Gallbladder',
    pos: [-0.0452, 1.140, 0.0563],
    camTarget: [-0.0452, 1.140, 0.0563],
    camDist: 0.16,
    desc: 'ĐM túi mật xuất phát từ ĐM gan phải trong tam giác Calot, cấp máu cho túi mật; ống túi mật hợp với ống gan chung thành ống mật chủ.'
  },
  {
    id: 'portal_vein',
    num: 12,
    vi: 'Tĩnh Mạch Cửa & Ống Mật Chủ',
    latin: 'Vena portae hepatis & Ductus choledochus',
    en: 'Hepatic portal vein & Common bile duct',
    pos: [-0.0057, 1.1732, 0.0304],
    camTarget: [-0.015, 1.160, 0.040],
    camDist: 0.18,
    desc: 'Trục tĩnh mạch lớn dẫn máu từ ống tiêu hóa về gan và ống dẫn mật chính; nằm trong cuống gan (dây chằng gan tá tràng).'
  },
  {
    id: 'abdominal_aorta',
    num: 13,
    vi: 'Động Mạch Chủ Bụng & Hoành Dưới',
    latin: 'Aorta abdominalis & A. phrenica inferior',
    en: 'Abdominal aorta & Inferior phrenic a.',
    pos: [0.0077, 1.185, 0.0106],
    camTarget: [0.0077, 1.160, 0.0106],
    camDist: 0.24,
    desc: 'Thân động mạch lớn nhất cơ thể đi qua lỗ cơ hoành, cho các ĐM hoành dưới và cho Thân ĐM tạng ngay dưới lỗ hoành.'
  },
  {
    id: 'pancreas_duodenum',
    num: 14,
    vi: 'Tụy & Quai Tá Tràng',
    latin: 'Pancreas & Duodenum',
    en: 'Pancreas & Duodenum',
    pos: [0.0136, 1.116, 0.0216],
    camTarget: [0.0136, 1.116, 0.0216],
    camDist: 0.22,
    desc: 'Đầu tụy ôm lấy quai tá tràng hình chữ C; nhận máu kép từ Thân tạng (qua ĐM vị tá tràng) và ĐM mạc treo tràng trên.'
  },
  {
    id: 'spleen',
    num: 15,
    vi: 'Lách (Tỳ)',
    latin: 'Spleen / Lien',
    en: 'Spleen',
    pos: [0.0848, 1.1615, -0.0044],
    camTarget: [0.0848, 1.1615, -0.0044],
    camDist: 0.20,
    desc: 'Tạng bạch huyết lớn nhất nằm ở hạ sườn trái áp sát đáy vị, nhận máu từ các nhánh tận của Động mạch lách.'
  }
];

let celiacScene = null;
let celiacCamera = null;
let celiacRenderer = null;
let celiacControls = null;
let celiacMeshes = [];
let celiacAnimId = null;
let celiacModelRoot = null;

let celiacStomachMode = 0; // 0: Normal, 1: X-Ray 0.18, 2: Hidden
let celiacLiverMode = 1;   // 0: Normal, 1: Translucent 0.35, 2: Hidden (Default 1 so celiac trunk is visible!)
let celiacSoloArteries = false;
let celiacAutoRotate = false;

let celiacCamTarget = null;
let celiacCamPos = null;
let celiacSelectedMesh = null;
let celiacHiddenMeshes = new Set();
let celiacSidebarHidden = false;

function openCeliacLecture() {
  closeAtlasOverlay();
  closeHubOverlay();
  
  const modal = document.getElementById('celiac-lecture-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }

  // Populate landmarks list
  populateCeliacLandmarksUI();

  // Initialize or resize 3D viewer
  setTimeout(() => {
    if (!celiacRenderer) {
      initCeliac3DScene();
    } else {
      onCeliacResize();
    }
  }, 100);
}

function closeCeliacLecture() {
  const modal = document.getElementById('celiac-lecture-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function toggleLectureFullscreen() {
  const modal = document.getElementById('celiac-lecture-modal');
  if (!document.fullscreenElement) {
    modal.requestFullscreen().catch(err => {
      alert(`Lỗi toàn màn hình: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
}

function switchLectureTab(tabName) {
  const tabs = ['landmarks', 'theory', 'clinical', 'netter'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const content = document.getElementById(`lec-content-${t}`);
    if (btn) btn.classList.toggle('active', t === tabName);
    if (content) content.style.display = (t === tabName) ? (t === 'landmarks' ? 'flex' : 'block') : 'none';
  });
}

function populateCeliacLandmarksUI() {
  const list = document.getElementById('lec-content-landmarks');
  if (!list || list.children.length > 0) return;

  CELIAC_LANDMARKS.forEach((lm) => {
    const card = document.createElement('div');
    card.className = 'lec-landmark-card';
    card.id = `lec-card-${lm.id}`;
    card.innerHTML = `
      <div class="lec-lm-left">
        <div class="lec-lm-idx"><i class="fa-solid fa-circle-dot" style="font-size:0.7rem;"></i></div>
        <div>
          <div class="lec-lm-name-vi">${lm.vi}</div>
          <div class="lec-lm-name-latin">${lm.latin}</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <div class="lec-lm-btn"><i class="fa-solid fa-crosshairs"></i> Xem</div>
        <button class="lec-eye-btn" id="lec-eye-${lm.id}" title="Ẩn/Hiện cấu trúc này" onclick="toggleHideCeliacLandmark('${lm.id}', event)">
          <i class="fa-solid fa-eye"></i>
        </button>
      </div>
    `;
    card.addEventListener('click', () => {
      selectLectureLandmark(lm.id);
    });
    list.appendChild(card);
  });
}

function initCeliac3DScene() {
  const container = document.getElementById('celiac-canvas-container');
  if (!container) return;

  const w = container.clientWidth || 800;
  const h = container.clientHeight || 600;

  celiacScene = new THREE.Scene();

  celiacCamera = new THREE.PerspectiveCamera(42, w / h, 0.02, 20);
  celiacCamera.position.set(0.0084, 1.155, 0.38);

  celiacRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  celiacRenderer.setSize(w, h);
  celiacRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  celiacRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  celiacRenderer.toneMappingExposure = 1.1;
  celiacRenderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(celiacRenderer.domElement);

  celiacControls = new THREE.OrbitControls(celiacCamera, celiacRenderer.domElement);
  celiacControls.enableDamping = true;
  celiacControls.dampingFactor = 0.06;
  celiacControls.target.set(0.0084, 1.148, 0.025);
  celiacControls.maxDistance = 1.5;
  celiacControls.minDistance = 0.06;

  // Complete Anatomy Studio Lighting
  const amb = new THREE.AmbientLight(0xfff8ee, 0.45);
  celiacScene.add(amb);

  const keyLight = new THREE.DirectionalLight(0xfff7ea, 1.1);
  keyLight.position.set(1.5, 2.5, 2.0);
  celiacScene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xe0efff, 0.55);
  fillLight.position.set(-1.8, 1.2, 1.5);
  celiacScene.add(fillLight);

  const backLight = new THREE.DirectionalLight(0xffeedd, 0.40);
  backLight.position.set(0, -1.0, -2.0);
  celiacScene.add(backLight);

  // Load Model
  loadCeliacGLB();

  // Raycasting inside Celiac Viewer
  const celiacRaycaster = new THREE.Raycaster();
  const celiacMouse = new THREE.Vector2();

  celiacRenderer.domElement.addEventListener('click', (e) => {
    const rect = celiacRenderer.domElement.getBoundingClientRect();
    celiacMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    celiacMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    celiacRaycaster.setFromCamera(celiacMouse, celiacCamera);

    // Check meshes
    const visibleMeshes = celiacMeshes.filter(m => m.visible);
    const meshHits = celiacRaycaster.intersectObjects(visibleMeshes);
    if (meshHits.length > 0) {
      const hitMesh = meshHits[0].object;
      highlightCeliacMesh(hitMesh);
    }
  });

  window.addEventListener('resize', onCeliacResize);

  animateCeliac();
}

function onCeliacResize() {
  const container = document.getElementById('celiac-canvas-container');
  if (!container || !celiacRenderer || !celiacCamera) return;
  const w = container.clientWidth;
  const h = container.clientHeight;
  if (w && h) {
    celiacCamera.aspect = w / h;
    celiacCamera.updateProjectionMatrix();
    celiacRenderer.setSize(w, h);
  }
}

function loadCeliacGLB() {
  const loader = new THREE.GLTFLoader();
  loader.load('models/celiac_lecture.glb?v=20260913_v26', (gltf) => {
    celiacModelRoot = gltf.scene;
    celiacMeshes = [];

    celiacModelRoot.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.userData.origColor = child.material.color.getHex();
        child.userData.origRoughness = child.material.roughness;
        child.userData.origMetalness = child.material.metalness;
        child.userData.origOpacity = child.material.opacity !== undefined ? child.material.opacity : 1.0;
        child.userData.origTransparent = child.material.transparent || false;

        const nameLow = child.name.toLowerCase();
        // Give vascular meshes rich emissive glow
        if (nameLow.includes('artery') || nameLow.includes('trunk') || nameLow.includes('aorta')) {
          child.material.emissive = new THREE.Color(0x66080a);
          child.material.emissiveIntensity = 0.35;
        } else if (nameLow.includes('vein')) {
          child.material.emissive = new THREE.Color(0x0a1e66);
          child.material.emissiveIntensity = 0.25;
        }

        celiacMeshes.push(child);
      }
    });

    celiacScene.add(celiacModelRoot);

    // Add 3D Parametric Anatomical Anastomotic Tubes
    buildAnastomoticVessels();

    // Apply default liver translucency so celiac trunk is immediately visible
    applyLectureVisibilities();

    console.log("Loaded celiac_lecture.glb with", celiacMeshes.length, "meshes.");
  });
}

function buildAnastomoticVessels() {
  if (!celiacScene) return;

  const matRedArtery = new THREE.MeshStandardMaterial({
    color: 0xd90429,
    roughness: 0.18,
    metalness: 0.02,
    emissive: 0x66080a,
    emissiveIntensity: 0.35
  });

  const matBileGreen = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    roughness: 0.22,
    metalness: 0.02,
    emissive: 0x064e3b,
    emissiveIntensity: 0.25
  });

  // 1. Right gastric artery (ĐM Vị Phải - Vòng Bờ Cong Nhỏ)
  // Xuất phát từ ĐM gan riêng/chung, chạy trong mạc nối nhỏ dọc bờ cong nhỏ, nối với ĐM vị trái
  const rGastricPoints = [
    new THREE.Vector3(-0.024, 1.144, 0.056),
    new THREE.Vector3(-0.014, 1.148, 0.062),
    new THREE.Vector3(-0.002, 1.155, 0.058),
    new THREE.Vector3(0.008, 1.164, 0.050),
    new THREE.Vector3(0.015, 1.174, 0.040),
    new THREE.Vector3(0.012, 1.182, 0.032)
  ];
  const rGastricCurve = new THREE.CatmullRomCurve3(rGastricPoints);
  const rGastricGeo = new THREE.TubeGeometry(rGastricCurve, 32, 0.0016, 8, false);
  const rGastricMesh = new THREE.Mesh(rGastricGeo, matRedArtery);
  rGastricMesh.name = 'Right gastric artery';
  rGastricMesh.userData = { landmarkId: 'right_gastric_artery', origColor: 0xd90429 };
  celiacScene.add(rGastricMesh);
  celiacMeshes.push(rGastricMesh);

  // 1b. Esophageal branches of Left Gastric Artery (Nhánh Thực Quản của ĐM Vị Trái)
  // Đi qua lỗ tâm vị cơ hoành nuôi đoạn dưới thực quản
  const esoPoints = [
    new THREE.Vector3(0.012, 1.182, 0.042),
    new THREE.Vector3(0.014, 1.198, 0.038),
    new THREE.Vector3(0.012, 1.215, 0.032)
  ];
  const esoCurve = new THREE.CatmullRomCurve3(esoPoints);
  const esoGeo = new THREE.TubeGeometry(esoCurve, 20, 0.0013, 8, false);
  const esoMesh = new THREE.Mesh(esoGeo, matRedArtery);
  esoMesh.name = 'Esophageal branch of left gastric artery';
  esoMesh.userData = { landmarkId: 'left_gastric_artery', origColor: 0xd90429 };
  celiacScene.add(esoMesh);
  celiacMeshes.push(esoMesh);

  // 2a. Right gastro-omental artery (ĐM Vị - Mạc Nối Phải)
  // Xuất phát từ ĐM vị tá tràng, chạy trong 2 lá mạc nối lớn dọc nửa phải bờ cong lớn
  const rOmentalPoints = [
    new THREE.Vector3(-0.024, 1.128, 0.072),
    new THREE.Vector3(-0.012, 1.102, 0.082),
    new THREE.Vector3(0.010, 1.090, 0.085),
    new THREE.Vector3(0.038, 1.086, 0.085)
  ];
  const rOmentalCurve = new THREE.CatmullRomCurve3(rOmentalPoints);
  const rOmentalGeo = new THREE.TubeGeometry(rOmentalCurve, 28, 0.0018, 8, false);
  const rOmentalMesh = new THREE.Mesh(rOmentalGeo, matRedArtery);
  rOmentalMesh.name = 'Right gastro-omental artery';
  rOmentalMesh.userData = { landmarkId: 'right_gastroepiploic', origColor: 0xd90429 };
  celiacScene.add(rOmentalMesh);
  celiacMeshes.push(rOmentalMesh);

  // 2b. Left gastro-omental artery (ĐM Vị - Mạc Nối Trái)
  // Tách từ ĐM lách gần rốn lách, chạy trong mạc nối lớn dọc nửa trái bờ cong lớn nối với nhánh phải
  const lOmentalPoints = [
    new THREE.Vector3(0.038, 1.086, 0.085),
    new THREE.Vector3(0.060, 1.092, 0.082),
    new THREE.Vector3(0.082, 1.106, 0.074),
    new THREE.Vector3(0.098, 1.126, 0.060),
    new THREE.Vector3(0.110, 1.148, 0.046),
    new THREE.Vector3(0.113, 1.168, 0.034),
    new THREE.Vector3(0.108, 1.186, 0.020),
    new THREE.Vector3(0.101, 1.194, 0.008),
    new THREE.Vector3(0.090, 1.190, -0.015)
  ];
  const lOmentalCurve = new THREE.CatmullRomCurve3(lOmentalPoints);
  const lOmentalGeo = new THREE.TubeGeometry(lOmentalCurve, 40, 0.0018, 8, false);
  const lOmentalMesh = new THREE.Mesh(lOmentalGeo, matRedArtery);
  lOmentalMesh.name = 'Left gastro-omental artery';
  lOmentalMesh.userData = { landmarkId: 'left_gastroepiploic', origColor: 0xd90429 };
  celiacScene.add(lOmentalMesh);
  celiacMeshes.push(lOmentalMesh);

  // 2c. Rami gastrici (Các Nhánh Thẳng Xiên Thành Dạ Dày từ Vòng Bờ Cong Lớn)
  // Như trong tranh Netter BP 64: các nhánh nhỏ chạy từ cung mạch lên mặt trước thành dạ dày
  const ramiGastriciCoords = [
    [ new THREE.Vector3(0.005, 1.090, 0.085), new THREE.Vector3(0.006, 1.102, 0.081), new THREE.Vector3(0.008, 1.112, 0.076) ],
    [ new THREE.Vector3(0.028, 1.086, 0.085), new THREE.Vector3(0.028, 1.098, 0.082), new THREE.Vector3(0.030, 1.108, 0.078) ],
    [ new THREE.Vector3(0.050, 1.090, 0.083), new THREE.Vector3(0.050, 1.102, 0.080), new THREE.Vector3(0.052, 1.112, 0.075) ],
    [ new THREE.Vector3(0.075, 1.102, 0.076), new THREE.Vector3(0.074, 1.112, 0.072), new THREE.Vector3(0.072, 1.124, 0.068) ],
    [ new THREE.Vector3(0.095, 1.122, 0.062), new THREE.Vector3(0.092, 1.132, 0.058), new THREE.Vector3(0.088, 1.142, 0.052) ],
    [ new THREE.Vector3(0.108, 1.146, 0.048), new THREE.Vector3(0.104, 1.152, 0.044), new THREE.Vector3(0.098, 1.160, 0.040) ]
  ];

  ramiGastriciCoords.forEach((pts, idx) => {
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, 14, 0.0008, 6, false);
    const mesh = new THREE.Mesh(geo, matRedArtery);
    mesh.name = `Ramus gastricus ${idx + 1}`;
    mesh.userData = { landmarkId: idx < 3 ? 'right_gastroepiploic' : 'left_gastroepiploic', origColor: 0xd90429 };
    celiacScene.add(mesh);
    celiacMeshes.push(mesh);
  });

  // 3. Short gastric arteries (Chùm 5 Động Mạch Vị Ngắn - Đáy Vị)
  // Tách từ rốn lách đi trong dây chằng vị lách tỏa quạt lên vòm đáy vị (Fundus) chuẩn Netter BP 64
  const shortGastricBranches = [
    [
      new THREE.Vector3(0.088, 1.176, 0.005),
      new THREE.Vector3(0.096, 1.196, 0.016),
      new THREE.Vector3(0.088, 1.218, 0.024)
    ],
    [
      new THREE.Vector3(0.087, 1.172, 0.003),
      new THREE.Vector3(0.094, 1.192, 0.014),
      new THREE.Vector3(0.084, 1.220, 0.020)
    ],
    [
      new THREE.Vector3(0.086, 1.168, 0.001),
      new THREE.Vector3(0.090, 1.188, 0.010),
      new THREE.Vector3(0.078, 1.223, 0.018)
    ],
    [
      new THREE.Vector3(0.085, 1.165, -0.001),
      new THREE.Vector3(0.086, 1.185, 0.008),
      new THREE.Vector3(0.072, 1.226, 0.015)
    ],
    [
      new THREE.Vector3(0.084, 1.162, -0.003),
      new THREE.Vector3(0.082, 1.180, 0.006),
      new THREE.Vector3(0.066, 1.226, 0.014)
    ]
  ];

  shortGastricBranches.forEach((pts, idx) => {
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, 18, 0.0010, 8, false);
    const mesh = new THREE.Mesh(geo, matRedArtery);
    mesh.name = `Short gastric arteries ${idx + 1}`;
    mesh.userData = { landmarkId: 'short_gastric_arteries', origColor: 0xd90429 };
    celiacScene.add(mesh);
    celiacMeshes.push(mesh);
  });

  // 4. Cystic artery to gallbladder (ĐM Túi Mật trong tam giác Calot)
  const cysticPoints = [
    new THREE.Vector3(-0.030, 1.156, 0.058),
    new THREE.Vector3(-0.038, 1.148, 0.058),
    new THREE.Vector3(-0.044, 1.140, 0.057)
  ];
  const cysticCurve = new THREE.CatmullRomCurve3(cysticPoints);
  const cysticGeo = new THREE.TubeGeometry(cysticCurve, 20, 0.0013, 8, false);
  const cysticMesh = new THREE.Mesh(cysticGeo, matRedArtery);
  cysticMesh.name = 'Cystic artery';
  cysticMesh.userData = { landmarkId: 'cystic_artery', origColor: 0xd90429 };
  celiacScene.add(cysticMesh);
  celiacMeshes.push(cysticMesh);

  // 5. Common bile duct (Ống Mật Chủ)
  const bilePoints = [
    new THREE.Vector3(-0.036, 1.155, 0.055),
    new THREE.Vector3(-0.030, 1.142, 0.056),
    new THREE.Vector3(-0.024, 1.128, 0.054),
    new THREE.Vector3(-0.020, 1.112, 0.050)
  ];
  const bileCurve = new THREE.CatmullRomCurve3(bilePoints);
  const bileGeo = new THREE.TubeGeometry(bileCurve, 28, 0.0022, 8, false);
  const bileMesh = new THREE.Mesh(bileGeo, matBileGreen);
  bileMesh.name = 'Common bile duct';
  bileMesh.userData = { landmarkId: 'portal_vein', origColor: 0x10b981 };
  celiacScene.add(bileMesh);
  celiacMeshes.push(bileMesh);
}

function applyLectureVisibilities() {
  if (!celiacMeshes) return;

  celiacMeshes.forEach((m) => {
    // If explicitly hidden by user, keep it hidden
    if (celiacHiddenMeshes.has(m)) {
      m.visible = false;
      return;
    }

    const n = m.name.toLowerCase();

    // Arteries Solo Mode
    if (celiacSoloArteries) {
      if (n.includes('artery') || n.includes('trunk') || n.includes('aorta') || n.includes('vein') || n.includes('duct') || n.includes('arch')) {
        m.visible = true;
        m.material.transparent = false;
        m.material.opacity = 1.0;
      } else {
        // Ghost mode for solid organs
        m.visible = true;
        m.material.transparent = true;
        m.material.opacity = 0.08;
      }
      return;
    }

    // Stomach mode
    if (n.includes('stomach')) {
      if (celiacStomachMode === 0) {
        m.visible = true;
        m.material.transparent = false;
        m.material.opacity = 1.0;
      } else if (celiacStomachMode === 1) {
        m.visible = true;
        m.material.transparent = true;
        m.material.opacity = 0.20;
      } else {
        m.visible = false;
      }
      return;
    }

    // Liver mode
    if (n.includes('liver') || n.includes('segment')) {
      if (celiacLiverMode === 0) {
        m.visible = true;
        m.material.transparent = false;
        m.material.opacity = 1.0;
      } else if (celiacLiverMode === 1) {
        m.visible = true;
        m.material.transparent = true;
        m.material.opacity = 0.30;
      } else {
        m.visible = false;
      }
      return;
    }

    m.visible = true;
    m.material.transparent = m.userData.origTransparent || false;
    m.material.opacity = m.userData.origOpacity !== undefined ? m.userData.origOpacity : 1.0;
  });
}

function cycleLectureStomach() {
  celiacStomachMode = (celiacStomachMode + 1) % 3;
  const labels = ['Rõ', 'Mờ (X-Ray)', 'Ẩn'];
  const txt = document.getElementById('txt-lec-stomach');
  if (txt) txt.textContent = labels[celiacStomachMode];
  applyLectureVisibilities();
}

function cycleLectureLiver() {
  celiacLiverMode = (celiacLiverMode + 1) % 3;
  const labels = ['Rõ', 'Mờ (X-Ray)', 'Ẩn'];
  const txt = document.getElementById('txt-lec-liver');
  if (txt) txt.textContent = labels[celiacLiverMode];
  applyLectureVisibilities();
}

function toggleLectureArteriesSolo() {
  celiacSoloArteries = !celiacSoloArteries;
  const btn = document.getElementById('btn-lec-solo');
  if (btn) btn.classList.toggle('active', celiacSoloArteries);
  applyLectureVisibilities();
}

function resetLectureCamera() {
  celiacCamPos = new THREE.Vector3(0.0084, 1.155, 0.38);
  celiacCamTarget = new THREE.Vector3(0.0084, 1.148, 0.025);
}

function setNetterViewpoint() {
  // Góc nhìn chuẩn xác bộc lộ toàn cảnh theo tranh Netter Plate BP 64
  celiacCamTarget = new THREE.Vector3(0.015, 1.148, 0.030);
  celiacCamPos = new THREE.Vector3(0.015, 1.135, 0.32);
}

function toggleLectureAutoRotate() {
  celiacAutoRotate = !celiacAutoRotate;
  const btn = document.getElementById('btn-lec-rotate');
  if (btn) btn.classList.toggle('active', celiacAutoRotate);
}

function selectLectureLandmark(lmId) {
  const lm = CELIAC_LANDMARKS.find(l => l.id === lmId);
  if (!lm) return;

  // Highlight card in right panel
  document.querySelectorAll('.lec-landmark-card').forEach(c => c.classList.remove('active'));
  const card = document.getElementById(`lec-card-${lm.id}`);
  if (card) {
    card.classList.add('active');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Update floating info badge
  const title = document.getElementById('lec-badge-title');
  const latin = document.getElementById('lec-badge-latin');
  const desc = document.getElementById('lec-badge-desc');
  if (title) title.innerHTML = `<i class="fa-solid fa-crosshairs" style="color: #facc15;"></i> ${lm.vi}`;
  if (latin) latin.textContent = `${lm.latin} • ${lm.en}`;
  if (desc) desc.textContent = lm.desc;

  // Find matching mesh to highlight in neon gold
  const targetMesh = celiacMeshes.find(m => {
    const mn = m.name.toLowerCase();
    if (m.userData.landmarkId === lm.id) return true;
    if (lm.id === 'celiac_trunk' && mn.includes('coeliac')) return true;
    if (lm.id === 'left_gastric_artery' && mn.includes('left gastric')) return true;
    if (lm.id === 'splenic_artery' && mn.includes('splenic artery')) return true;
    if (lm.id === 'common_hepatic_artery' && mn.includes('common hepatic')) return true;
    if (lm.id === 'proper_hepatic_artery' && mn.includes('proper hepatic')) return true;
    if (lm.id === 'gastroduodenal_artery' && mn.includes('gastroduodenal')) return true;
    if (lm.id === 'spleen' && mn.includes('spleen')) return true;
    if (lm.id === 'portal_vein' && mn.includes('portal')) return true;
    if (lm.id === 'abdominal_aorta' && mn.includes('aorta')) return true;
    if (lm.id === 'pancreas_duodenum' && (mn.includes('pancreas') || mn.includes('duodenum'))) return true;
    return false;
  });

  if (targetMesh) {
    highlightCeliacMesh(targetMesh);
  }

  // Glide camera to landmark
  const target = new THREE.Vector3(lm.camTarget[0], lm.camTarget[1], lm.camTarget[2]);
  const dir = new THREE.Vector3(0, 0.02, lm.camDist);
  celiacCamTarget = target;
  celiacCamPos = target.clone().add(dir);
}

function focusCeliacSelection() {
  if (celiacSelectedMesh) {
    const box = new THREE.Box3().setFromObject(celiacSelectedMesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    celiacCamTarget = center;
    celiacCamPos = center.clone().add(new THREE.Vector3(0, 0, Math.max(maxDim * 2.2, 0.12)));
  }
}

function highlightCeliacMesh(mesh) {
  // Revert previously selected meshes
  if (window.celiacSelectedMeshes && window.celiacSelectedMeshes.length > 0) {
    window.celiacSelectedMeshes.forEach(m => {
      if (m && m.material && m.userData.origColor !== undefined) {
        m.material.color.setHex(m.userData.origColor);
        m.material.emissiveIntensity = 0.35;
      }
    });
  } else if (celiacSelectedMesh && celiacSelectedMesh.userData.origColor !== undefined) {
    celiacSelectedMesh.material.color.setHex(celiacSelectedMesh.userData.origColor);
    celiacSelectedMesh.material.emissiveIntensity = 0.35;
  }

  celiacSelectedMesh = mesh;
  let toHighlight = [mesh];
  if (mesh.userData.landmarkId === 'short_gastric_arteries') {
    toHighlight = celiacMeshes.filter(m => m.userData.landmarkId === 'short_gastric_arteries');
  }
  window.celiacSelectedMeshes = toHighlight;

  toHighlight.forEach(m => {
    if (m && m.material) {
      m.material.color.setHex(0xfacc15); // Neon Gold Highlight
      m.material.emissive.setHex(0x5a4800);
      m.material.emissiveIntensity = 0.65;
    }
  });

  // Retrieve comprehensive Vietnamese & Latin anatomical data
  const info = getCeliacStructureInfo(mesh.name, mesh.userData.landmarkId);

  // Sync with matching landmark card in right panel if available
  document.querySelectorAll('.lec-landmark-card').forEach(c => c.classList.remove('active'));
  if (info.landmarkId) {
    const card = document.getElementById(`lec-card-${info.landmarkId}`);
    if (card) {
      card.classList.add('active');
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // Update floating info badge with 100% Vietnamese & Latin
  const title = document.getElementById('lec-badge-title');
  const latin = document.getElementById('lec-badge-latin');
  const desc = document.getElementById('lec-badge-desc');
  if (title) title.innerHTML = `<i class="fa-solid fa-crosshairs" style="color: #facc15;"></i> ${info.vi}`;
  if (latin) latin.textContent = `${info.latin}${info.en ? ' • ' + info.en : ''}`;
  if (desc) desc.textContent = info.desc;
}

function getCeliacMeshesForLandmark(lmId) {
  return celiacMeshes.filter(m => {
    const mn = m.name.toLowerCase();
    if (m.userData.landmarkId === lmId) return true;
    const info = getCeliacStructureInfo(m.name, m.userData.landmarkId);
    if (info.landmarkId === lmId) return true;
    if (lmId === 'celiac_trunk' && (mn.includes('coeliac') || mn.includes('celiac'))) return true;
    if (lmId === 'left_gastric_artery' && mn.includes('left gastric')) return true;
    if (lmId === 'splenic_artery' && mn.includes('splenic')) return true;
    if (lmId === 'common_hepatic_artery' && mn.includes('common hepatic')) return true;
    if (lmId === 'proper_hepatic_artery' && (mn.includes('proper hepatic') || mn.includes('liver') || mn.includes('segment of liver'))) return true;
    if (lmId === 'gastroduodenal_artery' && mn.includes('gastroduodenal')) return true;
    if (lmId === 'spleen' && mn.includes('spleen')) return true;
    if (lmId === 'portal_vein' && (mn.includes('portal') || mn.includes('bile'))) return true;
    if (lmId === 'abdominal_aorta' && (mn.includes('aorta') || mn.includes('phrenic'))) return true;
    if (lmId === 'pancreas_duodenum' && (mn.includes('pancreas') || mn.includes('duodenum') || mn.includes('pancreaticoduodenal'))) return true;
    if (lmId === 'cystic_artery' && (mn.includes('cystic') || mn.includes('gallbladder'))) return true;
    if (lmId === 'right_gastric_artery' && mn.includes('right gastric')) return true;
    if (lmId === 'right_gastroepiploic' && (mn.includes('right gastro-omental') || mn.includes('gastro-omental arch') || mn.includes('omental') || mn.includes('gastroepiploic'))) return true;
    if (lmId === 'left_gastroepiploic' && mn.includes('left gastro-omental')) return true;
    if (lmId === 'short_gastric_arteries' && mn.includes('short gastric')) return true;
    return false;
  });
}

function hideCeliacSelected() {
  if (!celiacSelectedMesh) return;
  celiacSelectedMesh.visible = false;
  celiacHiddenMeshes.add(celiacSelectedMesh);

  // If stomach or liver, reflect in toolbar text
  const n = celiacSelectedMesh.name.toLowerCase();
  if (n.includes('stomach')) {
    celiacStomachMode = 2;
    const txt = document.getElementById('txt-lec-stomach');
    if (txt) txt.textContent = 'Ẩn';
  } else if (n.includes('liver') || n.includes('segment')) {
    celiacLiverMode = 2;
    const txt = document.getElementById('txt-lec-liver');
    if (txt) txt.textContent = 'Ẩn';
  }

  updateCeliacHiddenUI();
  updateCeliacUnhideButton();
}

function toggleHideCeliacLandmark(lmId, event) {
  if (event) event.stopPropagation();
  const meshes = getCeliacMeshesForLandmark(lmId);
  if (meshes.length === 0) return;

  const isAnyHidden = meshes.some(m => celiacHiddenMeshes.has(m) || !m.visible);
  meshes.forEach(m => {
    if (isAnyHidden) {
      m.visible = true;
      celiacHiddenMeshes.delete(m);
    } else {
      m.visible = false;
      celiacHiddenMeshes.add(m);
    }
  });

  // If stomach or liver, sync toolbar buttons
  if (lmId.includes('stomach') || lmId === 'stomach') {
    celiacStomachMode = isAnyHidden ? 0 : 2;
    const txt = document.getElementById('txt-lec-stomach');
    if (txt) txt.textContent = isAnyHidden ? 'Rõ' : 'Ẩn';
  }
  if (lmId.includes('liver') || lmId === 'liver') {
    celiacLiverMode = isAnyHidden ? 0 : 2;
    const txt = document.getElementById('txt-lec-liver');
    if (txt) txt.textContent = isAnyHidden ? 'Rõ' : 'Ẩn';
  }

  updateCeliacHiddenUI();
  updateCeliacUnhideButton();
}

function unhideAllCeliacMeshes() {
  celiacHiddenMeshes.forEach(m => {
    m.visible = true;
  });
  celiacHiddenMeshes.clear();
  celiacStomachMode = 0;
  celiacLiverMode = 1;
  celiacSoloArteries = false;

  const btnSolo = document.getElementById('btn-lec-solo');
  if (btnSolo) btnSolo.classList.remove('active');
  const txtS = document.getElementById('txt-lec-stomach');
  if (txtS) txtS.textContent = 'Rõ';
  const txtL = document.getElementById('txt-lec-liver');
  if (txtL) txtL.textContent = 'Mờ (X-Ray)';

  applyLectureVisibilities();
  updateCeliacHiddenUI();
  updateCeliacUnhideButton();
}

function updateCeliacUnhideButton() {
  const btn = document.getElementById('btn-lec-unhide-all');
  const countSpan = document.getElementById('lec-hidden-count');
  if (!btn) return;
  if (celiacHiddenMeshes.size > 0) {
    btn.style.display = 'inline-flex';
    if (countSpan) countSpan.textContent = celiacHiddenMeshes.size;
  } else {
    btn.style.display = 'none';
  }
}

function updateCeliacHiddenUI() {
  CELIAC_LANDMARKS.forEach(lm => {
    const card = document.getElementById(`lec-card-${lm.id}`);
    const eyeBtn = document.getElementById(`lec-eye-${lm.id}`);
    if (!card || !eyeBtn) return;
    const meshes = getCeliacMeshesForLandmark(lm.id);
    const isHidden = meshes.some(m => celiacHiddenMeshes.has(m) || !m.visible);
    if (isHidden) {
      card.classList.add('is-hidden');
      eyeBtn.innerHTML = '<i class="fa-solid fa-eye-slash" style="color: #ff4757;"></i>';
      eyeBtn.title = 'Hiện cấu trúc này';
    } else {
      card.classList.remove('is-hidden');
      eyeBtn.innerHTML = '<i class="fa-solid fa-eye" style="color: var(--text-muted);"></i>';
      eyeBtn.title = 'Ẩn cấu trúc này';
    }
  });
}

function toggleLectureSidebar() {
  celiacSidebarHidden = !celiacSidebarHidden;
  const col = document.querySelector('.lec-study-col');
  const txt = document.getElementById('txt-lec-sidebar');
  const icon = document.getElementById('icon-lec-sidebar');
  const btn = document.getElementById('btn-lec-toggle-sidebar');
  if (col) {
    col.style.display = celiacSidebarHidden ? 'none' : 'flex';
  }
  if (txt) txt.textContent = celiacSidebarHidden ? 'Hiện Bài Giảng' : 'Ẩn Bài Giảng';
  if (icon) icon.className = celiacSidebarHidden ? 'fa-solid fa-book-open' : 'fa-solid fa-table-columns';
  if (btn) btn.classList.toggle('active', celiacSidebarHidden);
  setTimeout(onCeliacResize, 60);
}

function animateCeliac() {
  celiacAnimId = requestAnimationFrame(animateCeliac);

  if (!celiacRenderer || !celiacScene || !celiacCamera) return;

  // Smooth camera interpolation
  if (celiacCamPos && celiacCamTarget) {
    celiacCamera.position.lerp(celiacCamPos, 0.08);
    celiacControls.target.lerp(celiacCamTarget, 0.08);
    if (celiacCamera.position.distanceTo(celiacCamPos) < 0.002) {
      celiacCamPos = null;
      celiacCamTarget = null;
    }
  }

  // Pulsing gold highlight on selected mesh
  if (celiacSelectedMesh && celiacSelectedMesh.material) {
    const pulse = 0.50 + 0.30 * Math.sin(Date.now() * 0.008);
    celiacSelectedMesh.material.emissiveIntensity = pulse;
  }

  // Auto-rotate around target
  if (celiacAutoRotate && celiacControls) {
    celiacControls.autoRotate = true;
    celiacControls.autoRotateSpeed = 2.0;
  } else if (celiacControls) {
    celiacControls.autoRotate = false;
  }

  celiacControls.update();
  celiacRenderer.render(celiacScene, celiacCamera);
}

function viewCeliacInFullBody() {
  closeCeliacLecture();

  // Activate Skeletal, Arterial (Layer 3), Venous (Layer 2), Digestive
  SYSTEMS_CONFIG.skeletal.active = true;
  SYSTEMS_CONFIG.arterial.active = true;
  SYSTEMS_CONFIG.arterial.layer = 3;
  SYSTEMS_CONFIG.venous.active = true;
  SYSTEMS_CONFIG.venous.layer = 2;
  SYSTEMS_CONFIG.digestive.active = true;

  updateBottomBarUI();
  updatePanelSteppersUI();
  applyAllSystemsVisibility();

  // Find Celiac trunk in main meshes
  const celiacMesh = allMeshes.find(m => m.userData.cleanName && m.userData.cleanName.toLowerCase().includes('coeliac trunk'));
  if (celiacMesh) {
    celiacMesh.visible = true;
    selectOrgan(celiacMesh);
    focusSelected();
  } else {
    smoothMoveCamera(new THREE.Vector3(0, 1.15, 0.6), new THREE.Vector3(0, 1.15, 0));
  }
}

// ========================================================
// CHẾ ĐỘ HỌC TẬP TÙY CHỌN (SELECTIVE STUDY & FLASHCARD MODE)
// ========================================================
let isStudyMode = false;
let studyList = []; // Array of { cleanName, viName, latinName, enName, system, meshRef }
let currentStudyIndex = 0;
let studyDisplayMode = 'ghost'; // 'ghost' | 'isolate' | 'normal'
let studyMemorized = new Set();
let isFlashcardAnswerRevealed = false;
let isStudyPanelCollapsed = false;
let studyActiveTab = 'list';

function initStudyMode() {
  loadStudyFromStorage();
  initStudySearch();
  renderStudyUI();
}

function initStudySearch() {
  const input = document.getElementById('study-search-input');
  const resultsEl = document.getElementById('study-search-results');
  if (!input || !resultsEl) return;

  input.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (!query || query.length < 2) {
      resultsEl.style.display = 'none';
      return;
    }

    const matched = findAnatomySearchResults(query);

    if (matched.length === 0) {
      resultsEl.innerHTML = '<div style="padding: 10px; font-size: 0.76rem; color: #64748b; text-align: center;">Không tìm thấy chi tiết phù hợp</div>';
      resultsEl.style.display = 'block';
      return;
    }

    resultsEl.innerHTML = matched.slice(0, 8).map(m => {
      const isMeshObj = m.isMesh && m.meshRef;
      const inStudy = isMeshObj ? isMeshInStudy(m.meshRef) : false;
      const cleanEscaped = (m.cleanName || '').replace(/'/g, "\\'");
      return `
        <div class="search-item" onclick="onSelectStudySearchResult('${cleanEscaped}')" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div class="search-item-title">${m.viName || m.cleanName}</div>
            <div class="search-item-sub">${m.latinName || m.enName}</div>
          </div>
          <span style="font-size: 0.70rem; font-weight: 700; color: ${inStudy ? '#10b981' : '#facc15'};">${inStudy ? '✓ Đã có' : '+ Thêm'}</span>
        </div>
      `;
    }).join('');
    resultsEl.style.display = 'block';
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.study-search-wrap')) {
      resultsEl.style.display = 'none';
    }
  });
}

async function onSelectStudySearchResult(cleanName) {
  let mesh = allMeshes.find(m => m.userData.cleanName && (m.userData.cleanName.toLowerCase() === cleanName.toLowerCase() || m.userData.cleanName.toLowerCase().startsWith(cleanName.toLowerCase())));
  if (!mesh) {
    const catItem = PREINDEXED_NERVES_CATALOG.find(c => c.cleanName.toLowerCase() === cleanName.toLowerCase());
    if (catItem && catItem.sourceFile) {
      showStudyToast(`Đang nạp mô hình ${catItem.viName}...`);
      await loadModelFile(catItem.sourceFile);
      mesh = allMeshes.find(m => m.userData.cleanName && (m.userData.cleanName.toLowerCase() === cleanName.toLowerCase() || m.userData.cleanName.toLowerCase().startsWith(cleanName.toLowerCase())));
    }
  }

  if (mesh) {
    if (mesh.userData.system === 'nervous') {
      SYSTEMS_CONFIG.nervous.active = true;
      SYSTEMS_CONFIG.nervous.statusText = 'Bật';
      updateBottomBarUI();
      updatePanelSteppersUI();
      applyAllSystemsVisibility();
    }
    mesh.visible = true;
    mesh.userData.isHidden = false;
    if (!isMeshInStudy(mesh)) {
      addMeshToStudy(mesh);
    } else {
      showStudyToast(`"${mesh.userData.viName || cleanName}" đã có trong bộ học!`);
    }
    selectOrgan(mesh);
    focusSelected();
  }
  const input = document.getElementById('study-search-input');
  const resultsEl = document.getElementById('study-search-results');
  if (input) input.value = '';
  if (resultsEl) resultsEl.style.display = 'none';
}

function toggleStudyMode() {
  if (isStudyMode) {
    closeStudyMode();
  } else {
    openStudyMode();
  }
}

function openStudyMode() {
  isStudyMode = true;
  const btn = document.getElementById('btn-study-mode');
  if (btn) btn.classList.add('active');

  const panel = document.getElementById('study-panel');
  if (panel) {
    panel.classList.remove('hidden');
    panel.classList.remove('minimized');
    isStudyPanelCollapsed = false;
  }

  if (studyList.length === 0) {
    loadStudyFromStorage();
  }
  if (studyList.length === 0) {
    loadStudyPreset('cardio', false);
  }

  applyStudyVisuals();
  renderStudyUI();
  updateInspectStudyButton();
  showStudyToast('🎓 Đã bật Chế Độ Học Tập: Nhấp chọn chi tiết 3D để thêm vào bộ học!');
}

function closeStudyMode() {
  isStudyMode = false;
  const btn = document.getElementById('btn-study-mode');
  if (btn) btn.classList.remove('active');

  const panel = document.getElementById('study-panel');
  if (panel) panel.classList.add('hidden');

  resetStudyVisuals();
  updateInspectStudyButton();
  showStudyToast('Đã tắt Chế Độ Học Tập');
}

function toggleStudyPanelCollapse() {
  const panel = document.getElementById('study-panel');
  const icon = document.getElementById('icon-study-collapse');
  if (!panel) return;
  isStudyPanelCollapsed = !isStudyPanelCollapsed;
  panel.classList.toggle('minimized', isStudyPanelCollapsed);
  if (icon) {
    icon.className = isStudyPanelCollapsed ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up';
  }
}

function isMeshInStudy(mesh) {
  if (!mesh || !mesh.userData || !mesh.userData.cleanName) return false;
  const target = mesh.userData.cleanName.toLowerCase();
  return studyList.some(s => s.cleanName.toLowerCase() === target);
}

function addMeshToStudy(mesh) {
  if (!mesh || !mesh.userData || !mesh.userData.cleanName) return;
  if (isMeshInStudy(mesh)) {
    showStudyToast(`"${mesh.userData.viName || mesh.userData.cleanName}" đã có trong bộ học!`);
    return;
  }

  studyList.push({
    cleanName: mesh.userData.cleanName,
    viName: mesh.userData.viName || mesh.userData.cleanName,
    latinName: mesh.userData.latinName || mesh.userData.cleanName,
    enName: mesh.userData.enName || mesh.userData.cleanName,
    system: mesh.userData.system || 'skeletal',
    meshRef: mesh
  });

  saveStudyToStorage();
  applyStudyVisuals();
  renderStudyUI();
  updateInspectStudyButton();
  showStudyToast(`✓ Đã thêm "${mesh.userData.viName || mesh.userData.cleanName}" vào bộ học`);
}

function removeMeshFromStudy(cleanName) {
  const cName = cleanName.toLowerCase();
  studyList = studyList.filter(s => s.cleanName.toLowerCase() !== cName);
  studyMemorized.delete(cleanName);

  if (currentStudyIndex >= studyList.length) {
    currentStudyIndex = Math.max(0, studyList.length - 1);
  }

  saveStudyToStorage();
  applyStudyVisuals();
  renderStudyUI();
  updateInspectStudyButton();
}

function clearStudyList() {
  studyList = [];
  studyMemorized.clear();
  currentStudyIndex = 0;
  saveStudyToStorage();
  applyStudyVisuals();
  renderStudyUI();
  updateInspectStudyButton();
  showStudyToast('Đã xóa danh sách học tập');
}

function toggleInspectStudy() {
  if (!selectedMesh) return;
  if (isMeshInStudy(selectedMesh)) {
    removeMeshFromStudy(selectedMesh.userData.cleanName);
    showStudyToast(`Đã bỏ "${selectedMesh.userData.viName || selectedMesh.userData.cleanName}" khỏi bộ học`);
  } else {
    if (!isStudyMode) openStudyMode();
    addMeshToStudy(selectedMesh);
  }
  updateInspectStudyButton();
}

function updateInspectStudyButton() {
  const btn = document.getElementById('btn-inspect-add-study');
  const txt = document.getElementById('txt-inspect-add-study');
  const icon = document.getElementById('icon-inspect-study');
  if (!btn || !txt || !icon) return;

  if (selectedMesh && isMeshInStudy(selectedMesh)) {
    btn.style.background = 'rgba(239, 68, 68, 0.15)';
    btn.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    btn.style.color = '#f87171';
    icon.className = 'fa-solid fa-bookmark';
    txt.textContent = '✓ Đã trong Bộ Học (Bấm để bỏ)';
  } else {
    btn.style.background = 'rgba(250, 204, 21, 0.12)';
    btn.style.borderColor = 'rgba(250, 204, 21, 0.4)';
    btn.style.color = '#fde047';
    icon.className = 'fa-regular fa-bookmark';
    txt.textContent = '+ Thêm Vào Bộ Học';
  }
}

function setStudyDisplayMode(mode) {
  studyDisplayMode = mode;
  ['ghost', 'isolate', 'normal'].forEach(m => {
    const el = document.getElementById(`opt-study-${m}`);
    if (el) el.classList.toggle('active', m === mode);
  });
  applyStudyVisuals();
}

function applyStudyVisuals() {
  if (!isStudyMode || studyList.length === 0) {
    resetStudyVisuals();
    return;
  }

  const studyMap = new Map();
  studyList.forEach((s, idx) => {
    studyMap.set(s.cleanName.toLowerCase(), idx);
  });

  allMeshes.forEach(m => {
    if (m.userData.isHidden) {
      m.visible = false;
      return;
    }

    const name = (m.userData.cleanName || '').toLowerCase();
    const isStudy = studyMap.has(name);
    const isCurrent = isStudy && (studyMap.get(name) === currentStudyIndex);

    if (studyDisplayMode === 'isolate') {
      m.visible = isStudy;
      if (isStudy) {
        m.material.transparent = false;
        m.material.opacity = 1.0;
        if (isCurrent) {
          m.material.emissive.setHex(0x5a4800);
          m.material.emissiveIntensity = 0.6;
        } else {
          m.material.emissive.setHex(0x000000);
          m.material.emissiveIntensity = 0.0;
        }
      }
    } else if (studyDisplayMode === 'ghost') {
      m.visible = true;
      if (isStudy) {
        m.material.transparent = false;
        m.material.opacity = 1.0;
        if (isCurrent) {
          m.material.emissive.setHex(0x5a4800);
          m.material.emissiveIntensity = 0.7;
        } else {
          m.material.emissive.setHex(0x2a2000);
          m.material.emissiveIntensity = 0.25;
        }
      } else {
        m.material.transparent = true;
        m.material.opacity = 0.12;
        m.material.emissive.setHex(0x000000);
        m.material.emissiveIntensity = 0.0;
      }
    } else { // 'normal'
      m.visible = true;
      m.material.transparent = m.userData.origTransparent || false;
      m.material.opacity = m.userData.origOpacity !== undefined ? m.userData.origOpacity : 1.0;
      if (isStudy) {
        if (isCurrent) {
          m.material.emissive.setHex(0x5a4800);
          m.material.emissiveIntensity = 0.7;
        } else {
          m.material.emissive.setHex(0x38bdf8);
          m.material.emissiveIntensity = 0.35;
        }
      } else {
        m.material.emissive.setHex(0x000000);
        m.material.emissiveIntensity = 0.0;
      }
    }
  });
}

function resetStudyVisuals() {
  allMeshes.forEach(m => {
    if (m.userData.isHidden) {
      m.visible = false;
      return;
    }
    const sys = SYSTEMS_CONFIG[m.userData.system];
    m.visible = sys ? sys.active : true;
    m.material.transparent = m.userData.origTransparent || false;
    m.material.opacity = m.userData.origOpacity !== undefined ? m.userData.origOpacity : 1.0;
    const origEmissive = (m.userData.system === 'nervous' && !m.userData.cleanName.toLowerCase().includes('brain')) ? 0x2c2200 : 0x000000;
    m.material.emissive.setHex(origEmissive);
    m.material.emissiveIntensity = origEmissive ? 0.35 : 0.0;
    if (m !== selectedMesh) {
      m.material.color.setHex(m.userData.originalColor);
    }
  });
}

function switchStudyTab(tabName) {
  studyActiveTab = tabName;
  const tabList = document.getElementById('tab-btn-study-list');
  const tabQuiz = document.getElementById('tab-btn-study-quiz');
  const contentList = document.getElementById('study-content-list');
  const contentQuiz = document.getElementById('study-content-quiz');

  if (tabName === 'quiz') {
    if (tabList) tabList.classList.remove('active');
    if (tabQuiz) tabQuiz.classList.add('active');
    if (contentList) contentList.style.display = 'none';
    if (contentQuiz) contentQuiz.style.display = 'flex';
    isFlashcardAnswerRevealed = false;
    if (studyList.length > 0) {
      goToStudyItem(currentStudyIndex);
    }
  } else {
    if (tabList) tabList.classList.add('active');
    if (tabQuiz) tabQuiz.classList.remove('active');
    if (contentList) contentList.style.display = 'flex';
    if (contentQuiz) contentQuiz.style.display = 'none';
  }
}

function startStudyQuiz() {
  if (studyList.length === 0) {
    showStudyToast('⚠️ Hãy thêm ít nhất 1 chi tiết để bắt đầu ôn luyện!');
    return;
  }
  switchStudyTab('quiz');
}

function goToStudyItem(index) {
  if (studyList.length === 0) return;
  currentStudyIndex = Math.max(0, Math.min(index, studyList.length - 1));
  const item = studyList[currentStudyIndex];

  // Resolve mesh
  const mesh = item.meshRef || allMeshes.find(m => m.userData.cleanName && m.userData.cleanName.toLowerCase() === item.cleanName.toLowerCase());
  if (mesh) {
    selectOrgan(mesh);
    focusSelected();
  }

  // Reset Flashcard View
  isFlashcardAnswerRevealed = false;
  const ansBox = document.getElementById('quiz-ans-box');
  const btnRev = document.getElementById('btn-quiz-reveal');
  const flashcard = document.getElementById('study-flashcard');
  if (ansBox) ansBox.style.display = 'none';
  if (btnRev) btnRev.style.display = 'inline-flex';
  if (flashcard) flashcard.classList.remove('revealed');

  // Fill content
  const badgeSys = document.getElementById('quiz-badge-sys');
  const ansVi = document.getElementById('quiz-ans-vi');
  const ansLatin = document.getElementById('quiz-ans-latin');
  const ansDesc = document.getElementById('quiz-ans-desc');

  const sys = SYSTEMS_CONFIG[item.system];
  if (badgeSys) badgeSys.innerHTML = `<i class="fa-solid fa-dna"></i> ${sys ? sys.viName : 'Giải Phẫu'}`;
  if (ansVi) ansVi.textContent = item.viName;
  if (ansLatin) ansLatin.textContent = `${item.latinName} • ${item.enName}`;

  let desc = "Cấu trúc giải phẫu chuẩn quốc tế Terminologia Anatomica.";
  for (let k in anatomyData.clinical) {
    if (item.cleanName.toLowerCase().includes(k.toLowerCase())) {
      desc = anatomyData.clinical[k].desc;
      break;
    }
  }
  if (ansDesc) ansDesc.textContent = desc;

  applyStudyVisuals();
  renderStudyUI();
}

function nextStudyItem() {
  if (currentStudyIndex < studyList.length - 1) {
    goToStudyItem(currentStudyIndex + 1);
  } else {
    showStudyToast('🎉 Bạn đã hoàn thành lượt ôn tập toàn bộ chi tiết!');
  }
}

function prevStudyItem() {
  if (currentStudyIndex > 0) {
    goToStudyItem(currentStudyIndex - 1);
  }
}

function toggleFlashcardAnswer() {
  isFlashcardAnswerRevealed = !isFlashcardAnswerRevealed;
  const ansBox = document.getElementById('quiz-ans-box');
  const btnRev = document.getElementById('btn-quiz-reveal');
  const flashcard = document.getElementById('study-flashcard');

  if (isFlashcardAnswerRevealed) {
    if (ansBox) ansBox.style.display = 'flex';
    if (btnRev) btnRev.style.display = 'none';
    if (flashcard) flashcard.classList.add('revealed');
  } else {
    if (ansBox) ansBox.style.display = 'none';
    if (btnRev) btnRev.style.display = 'inline-flex';
    if (flashcard) flashcard.classList.remove('revealed');
  }
}

function markStudyItem(isMemorized) {
  if (studyList.length === 0) return;
  const item = studyList[currentStudyIndex];
  if (isMemorized) {
    studyMemorized.add(item.cleanName);
    showStudyToast(`✓ Đã ghi nhớ: ${item.viName}`);
  } else {
    studyMemorized.delete(item.cleanName);
    showStudyToast(`Đã chuyển ${item.viName} vào mục cần ôn lại`);
  }
  saveStudyToStorage();
  renderStudyUI();

  // Auto advance to next item
  setTimeout(() => {
    if (currentStudyIndex < studyList.length - 1) {
      nextStudyItem();
    }
  }, 400);
}

function speakCurrentStudyTerm() {
  if (studyList.length === 0) return;
  const item = studyList[currentStudyIndex];
  speakAnatomyTerm(item.viName, 'vi-VN');
}

function speakAnatomyTerm(text, lang = 'vi-VN') {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 0.9;
  window.speechSynthesis.speak(utter);
}

function renderStudyUI() {
  const count = studyList.length;

  // Header badges
  const navBadge = document.getElementById('study-badge');
  if (navBadge) {
    navBadge.textContent = count;
    navBadge.style.display = count > 0 ? 'inline-flex' : 'none';
  }

  const panelCount = document.getElementById('study-panel-count');
  if (panelCount) panelCount.textContent = `${count} chi tiết`;

  const tabCount = document.getElementById('study-tab-count');
  if (tabCount) tabCount.textContent = count;

  // Stepper indicator
  const stepper = document.getElementById('study-stepper-indicator');
  if (stepper) {
    stepper.textContent = count > 0 ? `${currentStudyIndex + 1} / ${count}` : '0 / 0';
  }

  const btnPrev = document.getElementById('btn-study-prev');
  const btnNext = document.getElementById('btn-study-next');
  if (btnPrev) btnPrev.disabled = (currentStudyIndex <= 0);
  if (btnNext) btnNext.disabled = (currentStudyIndex >= count - 1);

  // Quiz progress
  const memCount = studyMemorized.size;
  const pct = count > 0 ? Math.round((memCount / count) * 100) : 0;

  const stepInfo = document.getElementById('quiz-step-info');
  if (stepInfo) stepInfo.textContent = count > 0 ? `Chi tiết ${currentStudyIndex + 1} / ${count}` : '0 / 0';

  const statInfo = document.getElementById('quiz-stat-info');
  if (statInfo) statInfo.textContent = `Đã thuộc: ${memCount}/${count} (${pct}%)`;

  const progFill = document.getElementById('quiz-progress-fill');
  if (progFill) progFill.style.width = `${pct}%`;

  // Render items list
  const listEl = document.getElementById('study-items-list');
  if (!listEl) return;

  if (count === 0) {
    listEl.innerHTML = `
      <div class="study-empty-state">
        <i class="fa-solid fa-graduation-cap"></i>
        <div style="font-weight: 700; color: #cbd5e1;">Chưa có chi tiết nào</div>
        <div style="font-size: 0.74rem;">Nhấp vào bất kỳ cơ quan 3D trên màn hình, hoặc chọn một Bộ mẫu phía trên để bắt đầu học!</div>
      </div>
    `;
    return;
  }

  const sysColors = {
    skeletal: '#e2d5a8', connective: '#38bdf8', muscular: '#f43f5e',
    arterial: '#ef4444', venous: '#3b82f6', lymphatic: '#10b981',
    nervous: '#f59e0b', respiratory: '#06b6d4', digestive: '#f97316',
    endocrine: '#8b5cf6', urogenital: '#a855f7', integumentary: '#ec4899'
  };

  listEl.innerHTML = studyList.map((item, idx) => {
    const isCur = (idx === currentStudyIndex);
    const isMem = studyMemorized.has(item.cleanName);
    const dotColor = sysColors[item.system] || '#facc15';

    return `
      <div class="study-item-card ${isCur ? 'current' : ''}" onclick="goToStudyItem(${idx})">
        <div class="study-item-dot" style="background: ${dotColor};" title="Hệ ${item.system}"></div>
        <div class="study-item-meta">
          <div class="study-item-title">
            ${isMem ? '<i class="fa-solid fa-circle-check" style="color:#10b981; margin-right:4px;"></i>' : ''}
            ${item.viName}
          </div>
          <div class="study-item-sub">${item.latinName || item.enName}</div>
        </div>
        <div class="study-item-actions" onclick="event.stopPropagation();">
          <button class="study-btn-del" onclick="removeMeshFromStudy('${item.cleanName.replace(/'/g, "\\'")}')" title="Xóa khỏi bộ học"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </div>
    `;
  }).join('');
}

function loadStudyPreset(presetKey, notify = true) {
  const presetConfig = {
    cardio: {
      systems: ['skeletal', 'arterial', 'venous'],
      queries: ['Heart', 'Arch of aorta', 'Superior vena cava', 'Pulmonary trunk', 'Ascending aorta', 'Thoracic aorta']
    },
    visceral: {
      systems: ['skeletal', 'digestive'],
      queries: ['Stomach', 'Liver', 'Gallbladder', 'Pancreas', 'Spleen', 'Duodenum']
    },
    nervous: {
      systems: ['skeletal', 'nervous'],
      queries: ['Brain', 'Spinal cord', 'Sciatic nerve', 'Optic nerve', 'Vagus nerve']
    },
    arm: {
      systems: ['skeletal', 'muscular'],
      queries: ['Humerus', 'Radius', 'Ulna', 'Biceps brachii', 'Triceps brachii', 'Deltoid']
    },
    leg: {
      systems: ['skeletal', 'muscular', 'connective'],
      queries: ['Femur', 'Patella', 'Tibia', 'Fibula', 'Quadriceps femoris', 'Gastrocnemius']
    },
    skull: {
      systems: ['skeletal'],
      queries: ['Frontal bone', 'Parietal bone', 'Occipital bone', 'Temporal bone', 'Mandible', 'Maxilla']
    }
  };

  const cfg = presetConfig[presetKey];
  if (!cfg) return;

  if (cfg.systems) {
    cfg.systems.forEach(s => {
      if (SYSTEMS_CONFIG[s]) SYSTEMS_CONFIG[s].active = true;
    });
    updateBottomBarUI();
    applyAllSystemsVisibility();
  }

  studyList = [];
  studyMemorized.clear();

  cfg.queries.forEach(q => {
    const qLower = q.toLowerCase();
    const mesh = allMeshes.find(m => {
      const cn = (m.userData.cleanName || '').toLowerCase();
      const vi = (m.userData.viName || '').toLowerCase();
      const en = (m.userData.enName || '').toLowerCase();
      return cn.includes(qLower) || vi.includes(qLower) || en.includes(qLower);
    });

    if (mesh && !isMeshInStudy(mesh)) {
      studyList.push({
        cleanName: mesh.userData.cleanName,
        viName: mesh.userData.viName || mesh.userData.cleanName,
        latinName: mesh.userData.latinName || mesh.userData.cleanName,
        enName: mesh.userData.enName || mesh.userData.cleanName,
        system: mesh.userData.system || 'skeletal',
        meshRef: mesh
      });
    }
  });

  currentStudyIndex = 0;
  saveStudyToStorage();
  applyStudyVisuals();
  renderStudyUI();
  updateInspectStudyButton();

  if (studyList.length > 0) {
    goToStudyItem(0);
  }

  if (notify) {
    showStudyToast(`Đã nạp bộ học: ${studyList.length} chi tiết!`);
  }
}

function saveStudyToStorage() {
  try {
    const data = {
      items: studyList.map(s => ({
        cleanName: s.cleanName,
        viName: s.viName,
        latinName: s.latinName,
        enName: s.enName,
        system: s.system
      })),
      memorized: Array.from(studyMemorized),
      displayMode: studyDisplayMode
    };
    localStorage.setItem('anatovi_study_deck', JSON.stringify(data));
  } catch (e) {}
}

function loadStudyFromStorage() {
  try {
    const raw = localStorage.getItem('anatovi_study_deck');
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.items && Array.isArray(data.items)) {
      studyList = data.items.map(item => {
        const mesh = allMeshes.find(m => m.userData.cleanName && m.userData.cleanName.toLowerCase() === item.cleanName.toLowerCase());
        return {
          ...item,
          meshRef: mesh
        };
      });
    }
    if (data.memorized && Array.isArray(data.memorized)) {
      studyMemorized = new Set(data.memorized);
    }
    if (data.displayMode) {
      studyDisplayMode = data.displayMode;
      ['ghost', 'isolate', 'normal'].forEach(m => {
        const el = document.getElementById(`opt-study-${m}`);
        if (el) el.classList.toggle('active', m === studyDisplayMode);
      });
    }
  } catch (e) {}
}

function showStudyToast(msg) {
  const toast = document.getElementById('study-toast');
  const msgEl = document.getElementById('study-toast-msg');
  if (!toast || !msgEl) return;

  msgEl.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

// Automatically initialize study mode & highlight mode when window loads
window.addEventListener('load', () => {
  initStudyMode();
  updateHighlightModeUI();
});

