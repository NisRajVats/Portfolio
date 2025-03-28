// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
    // Select DOM elements
    const nav = document.querySelector('nav');
    const menuBtn = document.querySelector('.menu-btn');
    const cancelBtn = document.querySelector('.cancel-btn');
    const navbar = document.querySelector('.navbar');
    const scrollBtn = document.querySelector('.scroll-button a');
    const menuLinks = document.querySelectorAll('.navbar .menu a');
    const sections = document.querySelectorAll('section');
    const headSection = document.querySelector('.head');

    // Sticky Navigation
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            nav.classList.add('sticky');
        } else {
            nav.classList.remove('sticky');
        }

        // Show/Hide Scroll-to-Top Button
        if (window.scrollY > 500) {
            scrollBtn.style.display = 'block';
        } else {
            scrollBtn.style.display = 'none';
        }
    });

    // Mobile Menu Toggle
    menuBtn.addEventListener('click', () => {
        navbar.classList.add('active');
        menuBtn.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => {
        navbar.classList.remove('active');
        menuBtn.style.display = 'block';
    });

    // Close Mobile Menu When Clicking a Link
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbar.classList.contains('active')) {
                navbar.classList.remove('active');
                menuBtn.style.display = 'block';
            }
        });
    });

    // Smooth Scroll for Scroll-to-Top Button
    scrollBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Smooth Scroll for Navigation Links
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // GSAP Animations
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Animate the front section elements
    gsap.from('.front-text .front-heading', {
        opacity: 0,
        x: -100,
        duration: 1.5,
        ease: 'power3.out'
    });

    gsap.from('.front-text .front-para', {
        opacity: 0,
        y: 50,
        duration: 1.5,
        delay: 0.5,
        ease: 'power3.out'
    });

    gsap.from('.front-text .button', {
        opacity: 0,
        scale: 0.8,
        duration: 1,
        delay: 1,
        ease: 'elastic.out(1, 0.5)'
    });

    gsap.from('.sidepng', {
        opacity: 0,
        x: 100,
        duration: 1.5,
        ease: 'power3.out'
    });

    // Scroll-triggered animations for sections
    sections.forEach(section => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'power3.out'
        });
    });

    // Animate project cards
    const projectCards = document.querySelectorAll('.fascilities-col');
    projectCards.forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 50,
            duration: 1,
            delay: index * 0.2,
            ease: 'power3.out'
        });
    });

    // Animate service boxes
    const serviceBoxes = document.querySelectorAll('.services .box');
    serviceBoxes.forEach((box, index) => {
        gsap.from(box, {
            scrollTrigger: {
                trigger: box,
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            scale: 0.9,
            duration: 1,
            delay: index * 0.2,
            ease: 'back.out(1.7)'
        });
    });

    // Three.js 3D Sphere in Header
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    headSection.appendChild(renderer.domElement);

    // Create a sphere
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        color: 0xd4a017, // Gold color to match the theme
        shininess: 100,
        wireframe: true
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Position the camera
    camera.position.z = 15;

    // Animation loop for the sphere
    function animate() {
        requestAnimationFrame(animate);
        sphere.rotation.x += 0.01;
        sphere.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Style the Three.js canvas
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '0';
    renderer.domElement.style.opacity = '0.3'; // Subtle opacity
});