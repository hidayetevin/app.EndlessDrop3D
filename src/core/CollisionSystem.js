import * as THREE from 'three';

export class CollisionSystem {
    constructor() {
        this.playerRadius = 0.5; // Sphere radius
        this.ringInnerRadius = 1.2; // Safe zone - Küçültüldü: 2.7 -> 1.2
        this.ringOuterRadius = 1.7; // Danger zone - Küçültüldü: 3.3 -> 1.7
        this.perfectZoneRadius = 0.2; // Perfect pass tolerance - Biraz küçültüldü

        // Miss detection threshold
        this.missThreshold = 1.0; // Ring bu mesafeden yukarıda ise pass/miss kontrolü yap
    }

    // AABB-based collision (simplified for ring)
    checkCollision(player, obstacles) {
        const playerPos = player.mesh.position;

        for (let i = 0; i < obstacles.length; i++) {
            const ring = obstacles[i];

            // Check if player is at ring's Y level
            const deltaY = Math.abs(playerPos.y - ring.position.y);

            if (deltaY < 0.5) { // Player is passing through ring plane
                // Halka merkezine göre mesafe hesapla (X offseti dikkate al)
                const dx = playerPos.x - ring.position.x;
                const dz = playerPos.z - ring.position.z;
                const distanceFromCenter = Math.sqrt(dx * dx + dz * dz);

                // Check perfect pass (very center)
                if (distanceFromCenter < this.perfectZoneRadius && !ring.userData.isPerfect) {
                    ring.userData.isPerfect = true;
                    return { type: 'perfect', ring };
                }

                // Check if player is inside safe zone (passed)
                if (distanceFromCenter < this.ringInnerRadius) {
                    if (!ring.userData.passed) {
                        ring.userData.passed = true;
                        return { type: 'pass', ring };
                    }
                }

                // Check collision (hit the ring)
                if (distanceFromCenter >= this.ringInnerRadius &&
                    distanceFromCenter <= this.ringOuterRadius) {
                    return { type: 'collision', ring };
                }
            }

            // MISS DETECTION: Ring is above player and was never passed ⚠️
            if (ring.position.y > playerPos.y + this.missThreshold &&
                !ring.userData.passed &&
                !ring.userData.missed) {

                ring.userData.missed = true; // Mark as missed
                return { type: 'miss', ring };
            }
        }

        return null;
    }
}
