/**
 * Space Elements
 * Creates and animates space elements like spaceships and space stations
 */

class SpaceElements {
    constructor() {
        this.elements = [];
        this.container = null;
        this.init();
    }
    
    init() {
        // Create container for space elements
        this.container = document.createElement('div');
        this.container.id = 'space-elements-container';
        this.container.style.position = 'fixed';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.pointerEvents = 'none';
        this.container.style.zIndex = '0';
        document.body.appendChild(this.container);
        
        // Create space elements
        this.createSpaceStation();
        this.createSpaceships();
    }
    
    createSpaceStation() {
        // Create space station element
        const station = document.createElement('div');
        station.className = 'space-station';
        this.container.appendChild(station);
        
        // Position the space station
        const x = window.innerWidth * 0.8;
        const y = window.innerHeight * 0.4;
        
        station.style.position = 'absolute';
        station.style.left = x + 'px';
        station.style.top = y + 'px';
        
        // Add to elements array
        this.elements.push({
            element: station,
            type: 'station',
            x: x,
            y: y,
            rotation: 0,
            rotationSpeed: 0.05
        });
        
        // Animate the space station
        this.animateSpaceStation(station);
    }
    
    createSpaceships() {
        // Create multiple spaceships
        const shipCount = 3;
        
        for (let i = 0; i < shipCount; i++) {
            const ship = document.createElement('div');
            ship.className = 'spaceship spaceship-' + (i + 1);
            this.container.appendChild(ship);
            
            // Random position
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            
            ship.style.position = 'absolute';
            ship.style.left = x + 'px';
            ship.style.top = y + 'px';
            
            // Random speed and direction
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.3 + Math.random() * 0.5;
            
            // Add to elements array
            this.elements.push({
                element: ship,
                type: 'ship',
                x: x,
                y: y,
                angle: angle,
                speed: speed,
                rotationSpeed: 0.02 + Math.random() * 0.05
            });
        }
        
        // Start animation
        this.animateSpaceships();
    }
    
    animateSpaceStation(station) {
        // Subtle rotation animation for space station
        anime({
            targets: station,
            rotate: '360deg',
            duration: 120000,
            easing: 'linear',
            loop: true
        });
        
        // Subtle pulsing effect
        anime({
            targets: station,
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8],
            duration: 15000,
            easing: 'easeInOutSine',
            loop: true
        });
    }
    
    animateSpaceships() {
        // Animation loop for spaceships
        const animate = () => {
            for (let i = 0; i < this.elements.length; i++) {
                const element = this.elements[i];
                
                if (element.type === 'ship') {
                    // Update position
                    element.x += Math.cos(element.angle) * element.speed;
                    element.y += Math.sin(element.angle) * element.speed;
                    
                    // Calculate responsive boundary based on viewport size
                    const boundarySize = Math.min(window.innerWidth, window.innerHeight) * 0.05;
                    
                    // Wrap around screen edges with responsive boundaries
                    if (element.x < -boundarySize) element.x = window.innerWidth + boundarySize;
                    if (element.x > window.innerWidth + boundarySize) element.x = -boundarySize;
                    if (element.y < -boundarySize) element.y = window.innerHeight + boundarySize;
                    if (element.y > window.innerHeight + boundarySize) element.y = -boundarySize;
                    
                    // Apply position
                    element.element.style.left = element.x + 'px';
                    element.element.style.top = element.y + 'px';
                    
                    // Apply rotation to match movement direction
                    const rotation = (element.angle * 180 / Math.PI) + 90;
                    element.element.style.transform = `rotate(${rotation}deg)`;
                }
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    // Handle window resize
    resize() {
        // Update positions relative to new window size
        for (let i = 0; i < this.elements.length; i++) {
            const element = this.elements[i];
            
            if (element.type === 'station') {
                // Update station position
                element.x = window.innerWidth * 0.8;
                element.y = window.innerHeight * 0.2;
                element.element.style.left = element.x + 'px';
                element.element.style.top = element.y + 'px';
            } else if (element.type === 'ship') {
                // Keep ships within new window bounds
                if (element.x > window.innerWidth) {
                    element.x = window.innerWidth * 0.8;
                }
                if (element.y > window.innerHeight) {
                    element.y = window.innerHeight * 0.8;
                }
                element.element.style.left = element.x + 'px';
                element.element.style.top = element.y + 'px';
            }
        }
    }
}

// Initialize space elements when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const spaceElements = new SpaceElements();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        spaceElements.resize();
    });
    
    // Handle Reveal.js slide changes to show/hide space elements
    const reveal = document.querySelector('.reveal');
    if (reveal) {
        reveal.addEventListener('slidechanged', (event) => {
            // Check if this is the "Computer Science" or "Physics" slide
            const currentSlide = event.currentSlide;
            const isDigitalFrontierSlide = currentSlide.querySelector('h2') && 
                                          currentSlide.querySelector('h2').textContent.includes('Computer Science');
            const isSpaceTechSlide = currentSlide.querySelector('h2') && 
                                    currentSlide.querySelector('h2').textContent.includes('Physics');
            
            // Hide space elements on Computer Science and Physics slides
            if ((isDigitalFrontierSlide || isSpaceTechSlide) && spaceElements.container) {
                spaceElements.container.style.display = 'none';
            } else if (spaceElements.container) {
                spaceElements.container.style.display = 'block';
            }
        });
        
        // Check if we're already on one of these slides when the page loads
        setTimeout(() => {
            const currentSlide = reveal.querySelector('.present');
            if (currentSlide && currentSlide.querySelector('h2')) {
                const heading = currentSlide.querySelector('h2').textContent;
                if (heading.includes('Computer Science') || heading.includes('Physics')) {
                    if (spaceElements.container) {
                        spaceElements.container.style.display = 'none';
                    }
                }
            }
        }, 500);
    }
});
