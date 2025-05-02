// animation.js - Gestion des animations visuelles et 3D
// Version améliorée avec effets visuels plus modernes

/**
 * Initialise l'animation du logo sur la page d'accueil
 * @param {HTMLElement} container - Le conteneur du logo
 */
function initLogoAnimationEffect(container) {
    // Créer l'animation du logo avec Three.js
    if (!window.THREE) {
        console.error('Three.js non disponible');
        return;
    }
    
    // Vérifier si un rendu existe déjà
    if (container.firstChild) {
        container.innerHTML = '';
    }
    
    // Configuration de la scène Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1000);
    
    // Adapter la taille du conteneur
    container.style.width = '150px';
    container.style.height = '150px';
    
    const renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true 
    });
    renderer.setSize(150, 150);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    container.appendChild(renderer.domElement);
    
    // Créer les éléments du logo avec effets améliorés
    // Icosaèdre principal avec effet de fil de fer
    const geometry = new THREE.IcosahedronGeometry(30, 2); // Plus détaillé
    const material = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    // Sphère intérieure avec brillance
    const innerGeometry = new THREE.SphereGeometry(20, 32, 32); // Plus lisse
    const innerMaterial = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.6
    });
    
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerMesh);
    
    // Effet de particules plus élaboré
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 100; // Plus de particules
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
        // Position aléatoire dans une sphère
        const radius = 40 * Math.pow(Math.random(), 1/3); // Distribution uniforme
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        
        // Couleur dégradée améliorée
        colors[i * 3] = 0.5 + Math.random() * 0.5; // R (bleu-violet)
        colors[i * 3 + 1] = 0.3 + Math.random() * 0.4; // G
        colors[i * 3 + 2] = 0.8 + Math.random() * 0.2; // B (plus lumineux)
        
        // Tailles variables
        sizes[i] = 2 * (1 + Math.random());
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Créer un matériau de points avec shader personnalisé pour des points plus jolis
    const particlesMaterial = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    
    // Positionner la caméra
    camera.position.z = 100;
    
    // Variables d'animation
    let animationFrameId;
    let rotationSpeed = 0.005;
    let pulseDirection = 1;
    let pulseScale = 1;
    
    // Fonction d'animation avec effets améliorés
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        
        // Rotation avec différentes vitesses pour chaque axe
        mesh.rotation.x += rotationSpeed;
        mesh.rotation.y += rotationSpeed * 1.5;
        mesh.rotation.z += rotationSpeed * 0.5;
        
        innerMesh.rotation.y += rotationSpeed * 0.8;
        innerMesh.rotation.z += rotationSpeed * 0.6;
        
        particles.rotation.y -= rotationSpeed * 0.3;
        particles.rotation.x += rotationSpeed * 0.1;
        
        // Effet de pulsation amélioré
        pulseScale += 0.008 * pulseDirection;
        if (pulseScale > 1.15) pulseDirection = -1;
        if (pulseScale < 0.9) pulseDirection = 1;
        
        // Appliquer la pulsation à différents éléments
        innerMesh.scale.set(pulseScale, pulseScale, pulseScale);
        
        // Faire légèrement pulser l'icosaèdre en sens inverse
        const inversePulse = 1 + (1 - pulseScale) * 0.3;
        mesh.scale.set(inversePulse, inversePulse, inversePulse);
        
        // Modifier l'opacité en fonction de la pulsation
        material.opacity = 0.7 + (pulseScale - 0.9) * 0.3;
        innerMaterial.opacity = 0.5 + (pulseScale - 0.9) * 0.3;
        
        // Animer les particules
        const positions = particlesGeometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Faire "respirer" légèrement les particules
            const x = positions[i3];
            const y = positions[i3 + 1];
            const z = positions[i3 + 2];
            
            const distance = Math.sqrt(x*x + y*y + z*z);
            const normalizedDistance = Math.min(distance / 40, 1);
            
            const breathingFactor = 1 + Math.sin(Date.now() * 0.001 + normalizedDistance * 5) * 0.03;
            
            positions[i3] = x * breathingFactor;
            positions[i3 + 1] = y * breathingFactor;
            positions[i3 + 2] = z * breathingFactor;
        }
        particlesGeometry.attributes.position.needsUpdate = true;
        
        // Rendu
        renderer.render(scene, camera);
    }
    
    // Démarrer l'animation
    animate();
    
    // Nettoyer l'animation lors de la destruction
    return function cleanup() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        // Nettoyer la mémoire
        scene.remove(mesh);
        scene.remove(innerMesh);
        scene.remove(particles);
        
        geometry.dispose();
        material.dispose();
        innerGeometry.dispose();
        innerMaterial.dispose();
        particlesGeometry.dispose();
        particlesMaterial.dispose();
        
        renderer.dispose();
    };
}

