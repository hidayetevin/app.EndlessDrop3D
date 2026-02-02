import * as THREE from 'three';

/**
 * TrailRenderer - Creates a trailing line effect behind the player
 */
export class TrailRenderer {
    constructor(scene, target) {
        this.scene = scene;
        this.target = target; // Player mesh
        this.enabled = true;

        this.maxPoints = 50;
        this.positions = [];
        this.updateInterval = 0.05; // Record position every 50ms
        this.timeSinceLastPoint = 0;

        // Default color (will be updated from skin)
        this.color = 0xff0055;

        this.line = null;
        this.geometry = null;
        this.material = null;

        this._createLine();
    }

    /**
     * Create the line geometry and material
     * @private
     */
    _createLine() {
        // Initial empty geometry
        this.geometry = new THREE.BufferGeometry();

        this.material = new THREE.LineBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.6,
            linewidth: 2, // Note: linewidth > 1 not supported in most browsers, but we set it anyway
            blending: THREE.AdditiveBlending
        });

        this.line = new THREE.Line(this.geometry, this.material);
        this.scene.add(this.line);
    }

    /**
     * Update trail (called every frame)
     * @param {number} dt - Delta time
     */
    update(dt) {
        if (!this.enabled || !this.target) return;

        this.timeSinceLastPoint += dt;

        // Record new position at intervals
        if (this.timeSinceLastPoint >= this.updateInterval) {
            this.timeSinceLastPoint = 0;

            // Add current position
            this.positions.push({
                x: this.target.position.x,
                y: this.target.position.y,
                z: this.target.position.z,
                age: 0
            });

            // Limit max points
            if (this.positions.length > this.maxPoints) {
                this.positions.shift();
            }
        }

        // Age all points
        for (const pos of this.positions) {
            pos.age += dt;
        }

        // Remove old points (older than 1 second)
        this.positions = this.positions.filter(p => p.age < 1.0);

        // Update geometry
        this._updateGeometry();
    }

    /**
     * Update line geometry from positions
     * @private
     */
    _updateGeometry() {
        if (this.positions.length < 2) {
            // Not enough points for a line
            this.line.visible = false;
            return;
        }

        this.line.visible = true;

        // Create position array
        const points = [];
        for (const pos of this.positions) {
            points.push(pos.x, pos.y, pos.z);
        }

        // Update geometry
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

        // Fade out based on age
        const oldestAge = Math.max(...this.positions.map(p => p.age));
        if (oldestAge > 0) {
            this.material.opacity = 0.6 * (1 - oldestAge / 1.0);
        }
    }

    /**
     * Set trail color (from player skin)
     * @param {number} color - Hex color
     */
    setColor(color) {
        this.color = color;
        if (this.material) {
            this.material.color.setHex(color);
        }
    }

    /**
     * Enable/disable trail
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled && this.line) {
            this.line.visible = false;
            this.positions = [];
        }
    }

    /**
     * Clear all trail points
     */
    clear() {
        this.positions = [];
        if (this.line) {
            this.line.visible = false;
        }
    }

    /**
     * Cleanup (remove from scene)
     */
    dispose() {
        if (this.line) {
            this.scene.remove(this.line);
        }
        if (this.geometry) {
            this.geometry.dispose();
        }
        if (this.material) {
            this.material.dispose();
        }
    }
}
