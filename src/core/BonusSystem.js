import * as THREE from 'three';

export class BonusSystem {
    constructor(scene) {
        this.scene = scene;
        this.activeBonuses = [];
        this.collectibles = []; // Gems and powerups in world

        // Bonus types
        this.bonusTypes = {
            SLOW_MOTION: { duration: 3000, color: 0x00ffff },
            SHIELD: { duration: 0, color: 0xffaa00 }, // Duration 0 = single use
            MAGNET: { duration: 5000, color: 0xff00ff }
        };

        // Active effects
        this.activeEffects = {
            slowMotion: false,
            shield: false,
            magnet: false
        };

        this.spawnChance = 0.1; // 10% for powerups
        this.gemSpawnChance = 0.05; // 5% for gems

        this.lastSpawnY = 0;
        this.spawnInterval = 15; // Spawn every 15 units
    }

    createBonus(type, position) {
        const group = new THREE.Group();
        group.position.copy(position);
        group.userData.type = type;
        group.userData.isBonus = true;

        const baseColor = this.bonusTypes[type].color;

        if (type === 'SLOW_MOTION') {
            // Hourglass shape for Slow Motion
            const coneGeom = new THREE.ConeGeometry(0.25, 0.4, 8);
            const mat = new THREE.MeshStandardMaterial({
                color: baseColor, emissive: baseColor, emissiveIntensity: 0.6, metalness: 0.8, roughness: 0.2
            });
            const topCone = new THREE.Mesh(coneGeom, mat);
            topCone.position.y = 0.2;
            topCone.rotation.x = Math.PI;

            const bottomCone = new THREE.Mesh(coneGeom, mat);
            bottomCone.position.y = -0.2;

            group.add(topCone, bottomCone);
        }
        else if (type === 'SHIELD') {
            // Forcefield sphere with a solid core
            const coreGeom = new THREE.DodecahedronGeometry(0.2, 0);
            const coreMat = new THREE.MeshStandardMaterial({
                color: baseColor, emissive: baseColor, emissiveIntensity: 0.8, metalness: 1, roughness: 0
            });
            const core = new THREE.Mesh(coreGeom, coreMat);

            const fieldGeom = new THREE.SphereGeometry(0.4, 16, 16);
            const fieldMat = new THREE.MeshPhysicalMaterial({
                color: baseColor, transmission: 0.9, opacity: 1, transparent: true, roughness: 0.1, metalness: 0.1
            });
            const field = new THREE.Mesh(fieldGeom, fieldMat);

            group.add(core, field);
        }
        else if (type === 'MAGNET') {
            // U-shape Horseshoe magnet
            const magnetGeom = new THREE.TorusGeometry(0.25, 0.1, 8, 16, Math.PI);
            const magnetMat = new THREE.MeshStandardMaterial({
                color: 0xff0044, emissive: 0xff0044, emissiveIntensity: 0.4, metalness: 0.5, roughness: 0.5
            });
            const magnet = new THREE.Mesh(magnetGeom, magnetMat);
            magnet.rotation.z = Math.PI; // Face down

            const tipGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8);
            const tipMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.2 });

            const tip1 = new THREE.Mesh(tipGeom, tipMat);
            tip1.position.set(0.25, -0.05, 0);
            const tip2 = new THREE.Mesh(tipGeom, tipMat);
            tip2.position.set(-0.25, -0.05, 0);

            magnet.add(tip1, tip2);
            group.add(magnet);
        }

        // Add a floating halo ring to highlight as powerup
        const haloGeom = new THREE.TorusGeometry(0.5, 0.02, 4, 16);
        const haloMat = new THREE.MeshBasicMaterial({ color: baseColor });
        const halo = new THREE.Mesh(haloGeom, haloMat);
        halo.rotation.x = Math.PI / 2;
        group.add(halo);

        this.scene.add(group);
        this.collectibles.push(group);

        return group;
    }

    createGem(position) {
        // Classic diamond gem shape
        const geometry = new THREE.OctahedronGeometry(0.3, 0);
        geometry.scale(1, 1.4, 1); // Stretch vertically to look like a diamond

        const material = new THREE.MeshPhysicalMaterial({
            color: 0x00ffff, // Cyan diamond color
            emissive: 0x00aaff,
            emissiveIntensity: 0.6,
            metalness: 0.9,
            roughness: 0.1,
            transmission: 0.5, // Glass effect
            thickness: 0.5
        });

        const gem = new THREE.Mesh(geometry, material);
        gem.position.copy(position);
        gem.userData.isGem = true;

        // Inner glowing core to make it pop inside transmission
        const coreGeom = new THREE.OctahedronGeometry(0.15, 0);
        coreGeom.scale(1, 1.4, 1);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const core = new THREE.Mesh(coreGeom, coreMat);
        gem.add(core);

        this.scene.add(gem);
        this.collectibles.push(gem);

        return gem;
    }

    spawnCollectibles(playerY) {
        const spawnY = playerY - 20; // Spawn ahead

        if (this.lastSpawnY - spawnY > this.spawnInterval) {
            // Random spawn
            if (Math.random() < this.spawnChance && this.collectibles.length < 10) {
                const bonusTypes = Object.keys(this.bonusTypes);
                const randomType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];

                const x = (Math.random() - 0.5) * 4; // Random X position
                this.createBonus(randomType, new THREE.Vector3(x, spawnY, 0));
            }

            // Gem spawn
            if (Math.random() < this.gemSpawnChance && this.collectibles.length < 10) {
                const x = (Math.random() - 0.5) * 4;
                this.createGem(new THREE.Vector3(x, spawnY, 0));
            }

            this.lastSpawnY = spawnY;
        }
    }

    checkCollection(playerPos) {
        const collected = [];

        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const item = this.collectibles[i];
            const distance = playerPos.distanceTo(item.position);

            // Magnet effect - pull items
            if (this.activeEffects.magnet && distance < 5) {
                const dir = new THREE.Vector3().subVectors(playerPos, item.position).normalize();
                item.position.addScaledVector(dir, 0.2);
            }

            // Collection
            if (distance < 1) {
                if (item.userData.isGem) {
                    collected.push({ type: 'gem', item });
                } else if (item.userData.isBonus) {
                    collected.push({ type: 'bonus', bonusType: item.userData.type, item });
                }

                this.scene.remove(item);
                this.collectibles.splice(i, 1);
            }
        }

        return collected;
    }

    activateBonus(type) {
        // Only one active bonus at a time (except shield which is passive)
        if (type === 'SLOW_MOTION') {
            this.activeEffects.slowMotion = true;
            setTimeout(() => {
                this.activeEffects.slowMotion = false;
            }, this.bonusTypes.SLOW_MOTION.duration);
        }
        else if (type === 'SHIELD') {
            this.activeEffects.shield = true; // Single use, removed on hit
        }
        else if (type === 'MAGNET') {
            this.activeEffects.magnet = true;
            setTimeout(() => {
                this.activeEffects.magnet = false;
            }, this.bonusTypes.MAGNET.duration);
        }
    }

    useShield() {
        if (this.activeEffects.shield) {
            this.activeEffects.shield = false;
            return true; // Shield consumed
        }
        return false;
    }

    getTimeScale() {
        return this.activeEffects.slowMotion ? 0.5 : 1.0;
    }

    update(playerY, dt) {
        this.spawnCollectibles(playerY);

        // Animate collectibles
        for (const item of this.collectibles) {
            item.rotation.y += 2 * dt;

            // Remove if too far above player
            if (item.position.y > playerY + 15) {
                this.scene.remove(item);
                const index = this.collectibles.indexOf(item);
                if (index > -1) this.collectibles.splice(index, 1);
            }
        }
    }

    reset() {
        // Clean up all collectibles
        for (const item of this.collectibles) {
            this.scene.remove(item);
        }
        this.collectibles = [];

        this.activeEffects = {
            slowMotion: false,
            shield: false,
            magnet: false
        };
    }
}
