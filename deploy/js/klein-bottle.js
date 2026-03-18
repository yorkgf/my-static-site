/**
 * Klein Bottle Animation
 * Creates a 3D Klein bottle that moves randomly on the left side of screen
 */

class KleinBottle {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.time = 0;
        this.animationId = null;
        
        // Klein bottle parameters
        this.centerX = 0;
        this.centerY = 0;
        this.radius = 0;
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
        this.rotationSpeedX = 0;
        this.rotationSpeedY = 0;
        this.rotationSpeedZ = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.moveSpeed = 0;
        
        // Points on the Klein bottle
        this.points = [];
        
        this.init();
    }
    
    init() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'klein-bottle';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '0';
        this.canvas.style.display = 'none';
        this.canvas.style.pointerEvents = 'none';
        document.body.appendChild(this.canvas);
        
        // Get context and set canvas size
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        // Initialize Klein bottle
        this.initKleinBottle();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resize());
        
        // Handle Reveal.js slide changes
        const reveal = document.querySelector('.reveal');
        if (reveal) {
            reveal.addEventListener('slidechanged', (event) => {
                const currentSlide = event.currentSlide;
                const isPhysicsSlide = currentSlide.querySelector('h2') && 
                                      currentSlide.querySelector('h2').textContent.includes('Physics');
                
                if (isPhysicsSlide) {
                    this.show();
                } else {
                    this.hide();
                }
            });
            
            // Check if already on Physics slide when page loads
            setTimeout(() => {
                const currentSlide = reveal.querySelector('.present');
                if (currentSlide && currentSlide.querySelector('h2') && 
                    currentSlide.querySelector('h2').textContent.includes('Physics')) {
                    this.show();
                }
            }, 500);
        }
    }
    
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.initKleinBottle();
    }
    
    initKleinBottle() {
        // Set initial position to left side of screen (30% from left)
        this.centerX = this.width * 0.2;
        this.centerY = this.height / 2;
        
        // Set radius based on screen size
        this.radius = Math.min(this.width, this.height) * 0.15;
        
        // Set random initial rotation
        this.rotationX = Math.random() * Math.PI * 2;
        this.rotationY = Math.random() * Math.PI * 2;
        this.rotationZ = Math.random() * Math.PI * 2;
        
        // Set random rotation speeds
        this.rotationSpeedX = (Math.random() * 0.01 - 0.005) * 0.5;
        this.rotationSpeedY = (Math.random() * 0.01 - 0.005) * 0.5;
        this.rotationSpeedZ = (Math.random() * 0.01 - 0.005) * 0.5;
        
        // Set random target position
        this.setNewTarget();
        
        // Set movement speed
        this.moveSpeed = 0.5;
        
        // Generate points on the Klein bottle
        this.generatePoints();
    }
    
    setNewTarget() {
        // Set target position on left side of screen
        const margin = this.radius * 2;
        const leftSideEnd = this.width * 0.4; // End at 40% of screen width
        this.targetX = margin + Math.random() * (leftSideEnd - margin);
        this.targetY = margin + Math.random() * (this.height - margin * 2);
    }
    
    generatePoints() {
        this.points = [];
        const segments = 150;
        
        for (let u = 0; u <= Math.PI * 2; u += Math.PI * 2 / segments) {
            for (let v = 0; v <= Math.PI * 2; v += Math.PI * 2 / segments) {
                // Klein bottle parametric equations
                const x = (2 + Math.cos(u/2)*Math.sin(v) - Math.sin(u/2)*Math.sin(2*v)) * this.radius/3;
                const y = (Math.sin(u/2)*Math.sin(v) + Math.cos(u/2)*Math.sin(2*v)) * this.radius/3;
                const z = Math.sin(u) * this.radius/2;
                
                this.points.push({ x, y, z, u, v });
            }
        }
    }
    
    project(point) {
        // Apply rotations
        let x = point.x;
        let y = point.y;
        let z = point.z;
        
        // Rotate around X axis
        let y1 = y * Math.cos(this.rotationX) - z * Math.sin(this.rotationX);
        let z1 = y * Math.sin(this.rotationX) + z * Math.cos(this.rotationX);
        y = y1;
        z = z1;
        
        // Rotate around Y axis
        let x1 = x * Math.cos(this.rotationY) + z * Math.sin(this.rotationY);
        let z2 = -x * Math.sin(this.rotationY) + z * Math.cos(this.rotationY);
        x = x1;
        z = z2;
        
        // Rotate around Z axis
        let x2 = x * Math.cos(this.rotationZ) - y * Math.sin(this.rotationZ);
        let y2 = x * Math.sin(this.rotationZ) + y * Math.cos(this.rotationZ);
        x = x2;
        y = y2;
        
        // Perspective projection
        const scale = 1000 / (1000 + z);
        const projectedX = x * scale + this.centerX;
        const projectedY = y * scale + this.centerY;
        
        return {
            x: projectedX,
            y: projectedY,
            z: z,
            scale: scale
        };
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.time += 0.016;
        
        // Update rotation
        this.rotationX += this.rotationSpeedX;
        this.rotationY += this.rotationSpeedY;
        this.rotationZ += this.rotationSpeedZ;
        
        // Move toward target
        const dx = this.targetX - this.centerX;
        const dy = this.targetY - this.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 1) {
            this.centerX += dx * this.moveSpeed / distance;
            this.centerY += dy * this.moveSpeed / distance;
        } else {
            this.setNewTarget();
        }
        
        // Project and draw points
        const projectedPoints = this.points.map(point => this.project(point));
        projectedPoints.sort((a, b) => a.z - b.z);
        
        for (let i = 0; i < projectedPoints.length; i++) {
            const point = projectedPoints[i];
            
        // Flashing bright blue color scheme
        const flash = Math.abs(Math.sin(this.time * 2)); // Flash intensity from 0 to 1
        const baseAlpha = 0.6;
        const alpha = baseAlpha + flash * 0.4; // Vary alpha from 0.6 to 1.0
        
        this.ctx.beginPath();
        this.ctx.shadowColor = `rgba(0, 255, 255, ${flash * 0.8})`;
        this.ctx.shadowBlur = 12;
        this.ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
            
            const size = 2 * point.scale;
            this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }
        
        // Occasionally change rotation speeds
        if (Math.random() < 0.005) {
            this.rotationSpeedX = (Math.random() * 0.01 - 0.005) * 0.5;
            this.rotationSpeedY = (Math.random() * 0.01 - 0.005) * 0.5;
            this.rotationSpeedZ = (Math.random() * 0.01 - 0.005) * 0.5;
        }
    }
    
    animate() {
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    show() {
        this.canvas.style.display = 'block';
        this.radius = Math.min(this.width, this.height) * 0.2;
        this.generatePoints();
        this.draw();
        this.animate();
    }
    
    hide() {
        this.canvas.style.display = 'none';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const kleinBottle = new KleinBottle();
    
    setTimeout(() => {
        const currentSlide = document.querySelector('.reveal .present');
        if (currentSlide && currentSlide.querySelector('h2') && 
            currentSlide.querySelector('h2').textContent.includes('Physics')) {
            kleinBottle.show();
        }
    }, 1000);
});
