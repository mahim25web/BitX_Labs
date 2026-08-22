// ==========================================
// 1. THREE.JS 3D BACKGROUND SYSTEM
// ==========================================
(function init3D() {
  const canvas = document.getElementById('canvas3d');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 3D Particles Matrix
  const particlesCount = 700;
  const posArray = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 15;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  // Material with glowing cyan dots
  const material = new THREE.PointsMaterial({
    size: 0.035,
    color: 0x00d2ff,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending
  });

  const particlesMesh = new THREE.Points(geometry, material);
  scene.add(particlesMesh);

  camera.position.z = 3;

  // Mouse interactivity
  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
  });

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Rotate particle universe slowly
    particlesMesh.rotation.y = elapsedTime * 0.05;
    particlesMesh.rotation.x = -mouseY * 0.5;
    particlesMesh.rotation.y += mouseX * 0.5;

    renderer.render(scene, camera);
  }
  animate();

  // Responsive Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

// ==========================================
// 2. 3D CARD PERSPECTIVE TILT EFFECT
// ==========================================
document.querySelectorAll('.card, .stack-card, .arch-node, .mockup').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Tilt angle calculation
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    card.style.setProperty('--mx', `${x}px`);
    card.style.setProperty('--my', `${y}px`);
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(12px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  });
});

// ==========================================
// 3. EMAILJS FORM SUBMISSION
// ==========================================
(function() {
    emailjs.init("YOUR_PUBLIC_KEY"); // আপনার Public Key দিন
})();

const ctaForm = document.querySelector('.cta-form');

if (ctaForm) {
  ctaForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const submitBtn = ctaForm.querySelector('.btn');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = 'Sending...';

    emailjs.sendForm('service_1hm1eij', 'YOUR_TEMPLATE_ID', this)
      .then(function() {
        alert('Project Brief successfully sent to your Gmail!');
        ctaForm.reset();
        submitBtn.innerText = originalBtnText;
      }, function(error) {
        alert('Failed to send message. Please try again.');
        console.error('EmailJS Error:', error);
        submitBtn.innerText = originalBtnText;
      });
  });
}