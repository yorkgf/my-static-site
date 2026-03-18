/**
 * Matrix Code Rain Effect
 * Creates a dynamic code stream background similar to "The Matrix" movie
 */

class MatrixCodeRain {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.drops = [];
        this.fontSize = 16;  // Slightly larger font size for better visibility
        this.columns = 0;
        this.width = 0;
        this.height = 0;
        
        // Matrix code characters (mix of Latin, katakana, and symbols)
        this.characters = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz<>?/{}[]|~!@#$%^&*()_+-=';
        
        this.init();
        this.resize();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resize());
        
        // Start animation
        this.animate();
    }
    
    init() {
        // Calculate number of columns based on font size
        this.columns = Math.floor(this.width / this.fontSize);
        
        // Initialize drops at random positions
        this.drops = [];
        for (let i = 0; i < this.columns; i++) {
            // Start at random position above the canvas
            this.drops[i] = Math.floor(Math.random() * -100);
        }
    }
    
    resize() {
        // Update canvas size
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Recalculate columns
        this.columns = Math.floor(this.width / this.fontSize);
        
        // Reinitialize drops if needed
        if (this.drops.length !== this.columns) {
            this.init();
        }
    }
    
    draw() {
        // Semi-transparent black to create trail effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';  // Slightly more opaque for faster trails
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Green text for matrix effect
        this.ctx.fillStyle = '#0F0';
        this.ctx.font = 'bold ' + this.fontSize + 'px monospace';  // Bold font for better visibility
        
        // Draw each drop
        for (let i = 0; i < this.drops.length; i++) {
            // Random character
            const text = this.characters.charAt(Math.floor(Math.random() * this.characters.length));
            
            // Calculate position
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;
            
            // Draw the character
            if (y > 0) {
                // First character in each column is brighter (leading character)
                if (this.drops[i] <= 1) {
                    this.ctx.fillStyle = 'rgba(180, 255, 180, 1)'; // Bright green-white
                    this.ctx.shadowColor = '#0f0';
                    this.ctx.shadowBlur = 10;
                    this.ctx.fillText(text, x, y);
                    this.ctx.shadowBlur = 0;
                } else {
                    // Vary the green color slightly for more visual interest
                    const greenIntensity = 150 + Math.floor(Math.random() * 105);
                    const opacity = Math.max(0.5, 1 - (this.drops[i] / 50)); // Fade out as they fall
                    this.ctx.fillStyle = `rgba(0, ${greenIntensity}, 0, ${opacity})`;
                    this.ctx.fillText(text, x, y);
                }
            }
            
            // Move drop down
            this.drops[i]++;
            
            // Random reset to top when reaching bottom or randomly
            if (this.drops[i] * this.fontSize > this.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            
            // Random chance to reset some drops for varied effect
            if (Math.random() > 0.995) {
                this.drops[i] = 0;
            }
        }
    }
    
    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
    
    // Method to show the canvas
    show() {
        this.canvas.style.display = 'block';
    }
    
    // Method to hide the canvas
    hide() {
        this.canvas.style.display = 'none';
    }
}

// Initialize matrix code rain when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create a new canvas for the matrix effect
    const canvas = document.createElement('canvas');
    canvas.id = 'matrix-code';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.display = 'none'; // Hidden by default
    document.body.appendChild(canvas);
    
    // Initialize the matrix code rain
    const matrixCode = new MatrixCodeRain(canvas);
    
    // Handle Reveal.js slide changes to show/hide the matrix effect
    const reveal = document.querySelector('.reveal');
    if (reveal) {
        reveal.addEventListener('slidechanged', (event) => {
            // Check if this is the "Computer Science" slide
            const currentSlide = event.currentSlide;
            const isComputerScienceSlide = currentSlide.querySelector('h2') && 
                                          currentSlide.querySelector('h2').textContent.includes('Computer Science');
            
            if (isComputerScienceSlide) {
                matrixCode.show();
                // Keep the starfield visible but with lower opacity for a blended effect
                const starfield = document.getElementById('starfield');
                if (starfield) starfield.style.opacity = '0.3';
            } else {
                matrixCode.hide();
                // Show the starfield at full opacity on other slides
                const starfield = document.getElementById('starfield');
                if (starfield) {
                    starfield.style.display = 'block';
                    starfield.style.opacity = '1';
                }
            }
        });
        
        // Check if we're already on the Computer Science slide when the page loads
        setTimeout(() => {
            const currentSlide = reveal.querySelector('.present');
            if (currentSlide && currentSlide.querySelector('h2') && 
                currentSlide.querySelector('h2').textContent.includes('Computer Science')) {
                matrixCode.show();
                const starfield = document.getElementById('starfield');
                if (starfield) starfield.style.opacity = '0.3';
            }
        }, 500);
    }
});