/**
 * Initialise l'animation de prédiction
 * Appelée lors de la soumission du formulaire
 */
function initPredictionAnimation() {
    const animationContainer = document.getElementById('prediction-animation');
    if (!animationContainer) return;
    
    // Créer une animation de scanner
    if (window.THREE) {
        // Si Three.js est disponible, créer une animation 3D
        return createScannerAnimation(animationContainer);
    } else {
        // Sinon, utiliser une animation CSS
        animationContainer.classList.add('pulse-animation');
        return null;
    }
}

/**
 * Crée une animation de scanner 3D améliorée
 * @param {HTMLElement} container - Le conteneur de l'animation
 */
function createScannerAnimation(container) {
    // Vider le conteneur
    container.innerHTML = '';
    
    // Configuration de la scène
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true 
    });
    renderer.setSize(150, 150);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    container.appendChild(renderer.domElement);
    
    // Créer une sphère avec effet de scanner
    const geometry = new THREE.SphereGeometry(30, 64, 64); // Plus détaillée
    
    // Utiliser un matériau plus avancé pour la sphère
    const material = new THREE.MeshPhongMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.6,
        specular: 0xffffff,
        shininess: 100,
        flatShading: false
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    
    // Ajouter un anneau de scanner avec effet de brillance
    const ringGeometry = new THREE.RingGeometry(32, 35, 64); // Plus de segments
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    scene.add(ring);
    
    // Ajouter des données flottantes avec formes variées
    const dataObjects = [];
    
    // Ajouter quelques cubes
    for (let i = 0; i < 10; i++) {
        const cubeSize = Math.random() * 3 + 1;
        const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cubeMaterial = new THREE.MeshPhongMaterial({
            color: Math.random() > 0.5 ? 0x6366f1 : 0xf59e0b,
            transparent: true,
            opacity: 0.7,
            specular: 0xffffff,
            shininess: 30
        });
        
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        
        // Position aléatoire autour de la sphère
        const radius = Math.random() * 20 + 40;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        cube.position.x = radius * Math.sin(phi) * Math.cos(theta);
        cube.position.y = radius * Math.sin(phi) * Math.sin(theta);
        cube.position.z = radius * Math.cos(phi);
        
        scene.add(cube);
        dataObjects.push({
            mesh: cube,
            rotationSpeed: Math.random() * 0.05,
            moveSpeed: Math.random() * 0.01,
            direction: [
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ],
            initialPosition: [cube.position.x, cube.position.y, cube.position.z]
        });
    }
    
    // Ajouter quelques tétraèdres pour plus de variété
    for (let i = 0; i < 5; i++) {
        const tetraSize = Math.random() * 4 + 2;
        const tetraGeometry = new THREE.TetrahedronGeometry(tetraSize);
        const tetraMaterial = new THREE.MeshPhongMaterial({
            color: 0x6366f1,
            transparent: true,
            opacity: 0.7,
            specular: 0xffffff,
            shininess: 30
        });
        
        const tetra = new THREE.Mesh(tetraGeometry, tetraMaterial);
        
        // Position aléatoire autour de la sphère
        const radius = Math.random() * 20 + 40;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        tetra.position.x = radius * Math.sin(phi) * Math.cos(theta);
        tetra.position.y = radius * Math.sin(phi) * Math.sin(theta);
        tetra.position.z = radius * Math.cos(phi);
        
        scene.add(tetra);
        dataObjects.push({
            mesh: tetra,
            rotationSpeed: Math.random() * 0.05,
            moveSpeed: Math.random() * 0.01,
            direction: [
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ],
            initialPosition: [tetra.position.x, tetra.position.y, tetra.position.z]
        });
    }
    
    // Ajouter quelques octaèdres pour encore plus de variété
    for (let i = 0; i < 5; i++) {
        const octaSize = Math.random() * 3 + 1.5;
        const octaGeometry = new THREE.OctahedronGeometry(octaSize);
        const octaMaterial = new THREE.MeshPhongMaterial({
            color: 0xf59e0b,
            transparent: true,
            opacity: 0.7,
            specular: 0xffffff,
            shininess: 30
        });
        
        const octa = new THREE.Mesh(octaGeometry, octaMaterial);
        
        // Position aléatoire autour de la sphère
        const radius = Math.random() * 20 + 40;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        octa.position.x = radius * Math.sin(phi) * Math.cos(theta);
        octa.position.y = radius * Math.sin(phi) * Math.sin(theta);
        octa.position.z = radius * Math.cos(phi);
        
        scene.add(octa);
        dataObjects.push({
            mesh: octa,
            rotationSpeed: Math.random() * 0.05,
            moveSpeed: Math.random() * 0.01,
            direction: [
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ],
            initialPosition: [octa.position.x, octa.position.y, octa.position.z]
        });
    }
    
    // Ajouter de l'éclairage pour les effets 3D
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Positionner la caméra
    camera.position.z = 100;
    
    // Variables d'animation
    let animationFrameId;
    let scannerPosition = -40; // Position verticale du scanner
    let scanDirection = 1; // Direction du scanner (montant ou descendant)
    let time = 0; // Variable de temps pour les animations
    
    // Fonction d'animation améliorée
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        time += 0.01;
        
        // Animer la sphère avec une rotation lente
        sphere.rotation.y += 0.01;
        sphere.rotation.x += 0.005;
        
        // Faire pulser légèrement la sphère
        const pulseFactor = 1 + Math.sin(time * 2) * 0.05;
        sphere.scale.set(pulseFactor, pulseFactor, pulseFactor);
        
        // Animer l'opacité de la sphère
        material.opacity = 0.4 + Math.sin(time * 3) * 0.2;
        
        // Animer l'anneau de scanner
        scannerPosition += 0.8 * scanDirection;
        if (scannerPosition > 40) scanDirection = -1;
        if (scannerPosition < -40) scanDirection = 1;
        
        ring.position.y = scannerPosition;
        ring.rotation.x = Math.PI / 2; // Horizontal
        ring.rotation.z += 0.02;
        
        // Faire pulser l'anneau
        const ringPulse = 1 + Math.sin(time * 4) * 0.1;
        ring.scale.x = ringPulse;
        ring.scale.y = ringPulse;
        
        // Effet d'opacité pour l'anneau
        ringMaterial.opacity = 0.6 + Math.sin(time * 5) * 0.2;
        
        // Animer les objets de données
        dataObjects.forEach(obj => {
            obj.mesh.rotation.x += obj.rotationSpeed;
            obj.mesh.rotation.y += obj.rotationSpeed * 0.8;
            
            // Mouvement orbital légèrement chaotique
            const orbitSpeed = 0.01;
            const originalX = obj.initialPosition[0];
            const originalY = obj.initialPosition[1];
            const originalZ = obj.initialPosition[2];
            
            // Orbite elliptique personnalisée pour chaque objet
            obj.mesh.position.x = originalX + Math.sin(time * (0.5 + Math.random() * 0.5) + obj.rotationSpeed * 10) * 5;
            obj.mesh.position.y = originalY + Math.sin(time * (0.3 + Math.random() * 0.5) + obj.rotationSpeed * 20) * 5;
            obj.mesh.position.z = originalZ + Math.cos(time * (0.4 + Math.random() * 0.5) + obj.rotationSpeed * 15) * 5;
            
            // Effet de scan lorsque l'anneau passe
            const distanceToScanner = Math.abs(obj.mesh.position.y - scannerPosition);
            if (distanceToScanner < 5) {
                obj.mesh.material.opacity = 1;
                // Ajouter un effet de mise à l'échelle
                obj.mesh.scale.set(1.2, 1.2, 1.2);
                // Changer temporairement la couleur
                obj.mesh.material.emissive = new THREE.Color(0x444444);
            } else {
                obj.mesh.material.opacity = 0.7;
                obj.mesh.scale.set(1, 1, 1);
                obj.mesh.material.emissive = new THREE.Color(0x000000);
            }
        });
        
        // Rendu
        renderer.render(scene, camera);
    }
    
    // Démarrer l'animation
    animate();
    
    // Nettoyer l'animation
    return function cleanup() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        // Nettoyer les ressources
        scene.remove(sphere);
        scene.remove(ring);
        scene.remove(ambientLight);
        scene.remove(directionalLight);
        
        dataObjects.forEach(obj => scene.remove(obj.mesh));
        
        geometry.dispose();
        material.dispose();
        ringGeometry.dispose();
        ringMaterial.dispose();
        
        dataObjects.forEach(obj => {
            obj.mesh.geometry.dispose();
            obj.mesh.material.dispose();
        });
        
        renderer.dispose();
    };
}

