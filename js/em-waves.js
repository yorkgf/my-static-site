/**
 * Dynamic Blue Ripples Animation
 * Creates sparse blue ripples on a black background with randomly appearing wave sources
 */

class EMWaves {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.ripples = [];
        this.time = 0;
        this.animationId = null;
        this.nextRippleTime = 0;
        
        this.init();
    }
    
    init() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'em-waves';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.display = 'none'; // Hidden by default
        document.body.appendChild(this.canvas);
        
        // Get context and set canvas size
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        // Create waves
        this.createWaves();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resize());
        
        // Handle Reveal.js slide changes
        const reveal = document.querySelector('.reveal');
        if (reveal) {
            reveal.addEventListener('slidechanged', (event) => {
                // Check if this is the "Space Technologies" slide
                const currentSlide = event.currentSlide;
                const isSpaceTechSlide = currentSlide.querySelector('h2') && 
                                        currentSlide.querySelector('h2').textContent.includes('Space Technologies');
                
                if (isSpaceTechSlide) {
                    this.show();
                } else {
                    this.hide();
                }
            });
            
            // Check if we're already on the Space Technologies slide when the page loads
            setTimeout(() => {
                const currentSlide = reveal.querySelector('.present');
                if (currentSlide && currentSlide.querySelector('h2') && 
                    currentSlide.querySelector('h2').textContent.includes('Space Technologies')) {
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
        
        // Recreate waves after resize
        this.createWaves();
    }
    
    createWaves() {
        // Initialize empty ripples array
        this.ripples = [];
        
        // Set initial time for next ripple
        this.nextRippleTime = 0;
    }
    
    // Create multiple ripples at different positions to show interference
    createRipple() {
        // Choose from a variety of blue colors
        const blueColors = [
            'rgba(30, 144, 255, alpha)',  // Dodger Blue
            'rgba(0, 191, 255, alpha)',   // Deep Sky Blue
            'rgba(65, 105, 225, alpha)',  // Royal Blue
            'rgba(100, 149, 237, alpha)', // Cornflower Blue
            'rgba(0, 0, 255, alpha)'      // Pure Blue
        ];
        
        // Create 2-3 wave sources simultaneously
        const sourceCount = 2 + Math.floor(Math.random() * 2); // 2 or 3
        const sourcePositions = [];
        
        // Generate positions for wave sources
        for (let i = 0; i < sourceCount; i++) {
            // Ensure sources are not too close to each other
            let x, y, tooClose;
            do {
                x = Math.random() * this.width;
                y = Math.random() * this.height;
                tooClose = false;
                
                // Check distance from other sources
                for (let j = 0; j < sourcePositions.length; j++) {
                    const dx = x - sourcePositions[j].x;
                    const dy = y - sourcePositions[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // If too close, try again
                    if (distance < Math.min(this.width, this.height) * 0.2) {
                        tooClose = true;
                        break;
                    }
                }
            } while (tooClose);
            
            sourcePositions.push({ x, y });
        }
        
        // Create ripples at each source position
        for (let i = 0; i < sourcePositions.length; i++) {
            const pos = sourcePositions[i];
            const selectedColor = blueColors[Math.floor(Math.random() * blueColors.length)];
            
            // Create ripple
            this.ripples.push({
                x: pos.x,
                y: pos.y,
                radius: 0,
                maxRadius: Math.min(this.width, this.height) * (0.3 + Math.random() * 0.3), // Larger max size
                speed: 1 + Math.random() * 1.5, // Random speed
                lineWidth: 1.5 + Math.random() * 2, // Random line width
                alpha: 0.8 + Math.random() * 0.2, // Random initial opacity
                color: selectedColor
            });
        }
    }
    
    draw() {
        // Clear canvas with pure black background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Semi-transparent for trail effect
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Every 10 frames, completely clear the canvas to prevent buildup
        if (Math.floor(this.time * 60) % 10 === 0) {
            this.ctx.fillStyle = 'rgb(0, 0, 0)';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
        
        // Increment time
        this.time += 0.016; // ~60fps
        
        // Check if it's time to create a new ripple
        if (this.time > this.nextRippleTime) {
            this.createRipple();
            // Set next ripple time (random interval between 0.5 and 3 seconds)
            this.nextRippleTime = this.time + 0.5 + Math.random() * 2.5;
        }
        
        // Update and draw ripples
        for (let i = 0; i < this.ripples.length; i++) {
            const ripple = this.ripples[i];
            
            // Update radius
            ripple.radius += ripple.speed;
            
            // Calculate opacity based on radius (fade out as it grows)
            const progress = ripple.radius / ripple.maxRadius;
            const opacity = ripple.alpha * (1 - progress);
            
            // Draw ripple
            this.ctx.beginPath();
            this.ctx.strokeStyle = ripple.color.replace('alpha', opacity.toFixed(2));
            this.ctx.lineWidth = ripple.lineWidth;
            
            // Add glow effect
            this.ctx.shadowColor = ripple.color.replace('alpha', '1');
            this.ctx.shadowBlur = 10;
            
            this.ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
        }
        
        // Remove ripples that have expanded beyond their max radius
        this.ripples = this.ripples.filter(ripple => ripple.radius < ripple.maxRadius);
    }
    
    animate() {
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    show() {
        this.canvas.style.display = 'block';
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

// Initialize EM waves when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EMWaves();
});
