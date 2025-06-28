/**
 * Möbius Strip Animation
 * Creates a 3D Möbius strip that moves randomly in the background
 */

class MobiusStrip {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.time = 0;
        this.animationId = null;
        
        // Möbius strip parameters
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
        
        // Points on the Möbius strip
        this.points = [];
        
        this.init();
    }
    
    init() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'mobius-strip';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '0'; // Same level as other elements to ensure visibility
        this.canvas.style.display = 'none'; // Hidden by default
        this.canvas.style.pointerEvents = 'none'; // Allow clicks to pass through
        document.body.appendChild(this.canvas);
        
        // Get context and set canvas size
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        // Initialize Möbius strip
        this.initMobiusStrip();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resize());
        
        // Handle Reveal.js slide changes
        const reveal = document.querySelector('.reveal');
        if (reveal) {
            reveal.addEventListener('slidechanged', (event) => {
                // Check if this is the "Physics" slide
                const currentSlide = event.currentSlide;
                const isSpaceTechSlide = currentSlide.querySelector('h2') && 
                                        currentSlide.querySelector('h2').textContent.includes('Physics');
                
                if (isSpaceTechSlide) {
                    this.show();
                } else {
                    this.hide();
                }
            });
            
            // Check if we're already on the Physics slide when the page loads
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
        
        // Reinitialize Möbius strip after resize
        this.initMobiusStrip();
    }
    
    initMobiusStrip() {
        // Set initial position to right side of screen (70% from left)
        this.centerX = this.width * 0.8;
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
        
        // Generate points on the Möbius strip
        this.generatePoints();
    }
    
    setNewTarget() {
        // Set a new random target position on the right side of screen
        // Keep away from edges
        const margin = this.radius * 2;
        const rightSideStart = this.width * 0.6; // Start from 60% of screen width
        this.targetX = rightSideStart + Math.random() * (this.width - rightSideStart - margin);
        this.targetY = margin + Math.random() * (this.height - margin * 2);
    }
    
    generatePoints() {
        this.points = [];
        
        // Number of segments around the strip (increased for smoother appearance)
        const segments = 150;
        
        // Width of the strip
        const width = this.radius * 0.5;
        
        // Generate points on the Möbius strip
        for (let i = 0; i <= segments; i++) {
            const u = i / segments * Math.PI * 2;
            
            // Generate points across the width of the strip (increased for better density)
            for (let j = -7; j <= 7; j++) {
                const v = j / 7 * width;
                
                // Möbius strip parametric equations
                const x = (this.radius + v * Math.cos(u / 2)) * Math.cos(u);
                const y = (this.radius + v * Math.cos(u / 2)) * Math.sin(u);
                const z = v * Math.sin(u / 2);
                
                // Store the 3D point
                this.points.push({ x, y, z, u, v });
            }
        }
    }
    
    // Project a 3D point to 2D with rotation
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
        
        // Simple perspective projection
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
        // Clear canvas with transparent background
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Update time
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
            // Set new target if reached current target
            this.setNewTarget();
        }
        
        // Project all points
        const projectedPoints = this.points.map(point => this.project(point));
        
        // Sort points by z-coordinate for proper depth rendering
        projectedPoints.sort((a, b) => a.z - b.z);
        
        // Draw the Möbius strip
        for (let i = 0; i < projectedPoints.length; i++) {
            const point = projectedPoints[i];
            
            // Calculate color based on position and time for red-yellow-orange effect
            // Limit hue to the red-yellow-orange range (0-60 degrees)
            const hueBase = (point.u / (Math.PI * 2) * 60 + this.time * 5) % 60;
            
            // Calculate intensity based on z-coordinate for depth effect
            const intensity = (point.z + this.radius) / (this.radius * 2);
            
            // Determine if this point should be red, orange, or yellow
            let r, g, b;
            
            if (point.v > 0) {
                // Red to orange range (0-30 degrees)
                const hue = Math.max(0, Math.min(30, hueBase));
                r = Math.floor(165 * (hue / 30));
                g = Math.floor(165 * (hue / 30));
                b = 0;
            } else {
                // Orange to yellow range (30-60 degrees)
                const hue = Math.max(30, Math.min(60, hueBase + 30));
                r = Math.floor(100 + (255 - 165) * ((hue - 30) / 30));
                g = Math.floor(100 + (255 - 165) * ((hue - 30) / 30));
                b = 0;
            }
            
            const alpha = 0.8;
            
            // Draw a circle for each point with enhanced glow effect
            this.ctx.beginPath();
            
            // Add stronger glow effect
            this.ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 1.0)`;
            this.ctx.shadowBlur = 10; // Increased blur for more glow
            
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            
            // Size based on z-coordinate (perspective) - larger for more visibility
            const size = 3 * point.scale;
            
            this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add sparkle effect to some points
            if (Math.random() < 0.05) { // 5% chance for a sparkle
                this.ctx.beginPath();
                this.ctx.fillStyle = 'rgba(255, 140, 0, 0.63)';
                //this.ctx.shadowColor = 'rgba(255, 255, 255, 1.0)';
                this.ctx.shadowBlur = 15;
                
                // Draw a small bright dot
                const sparkleSize = (3 + Math.random() * 2) * point.scale;
                this.ctx.arc(point.x, point.y, sparkleSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Reset shadow for performance
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
        console.log('Showing Möbius strip');
        this.canvas.style.display = 'block';
        
        // Make the Möbius strip more visible
        this.radius = Math.min(this.width, this.height) * 0.2; // Larger radius
        this.generatePoints(); // Regenerate points with new radius
        
        // Force immediate redraw
        this.draw();
        
        // Start animation
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

// Initialize Möbius strip when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const mobiusStrip = new MobiusStrip();
    
    // Force check for Physics slide after a short delay
    setTimeout(() => {
        console.log('Checking for Physics slide');
        const currentSlide = document.querySelector('.reveal .present');
        if (currentSlide && currentSlide.querySelector('h2') && 
            currentSlide.querySelector('h2').textContent.includes('Physics')) {
            console.log('Found Physics slide, showing Möbius strip');
            mobiusStrip.show();
        }
    }, 1000);
});