// Fonction pour créer une animation d'arrière-plan subtile
function createBackgroundAnimation() {
    const container = document.createElement('div');
    container.className = 'background-animation';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '-1';
    container.style.pointerEvents = 'none';
    
    // Créer des particules d'arrière-plan
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'bg-particle';
        
        // Style des particules
        particle.style.position = 'absolute';
        particle.style.width = (3 + Math.random() * 5) + 'px';
        particle.style.height = particle.style.width;
        particle.style.borderRadius = '50%';
        particle.style.opacity = (0.1 + Math.random() * 0.2).toString();
        
        // Couleurs aléatoires
        const colors = ['#6366f1', '#818cf8', '#f59e0b', '#fbbf24'];
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Position aléatoire
        particle.style.left = (Math.random() * 100) + '%';
        particle.style.top = (Math.random() * 100) + '%';
        
        // Animation
        particle.style.animation = `float ${5 + Math.random() * 10}s infinite ease-in-out`;
        particle.style.animationDelay = (Math.random() * 5) + 's';
        
        container.appendChild(particle);
        container.appendChild(particle);
    }
    
    // Ajouter un effet de dégradé subtil
    const gradient = document.createElement('div');
    gradient.className = 'bg-gradient';
    gradient.style.position = 'absolute';
    gradient.style.top = '0';
    gradient.style.left = '0';
    gradient.style.width = '100%';
    gradient.style.height = '100%';
    gradient.style.background = 'radial-gradient(circle at center, rgba(99, 102, 241, 0.03) 0%, rgba(245, 158, 11, 0.02) 50%, rgba(255, 255, 255, 0) 70%)';
    gradient.style.animation = 'pulse 15s infinite ease-in-out';
    
    container.appendChild(gradient);
    document.body.appendChild(container);
    
    // Ajouter les keyframes d'animation au DOM
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(10px, 10px); }
            50% { transform: translate(5px, -5px); }
            75% { transform: translate(-10px, 5px); }
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    return container;
}

