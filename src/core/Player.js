import * as THREE from 'three';

export class Player {
    constructor(scene) {
        // Player Mesh (Placeholder Sphere)
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff0055,
            roughness: 0.4,
            metalness: 0.3
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.scene = scene;
        this.scene.add(this.mesh);

        // Physics properties
        this.velocity = new THREE.Vector3(0, -5, 0); // Initial downward speed
        this.gravity = -2; // Gravity acceleration
        this.maxFallSpeed = -20;

        // Input properties
        this.lastTouchX = 0;
        this.isDragging = false;
        this.sensitivity = 0.015; // Setup for relative sensitivity
        this.tiltSensitivity = 1.2;
        this.useTilt = false;

        this.setupInput();
    }

    setupInput() {
        // Tilt Control (Mobile accelerometer)
        window.addEventListener('deviceorientation', (e) => {
            if (!this.useTilt) return;
            // gamma is left-to-right tilt in degrees [-90, 90]
            if (e.gamma !== null) {
                const tiltX = e.gamma;
                // Add some deadzone and smooth movement
                if (Math.abs(tiltX) > 2) {
                    this.moveHorizontal(tiltX * this.tiltSensitivity);
                }
            }
        });

        // Touch events for mobile
        window.addEventListener('touchstart', (e) => {
            this.isDragging = true;
            this.lastTouchX = e.touches[0].clientX;
        });

        window.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            const currentX = e.touches[0].clientX;
            const deltaX = currentX - this.lastTouchX;
            this.moveHorizontal(deltaX);
            this.lastTouchX = currentX;
        });

        window.addEventListener('touchend', () => {
            this.isDragging = false;
        });

        // Mouse events for testing
        window.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastTouchX = e.clientX;
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const deltaX = e.clientX - this.lastTouchX;
            this.moveHorizontal(deltaX);
            this.lastTouchX = e.clientX;
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
    }

    moveHorizontal(deltaX) {
        // Relative movement
        this.mesh.position.x += deltaX * this.sensitivity;

        // Clamp position to boundaries (e.g., tube width)
        // Reduced to 2.5 to keep ball completely in view
        this.mesh.position.x = Math.max(-2.5, Math.min(2.5, this.mesh.position.x));
    }

    update(dt) {
        // Apply Gravity
        this.velocity.y += this.gravity * dt;

        // Clamp Speed
        if (this.velocity.y < this.maxFallSpeed) {
            this.velocity.y = this.maxFallSpeed;
        }

        // Apply Velocity
        this.mesh.position.addScaledVector(this.velocity, dt);

        // Simple rotation for visual effect
        this.mesh.rotation.x -= 2 * dt;
        this.mesh.rotation.z -= this.velocity.y * 0.1 * dt;
    }

    reset() {
        // Reset position to start
        this.mesh.position.set(0, 0, 0);
        this.mesh.rotation.set(0, 0, 0);

        // Reset velocity
        this.velocity.set(0, -5, 0);

        // Reset input state
        this.isDragging = false;
    }

    setSkin(skinData) {
        if (!skinData) return;

        this.mesh.material.color.setHex(skinData.color);
        this.mesh.material.roughness = skinData.roughness;
        this.mesh.material.metalness = skinData.metalness;

        if (skinData.emissive !== undefined) {
            this.mesh.material.emissive.setHex(skinData.emissive);
            this.mesh.material.emissiveIntensity = skinData.emissiveIntensity;
        }
    }
}
