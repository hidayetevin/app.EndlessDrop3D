import * as THREE from 'three';

/**
 * ParticleManager - THREE.Points based particle system
 * Manages all particle effects in the game
 */
export class ParticleManager {
    constructor(scene) {
        this.scene = scene;
        this.particleSystems = [];
        this.maxSystems = 20; // Limit for performance
    }

    /**
     * Create a radial burst effect (Perfect Pass)
     * @param {THREE.Vector3} position - Center position
     * @param {number} count - Number of particles
     * @param {number} color - Particle color (hex)
     * @param {number} spread - Radial spread distance
     */
    createBurst(position, count = 30, color = 0x00d9ff, spread = 2.0) {
        const particles = [];
        const velocities = [];

        // Generate particles in radial pattern
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = Math.random() * 0.5;

            // Position (start near center)
            particles.push(
                position.x + Math.cos(angle) * radius,
                position.y + Math.sin(angle) * radius,
                position.z + Math.sin(angle) * radius
            );

            // Velocity (radial outward)
            const speed = 2 + Math.random() * 2;
            velocities.push(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                Math.sin(angle) * speed
            );
        }

        this._createParticleSystem({
            positions: new Float32Array(particles),
            velocities: new Float32Array(velocities),
            color: color,
            size: 0.15,
            lifetime: 0.6,
            fadeOut: true,
            gravity: -2
        });
    }

    /**
     * Create upward sparkle effect (Gem Collect)
     * @param {THREE.Vector3} position - Center position
     * @param {number} count - Number of particles
     * @param {number} color - Particle color (hex)
     */
    createSparkle(position, count = 15, color = 0xffd700) {
        const particles = [];
        const velocities = [];

        for (let i = 0; i < count; i++) {
            // Spread around center
            const offsetX = (Math.random() - 0.5) * 0.5;
            const offsetZ = (Math.random() - 0.5) * 0.5;

            particles.push(
                position.x + offsetX,
                position.y,
                position.z + offsetZ
            );

            // Upward velocity with slight horizontal spread
            velocities.push(
                (Math.random() - 0.5) * 1,
                3 + Math.random() * 2, // Upward
                (Math.random() - 0.5) * 1
            );
        }

        this._createParticleSystem({
            positions: new Float32Array(particles),
            velocities: new Float32Array(velocities),
            color: color,
            size: 0.1,
            lifetime: 0.8,
            fadeOut: true,
            gravity: -5
        });
    }

    /**
     * Create screen-wide wave effect (Biome Transition)
     * @param {number} color - Wave color (hex)
     * @param {string} direction - 'up' or 'down'
     */
    createWave(color = 0x00d9ff, direction = 'up') {
        const count = 100;
        const particles = [];
        const velocities = [];

        const yStart = direction === 'up' ? -20 : 20;
        const ySpeed = direction === 'up' ? 15 : -15;

        for (let i = 0; i < count; i++) {
            // Spread across screen width
            const x = (Math.random() - 0.5) * 15;
            const z = (Math.random() - 0.5) * 10;

            particles.push(x, yStart + Math.random() * 5, z);

            // Mostly vertical with slight horizontal drift
            velocities.push(
                (Math.random() - 0.5) * 2,
                ySpeed + Math.random() * 5,
                0
            );
        }

        this._createParticleSystem({
            positions: new Float32Array(particles),
            velocities: new Float32Array(velocities),
            color: color,
            size: 0.2,
            lifetime: 1.5,
            fadeOut: true,
            gravity: 0 // No gravity for wave
        });
    }

    /**
     * Internal: Create particle system
     * @private
     */
    _createParticleSystem(config) {
        // Limit number of active systems
        if (this.particleSystems.length >= this.maxSystems) {
            this._removeOldest();
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(config.positions, 3));

        const material = new THREE.PointsMaterial({
            color: config.color,
            size: config.size,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending, // Glowing effect
            depthWrite: false
        });

        const points = new THREE.Points(geometry, material);
        this.scene.add(points);

        // Store system with metadata
        this.particleSystems.push({
            points: points,
            velocities: config.velocities,
            lifetime: config.lifetime,
            maxLifetime: config.lifetime,
            fadeOut: config.fadeOut,
            gravity: config.gravity || 0,
            particleCount: config.positions.length / 3
        });
    }

    /**
     * Update all particle systems
     * @param {number} dt - Delta time
     */
    update(dt) {
        for (let i = this.particleSystems.length - 1; i >= 0; i--) {
            const system = this.particleSystems[i];

            // Update lifetime
            system.lifetime -= dt;

            // Remove dead systems
            if (system.lifetime <= 0) {
                this.scene.remove(system.points);
                system.points.geometry.dispose();
                system.points.material.dispose();
                this.particleSystems.splice(i, 1);
                continue;
            }

            // Update positions
            const positions = system.points.geometry.attributes.position.array;
            for (let j = 0; j < system.particleCount; j++) {
                const idx = j * 3;

                // Apply velocity
                positions[idx] += system.velocities[idx] * dt;
                positions[idx + 1] += system.velocities[idx + 1] * dt;
                positions[idx + 2] += system.velocities[idx + 2] * dt;

                // Apply gravity
                system.velocities[idx + 1] += system.gravity * dt;
            }
            system.points.geometry.attributes.position.needsUpdate = true;

            // Fade out
            if (system.fadeOut) {
                const progress = system.lifetime / system.maxLifetime;
                system.points.material.opacity = progress;
            }
        }
    }

    /**
     * Remove oldest particle system
     * @private
     */
    _removeOldest() {
        if (this.particleSystems.length === 0) return;

        const oldest = this.particleSystems[0];
        this.scene.remove(oldest.points);
        oldest.points.geometry.dispose();
        oldest.points.material.dispose();
        this.particleSystems.shift();
    }

    /**
     * Clear all particle systems
     */
    cleanup() {
        for (const system of this.particleSystems) {
            this.scene.remove(system.points);
            system.points.geometry.dispose();
            system.points.material.dispose();
        }
        this.particleSystems = [];
    }
}
