// animation.js - Gestion des animations visuelles et 3D

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
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(150, 150);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    
    // Créer les éléments du logo
    const geometry = new THREE.IcosahedronGeometry(30, 1);
    const material = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    // Ajouter une sphère intérieure
    const innerGeometry = new THREE.SphereGeometry(20, 16, 16);
    const innerMaterial = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.6
    });
    
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerMesh);
    
    // Ajouter des particules
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 50;
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        // Position aléatoire dans une sphère
        const radius = 40 * Math.random();
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        
        // Couleur dégradée
        colors[i * 3] = 0.5 + Math.random() * 0.5; // R (bleu-violet)
        colors[i * 3 + 1] = 0.3 + Math.random() * 0.4; // G
        colors[i * 3 + 2] = 1.0; // B
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
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
    
    // Fonction d'animation
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        
        // Rotation
        mesh.rotation.x += rotationSpeed;
        mesh.rotation.y += rotationSpeed * 1.5;
        innerMesh.rotation.y += rotationSpeed * 0.8;
        innerMesh.rotation.z += rotationSpeed * 0.6;
        particles.rotation.y -= rotationSpeed * 0.3;
        
        // Effet de pulsation
        pulseScale += 0.01 * pulseDirection;
        if (pulseScale > 1.1) pulseDirection = -1;
        if (pulseScale < 0.9) pulseDirection = 1;
        
        innerMesh.scale.set(pulseScale, pulseScale, pulseScale);
        
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
        createScannerAnimation(animationContainer);
    } else {
        // Sinon, utiliser une animation CSS
        animationContainer.classList.add('pulse-animation');
    }
}

/**
 * Crée une animation de scanner 3D
 * @param {HTMLElement} container - Le conteneur de l'animation
 */
function createScannerAnimation(container) {
    // Vider le conteneur
    container.innerHTML = '';
    
    // Configuration de la scène
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(150, 150);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    
    // Créer une sphère avec effet de scanner
    const geometry = new THREE.SphereGeometry(30, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        wireframe: false,
        transparent: true,
        opacity: 0.6
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    
    // Ajouter un anneau de scanner
    const ringGeometry = new THREE.RingGeometry(32, 35, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    scene.add(ring);
    
    // Ajouter des données flottantes (cubes)
    const cubes = [];
    for (let i = 0; i < 20; i++) {
        const cubeSize = Math.random() * 3 + 1;
        const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cubeMaterial = new THREE.MeshBasicMaterial({
            color: Math.random() > 0.5 ? 0x6366f1 : 0xf59e0b,
            transparent: true,
            opacity: 0.7
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
        cubes.push({
            mesh: cube,
            rotationSpeed: Math.random() * 0.05,
            moveSpeed: Math.random() * 0.01,
            direction: [
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ]
        });
    }
    
    // Positionner la caméra
    camera.position.z = 100;
    
    // Variables d'animation
    let animationFrameId;
    let scannerPosition = -40; // Position verticale du scanner
    let scanDirection = 1; // Direction du scanner (montant ou descendant)
    
    // Fonction d'animation
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        
        // Animer la sphère
        sphere.rotation.y += 0.01;
        
        // Animer l'anneau de scanner
        scannerPosition += 0.8 * scanDirection;
        if (scannerPosition > 40) scanDirection = -1;
        if (scannerPosition < -40) scanDirection = 1;
        
        ring.position.y = scannerPosition;
        ring.rotation.x = Math.PI / 2; // Horizontal
        ring.rotation.z += 0.02;
        
        // Animer les cubes de données
        cubes.forEach(cube => {
            cube.mesh.rotation.x += cube.rotationSpeed;
            cube.mesh.rotation.y += cube.rotationSpeed * 0.8;
            
            // Mouvement léger
            cube.mesh.position.x += cube.direction[0] * cube.moveSpeed;
            cube.mesh.position.y += cube.direction[1] * cube.moveSpeed;
            cube.mesh.position.z += cube.direction[2] * cube.moveSpeed;
            
            // Inverser la direction si trop loin
            const distance = Math.sqrt(
                Math.pow(cube.mesh.position.x, 2) +
                Math.pow(cube.mesh.position.y, 2) +
                Math.pow(cube.mesh.position.z, 2)
            );
            
            if (distance > 70 || distance < 35) {
                cube.direction[0] *= -1;
                cube.direction[1] *= -1;
                cube.direction[2] *= -1;
            }
            
            // Effet de scan lorsque l'anneau passe
            if (Math.abs(cube.mesh.position.y - scannerPosition) < 5) {
                cube.mesh.material.opacity = 1;
            } else {
                cube.mesh.material.opacity = 0.7;
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
        cubes.forEach(cube => scene.remove(cube.mesh));
        
        geometry.dispose();
        material.dispose();
        ringGeometry.dispose();
        ringMaterial.dispose();
        
        cubes.forEach(cube => {
            cube.mesh.geometry.dispose();
            cube.mesh.material.dispose();
        });
        
        renderer.dispose();
    };
}

// Rendre les fonctions accessibles globalement
window.initLogoAnimationEffect = initLogoAnimationEffect;
window.initPredictionAnimation = initPredictionAnimation;