/**
 * Initialise les animations de l'application
 */
function initializeAppAnimations() {
    console.log("Initialisation des animations de l'application");
    
    // Animation d'arrière-plan subtile
    createBackgroundAnimation();
    
    // Animation du logo sur la page d'accueil
    const logoContainer = document.getElementById('logo-animation');
    if (logoContainer) {
        initLogoAnimationEffect(logoContainer);
    }
    
    // Ajouter des animations aux cartes
    animateCards();
    
    // Ajouter des effets de survol aux boutons
    enhanceButtonEffects();
}

/**
 * Ajoute des animations aux cartes de l'application
 */
function animateCards() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach((card, index) => {
        // Ajouter un délai progressif pour une animation en cascade
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        // Animation d'entrée
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + index * 100);
        
        // Effet de survol amélioré
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
            card.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
        });
    });
}

/**
 * Améliore les effets visuels des boutons
 */
function enhanceButtonEffects() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        // Effet de ripple au clic
        button.addEventListener('click', function(e) {
            // Créer l'élément ripple
            const ripple = document.createElement('span');
            ripple.className = 'btn-ripple';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
            ripple.style.width = '5px';
            ripple.style.height = '5px';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.pointerEvents = 'none';
            
            // Ajouter les keyframes d'animation si nécessaire
            if (!document.querySelector('#ripple-animation')) {
                const style = document.createElement('style');
                style.id = 'ripple-animation';
                style.textContent = `
                    @keyframes ripple {
                        to {
                            transform: scale(30);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Calculer la position
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            // Assurer que le bouton a position relative
            if (getComputedStyle(button).position === 'static') {
                button.style.position = 'relative';
                button.style.overflow = 'hidden';
            }
            
            // Ajouter et supprimer le ripple
            button.appendChild(ripple);
            setTimeout(() => {
                if (ripple.parentNode === button) {
                    button.removeChild(ripple);
                }
            }, 600);
        });
    });
}

/**
 * Crée un effet de particules flottantes
 * @param {HTMLElement} container - Le conteneur pour les particules
 * @param {Object} options - Options de configuration
 */
function createFloatingParticles(container, options = {}) {
    const defaults = {
        count: 20,
        colors: ['#6366f1', '#818cf8', '#f59e0b', '#fbbf24'],
        minSize: 3,
        maxSize: 8,
        speed: 30, // Secondes pour compléter l'animation
        opacity: 0.3
    };
    
    const config = { ...defaults, ...options };
    
    // Vérifier si le conteneur a position relative ou absolute
    const containerStyle = getComputedStyle(container);
    if (containerStyle.position === 'static') {
        container.style.position = 'relative';
    }
    
    // Créer le conteneur de particules
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'floating-particles';
    particlesContainer.style.position = 'absolute';
    particlesContainer.style.top = '0';
    particlesContainer.style.left = '0';
    particlesContainer.style.width = '100%';
    particlesContainer.style.height = '100%';
    particlesContainer.style.overflow = 'hidden';
    particlesContainer.style.pointerEvents = 'none';
    particlesContainer.style.zIndex = '1';
    
    // Créer les particules
    for (let i = 0; i < config.count; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        
        // Propriétés des particules
        const size = config.minSize + Math.random() * (config.maxSize - config.minSize);
        const color = config.colors[Math.floor(Math.random() * config.colors.length)];
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const speed = config.speed * (0.8 + Math.random() * 0.4);
        const delay = Math.random() * config.speed;
        
        // Appliquer les styles
        particle.style.position = 'absolute';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.backgroundColor = color;
        particle.style.borderRadius = '50%';
        particle.style.opacity = Math.random() * config.opacity;
        particle.style.left = x + '%';
        particle.style.top = y + '%';
        particle.style.animation = `floatParticle ${speed}s infinite linear`;
        particle.style.animationDelay = `-${delay}s`;
        
        particlesContainer.appendChild(particle);
    }
    
    // Ajouter les keyframes si nécessaire
    if (!document.querySelector('#floating-particles-animation')) {
        const style = document.createElement('style');
        style.id = 'floating-particles-animation';
        style.textContent = `
            @keyframes floatParticle {
                0% {
                    transform: translate(0, 0);
                }
                25% {
                    transform: translate(10%, 15%);
                }
                50% {
                    transform: translate(-5%, 20%);
                }
                75% {
                    transform: translate(-15%, 5%);
                }
                100% {
                    transform: translate(0, 0);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    container.appendChild(particlesContainer);
    return particlesContainer;
}

/**
 * Crée un effet de confetti pour les événements importants
 * @param {Object} options - Options de configuration
 */
function createConfettiEffect(options = {}) {
    const defaults = {
        particleCount: 100,
        spread: 70,
        duration: 3000, // ms
        colors: ['#6366f1', '#818cf8', '#f59e0b', '#fbbf24', '#10b981']
    };
    
    const config = { ...defaults, ...options };
    
    // Créer le conteneur
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100%';
    confettiContainer.style.height = '100%';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '9999';
    
    // Créer les particules de confetti
    for (let i = 0; i < config.particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';
        
        // Propriétés aléatoires
        const size = Math.floor(Math.random() * 10) + 5;
        const color = config.colors[Math.floor(Math.random() * config.colors.length)];
        const shape = Math.random() > 0.5 ? 'circle' : 'square';
        const startX = 50 + (Math.random() * config.spread - config.spread / 2);
        const startY = -10;
        const endY = 110 + Math.random() * 20;
        const rotation = Math.random() * 360;
        const rotationEnd = rotation + Math.random() * 720 - 360;
        const duration = config.duration * (0.8 + Math.random() * 0.4);
        const delay = Math.random() * 500;
        
        // Appliquer les styles
        particle.style.position = 'absolute';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.backgroundColor = color;
        particle.style.borderRadius = shape === 'circle' ? '50%' : '0';
        particle.style.left = startX + '%';
        particle.style.top = startY + '%';
        particle.style.opacity = 1;
        
        // Définir l'animation
        particle.style.animation = `confettiDrop ${duration}ms ease-in-out forwards`;
        particle.style.animationDelay = delay + 'ms';
        
        // Ajouter une animation de rotation
        particle.style.transform = `rotate(${rotation}deg)`;
        
        confettiContainer.appendChild(particle);
    }
    
    // Ajouter les keyframes si nécessaire
    if (!document.querySelector('#confetti-animation')) {
        const style = document.createElement('style');
        style.id = 'confetti-animation';
        style.textContent = `
            @keyframes confettiDrop {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                75% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(${100 + Math.random() * 20}vh) rotate(${Math.random() * 720 - 360}deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(confettiContainer);
    
    // Supprimer le conteneur après l'animation
    setTimeout(() => {
        if (confettiContainer.parentNode) {
            document.body.removeChild(confettiContainer);
        }
    }, config.duration + 1000);
    
    return confettiContainer;
}

// Exposer les fonctions au contexte global
window.initLogoAnimationEffect = initLogoAnimationEffect;
window.initPredictionAnimation = initPredictionAnimation;
window.createScannerAnimation = createScannerAnimation;
window.initializeAppAnimations = initializeAppAnimations;
window.createFloatingParticles = createFloatingParticles;
window.createConfettiEffect = createConfettiEffect;

// Initialiser les animations au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Lancer les animations principales
    initializeAppAnimations();
    
    // Créer un effet de confetti pour l'accueil si c'est la première visite
    if (!localStorage.getItem('visited')) {
        setTimeout(() => {
            createConfettiEffect();
            localStorage.setItem('visited', 'true');
        }, 1000);
    }
});
