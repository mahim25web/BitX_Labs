// ---------- BitX Labs — ambient 3D tech background ----------
(function(){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wrap = document.getElementById('bg3d-wrap');
  if(!wrap || reduceMotion || typeof THREE === 'undefined') return;

  const ACCENT = 0x00d2ff;   // --accent
  const ACCENT2 = 0x6a5cff;  // --accent-2
  const BG = 0x0a0f1d;       // --bg

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(BG, 0.045);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 200);
  camera.position.set(0, 1.5, 16);

  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  wrap.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0x224466, 1.2));
  const pLight = new THREE.PointLight(ACCENT, 1.6, 30);
  pLight.position.set(5,5,5);
  scene.add(pLight);

  // ---------- CORE ----------
  const core = new THREE.Group();
  scene.add(core);

  const icoGeo = new THREE.IcosahedronGeometry(2.9, 1);
  const edges = new THREE.EdgesGeometry(icoGeo);
  const coreLines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color:ACCENT, transparent:true, opacity:0.85}));
  core.add(coreLines);

  const innerMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.9, 1),
    new THREE.MeshBasicMaterial({color:0x0e7490, wireframe:true, transparent:true, opacity:0.15, blending:THREE.AdditiveBlending})
  );
  core.add(innerMesh);

  const rings = [];
  const ringColors = [ACCENT, ACCENT2, ACCENT];
  for(let i=0;i<3;i++){
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(4.2 + i*0.5, 0.012, 8, 90),
      new THREE.MeshBasicMaterial({color: ringColors[i], transparent:true, opacity:0.4, blending:THREE.AdditiveBlending})
    );
    torus.rotation.x = Math.random()*Math.PI;
    torus.rotation.y = Math.random()*Math.PI;
    torus.userData.speed = 0.12 + i*0.1;
    torus.userData.axis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
    rings.push(torus);
    core.add(torus);
  }

  const posAttr = edges.attributes.position;
  const edgeCount = posAttr.count/2;
  const pulses = [];
  const PULSE_N = 8;
  const pulseGeo = new THREE.SphereGeometry(0.045,8,8);
  for(let i=0;i<PULSE_N;i++){
    const m = new THREE.Mesh(pulseGeo, new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0.85, blending:THREE.AdditiveBlending}));
    m.userData = {edgeIdx: Math.floor(Math.random()*edgeCount), t: Math.random(), speed: 0.35 + Math.random()*0.5};
    pulses.push(m);
    core.add(m);
  }
  function edgeVerts(idx){
    return [
      new THREE.Vector3().fromBufferAttribute(posAttr, idx*2),
      new THREE.Vector3().fromBufferAttribute(posAttr, idx*2+1)
    ];
  }

  // ---------- PARTICLE NETWORK ----------
  const PN = 90;
  const radius = 8.5;
  const particles = [];
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(PN*3);
  for(let i=0;i<PN;i++){
    const v = new THREE.Vector3((Math.random()-0.5)*2,(Math.random()-0.5)*2,(Math.random()-0.5)*2)
      .normalize().multiplyScalar(radius*(0.5+Math.random()*0.6));
    particles.push({pos:v, vel:new THREE.Vector3((Math.random()-0.5)*0.009,(Math.random()-0.5)*0.009,(Math.random()-0.5)*0.009)});
    pPos[i*3]=v.x; pPos[i*3+1]=v.y; pPos[i*3+2]=v.z;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos,3));
  const pointCloud = new THREE.Points(pGeo, new THREE.PointsMaterial({color:ACCENT2, size:0.08, transparent:true, opacity:0.8, blending:THREE.AdditiveBlending}));
  scene.add(pointCloud);

  const MAXLINES = PN*5;
  const lineGeo = new THREE.BufferGeometry();
  const linePos = new Float32Array(MAXLINES*2*3);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos,3).setUsage(THREE.DynamicDrawUsage));
  const lineMesh = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({color:ACCENT, transparent:true, opacity:0.15, blending:THREE.AdditiveBlending}));
  scene.add(lineMesh);
  const CONNECT_DIST = 2.5;

  // ---------- GRID FLOOR ----------
  const grid = new THREE.GridHelper(80, 40, ACCENT, 0x0e2233);
  grid.position.y = -6; grid.material.transparent = true; grid.material.opacity = 0.22;
  scene.add(grid);

  // ---------- INTERACTION ----------
  let mouseX=0, mouseY=0;
  window.addEventListener('mousemove', (e)=>{
    mouseX = (e.clientX/window.innerWidth - 0.5)*2;
    mouseY = (e.clientY/window.innerHeight - 0.5)*2;
  }, {passive:true});

  window.addEventListener('resize', ()=>{
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // fade the whole layer out as the user scrolls past the hero
  let targetOpacity = 1;
  window.addEventListener('scroll', ()=>{
    targetOpacity = Math.max(0.14, 1 - window.scrollY/700);
  }, {passive:true});

  function glitchFlash(){
    let n=0;
    const iv = setInterval(()=>{
      core.scale.setScalar(1 + Math.random()*0.045);
      n++;
      if(n>4){ clearInterval(iv); core.scale.setScalar(1); }
    }, 70);
  }

  // ---------- ANIMATE ----------
  const clock = new THREE.Clock();
  let nextPulse = 6, camAngle = 0, currentOpacity = 1;
  const orbitRadius = 15;

  function animate(){
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    core.rotation.y += dt*0.2;
    core.rotation.x += (mouseY*0.3 - core.rotation.x)*0.04;
    coreLines.rotation.y -= dt*0.04;
    rings.forEach(r=>{ r.rotateOnAxis(r.userData.axis, r.userData.speed*dt); });

    pulses.forEach(p=>{
      p.userData.t += dt*p.userData.speed;
      if(p.userData.t>1){ p.userData.t=0; p.userData.edgeIdx = Math.floor(Math.random()*edgeCount); }
      const [a,b] = edgeVerts(p.userData.edgeIdx);
      p.position.lerpVectors(a,b,p.userData.t);
    });

    for(let i=0;i<PN;i++){
      const pt = particles[i];
      pt.pos.add(pt.vel);
      const len = pt.pos.length();
      if(len > radius*1.3 || len < radius*0.35) pt.vel.multiplyScalar(-1);
      pPos[i*3]=pt.pos.x; pPos[i*3+1]=pt.pos.y; pPos[i*3+2]=pt.pos.z;
    }
    pGeo.attributes.position.needsUpdate = true;
    pointCloud.rotation.y += dt*0.025;

    let lineIdx=0;
    for(let i=0;i<PN && lineIdx<MAXLINES;i++){
      for(let j=i+1;j<PN && lineIdx<MAXLINES;j++){
        const dx=pPos[i*3]-pPos[j*3], dy=pPos[i*3+1]-pPos[j*3+1], dz=pPos[i*3+2]-pPos[j*3+2];
        const d = Math.sqrt(dx*dx+dy*dy+dz*dz);
        if(d<CONNECT_DIST){
          linePos[lineIdx*6]=pPos[i*3]; linePos[lineIdx*6+1]=pPos[i*3+1]; linePos[lineIdx*6+2]=pPos[i*3+2];
          linePos[lineIdx*6+3]=pPos[j*3]; linePos[lineIdx*6+4]=pPos[j*3+1]; linePos[lineIdx*6+5]=pPos[j*3+2];
          lineIdx++;
        }
      }
    }
    lineGeo.setDrawRange(0, lineIdx*2);
    lineGeo.attributes.position.needsUpdate = true;
    lineMesh.rotation.y = pointCloud.rotation.y;

    grid.position.z = (t*1.2)%2;

    camAngle += dt*0.035;
    const targetAngle = camAngle + mouseX*0.35;
    camera.position.x += (Math.sin(targetAngle)*orbitRadius - camera.position.x)*0.03;
    camera.position.z += (Math.cos(targetAngle)*orbitRadius - camera.position.z)*0.03;
    camera.position.y += ((1.5 - mouseY*2) - camera.position.y)*0.03;
    camera.lookAt(0,0,0);

    nextPulse -= dt;
    if(nextPulse<=0){ nextPulse = 9 + Math.random()*7; glitchFlash(); }

    currentOpacity += (targetOpacity - currentOpacity)*0.06;
    wrap.style.opacity = currentOpacity.toFixed(3);

    renderer.render(scene, camera);
  }
  animate();
})();
