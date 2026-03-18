/**
 * Starfield Animation
 * Creates a dynamic starfield effect that simulates space travel
 */

class Starfield {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.stars = [];
        this.twinklingStars = [];
        this.starCount = 300;
        this.twinklingStarCount = 30; // Small number of twinkling stars
        this.speed = 1.5;
        this.maxDepth = 1000;
        this.width = 0;
        this.height = 0;
        this.centerX = 0;
        this.centerY = 0;
        
        this.init();
        this.resize();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resize());
        
        // Start animation
        this.animate();
    }
    
    init() {
        // Create regular stars
        for (let i = 0; i < this.starCount; i++) {
            this.stars.push({
                x: Math.random() * 2000 - 1000,
                y: Math.random() * 2000 - 1000,
                z: Math.random() * this.maxDepth,
                size: 1,
                color: this.getStarColor()
            });
        }
        
        // Create twinkling stars with slow frequency
        for (let i = 0; i < this.twinklingStarCount; i++) {
            this.twinklingStars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: 1 + Math.random() * 2,
                opacity: Math.random(),
                twinkleSpeed: 0.003 + Math.random() * 0.005, // Slow twinkle speed
                twinkleDirection: Math.random() > 0.5 ? 1 : -1,
                color: this.getStarColor()
            });
        }
    }
    
    resize() {
        // Update canvas size
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Update center coordinates
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        
        // Reposition twinkling stars
        for (let i = 0; i < this.twinklingStars.length; i++) {
            this.twinklingStars[i].x = Math.random() * this.width;
            this.twinklingStars[i].y = Math.random() * this.height;
        }
    }
    
    getStarColor() {
        // Generate random star colors (mostly white/blue with occasional other colors)
        const colors = [
            '#FFFFFF', // White
            '#AAAAFF', // Light blue
            '#EEEEFF', // Very light blue
            '#FFFF99', // Light yellow
            '#FFDDDD', // Light red
            '#99FFFF'  // Cyan
        ];
        
        // 80% chance of white/blue stars
        if (Math.random() < 0.8) {
            return colors[Math.floor(Math.random() * 3)];
        }
        
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw twinkling stars
        for (let i = 0; i < this.twinklingStars.length; i++) {
            const star = this.twinklingStars[i];
            
            // Update opacity for twinkling effect
            star.opacity += star.twinkleSpeed * star.twinkleDirection;
            
            // Change direction if reaching opacity limits
            if (star.opacity > 1 || star.opacity < 0.2) {
                star.twinkleDirection *= -1;
            }
            
            // Draw the twinkling star
            this.ctx.beginPath();
            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = star.opacity;
            this.ctx.shadowColor = star.color;
            this.ctx.shadowBlur = 5;
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Reset shadow and opacity
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
        
        // Draw moving stars
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            
            // Calculate star position based on z-depth
            const x = (star.x / star.z) * this.maxDepth + this.centerX;
            const y = (star.y / star.z) * this.maxDepth + this.centerY;
            
            // Calculate star size based on z-depth
            const size = Math.max(0.5, (this.maxDepth / star.z) * star.size);
            
            // Calculate star opacity based on z-depth
            const opacity = Math.min(1, (this.maxDepth - star.z) / this.maxDepth);
            
            // Draw star
            this.ctx.beginPath();
            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = opacity;
            
            // Create a glow effect for closer stars
            if (star.z < this.maxDepth / 4) {
                const glow = (this.maxDepth / star.z) * 0.3;
                this.ctx.shadowColor = star.color;
                this.ctx.shadowBlur = glow;
            } else {
                this.ctx.shadowBlur = 0;
            }
            
            // Draw the star
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Removed star streaks as requested
            
            // Reset opacity
            this.ctx.globalAlpha = 1;
            
            // Update star position (move closer to create travel effect)
            star.z -= this.speed;
            
            // If star is too close, reset it to far away
            if (star.z <= 0) {
                star.x = Math.random() * 2000 - 1000;
                star.y = Math.random() * 2000 - 1000;
                star.z = this.maxDepth;
                star.color = this.getStarColor();
            }
        }
    }
    
    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize starfield when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('starfield');
    if (canvas) {
        new Starfield(canvas);
    }
});
