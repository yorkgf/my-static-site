/**
 * Main JavaScript
 * Initializes Reveal.js and coordinates all components
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Reveal.js
    initReveal();
    
    // Add event listeners for slide changes
    addSlideEventListeners();
    
    // Add interactive elements
    addInteractiveElements();
});

/**
 * Initialize Reveal.js with custom settings
 */
function initReveal() {
    // Initialize Reveal.js with configuration
    Reveal.initialize({
        // Display controls in the bottom right corner
        controls: true,
        
        // Display a presentation progress bar
        progress: true,
        
        // Display the page number of the current slide
        slideNumber: false,
        
        // Push each slide change to the browser history
        history: true,
        
        // Enable keyboard shortcuts for navigation
        keyboard: true,
        
        // Enable the slide overview mode
        overview: true,
        
        // Vertical centering of slides
        center: true,
        
        // Enable touch navigation on devices with touch input
        touch: true,
        
        // Loop the presentation
        loop: false,
        
        // Change the presentation direction to be RTL
        rtl: false,
        
        // Randomizes the order of slides each time the presentation loads
        shuffle: false,
        
        // Turn fragments on and off globally
        fragments: true,
        
        // Flags whether to include the current fragment in the URL
        fragmentInURL: false,
        
        // Flags if the presentation is running in an embedded mode,
        // i.e. contained within a limited portion of the screen
        embedded: false,
        
        // Flags if we should show a help overlay when the questionmark
        // key is pressed
        help: true,
        
        // Transition style
        transition: 'fade', // none/fade/slide/convex/concave/zoom
        
        // Transition speed
        transitionSpeed: 'default', // default/fast/slow
        
        // Transition style for full page slide backgrounds
        backgroundTransition: 'fade', // none/fade/slide/convex/concave/zoom
        
        // Number of slides away from the current that are visible
        viewDistance: 3,
        
        // Parallax background image
        parallaxBackgroundImage: '', // e.g. "'https://s3.amazonaws.com/hakim-static/reveal-js/reveal-parallax-1.jpg'"
        
        // Parallax background size
        parallaxBackgroundSize: '', // CSS syntax, e.g. "2100px 900px"
        
        // Number of pixels to move the parallax background per slide
        // - Calculated automatically unless specified
        // - Set to 0 to disable movement along an axis
        parallaxBackgroundHorizontal: null,
        parallaxBackgroundVertical: null,
        
        // The display mode that will be used to show slides
        display: 'block',
        
        // Add custom styling
        width: '100%',
        height: '100%',
        margin: 0,
        minScale: 1,
        maxScale: 1
    });
}

/**
 * Add event listeners for slide changes to trigger animations
 */
function addSlideEventListeners() {
    // Event fired when a slide is shown
    Reveal.on('slidechanged', event => {
        const currentSlide = event.currentSlide;
        const slideIndex = Reveal.getIndices().h;
        
        // Adjust starfield speed based on slide
        adjustStarfieldSpeed(slideIndex);
        
        // Add slide-specific animations
        animateSlideContent(currentSlide, slideIndex);
    });
    
    // Event fired when a fragment is shown
    Reveal.on('fragmentshown', event => {
        const fragment = event.fragment;
        
        // Add a subtle animation to the fragment that was just shown
        anime({
            targets: fragment,
            scale: [0.9, 1],
            opacity: [0, 1],
            duration: 800,
            easing: 'easeOutElastic(1, .5)'
        });
    });
}

/**
 * Adjust starfield speed based on current slide
 * @param {number} slideIndex - Current slide index
 */
function adjustStarfieldSpeed(slideIndex) {
    // Find the starfield canvas
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    
    // Get the starfield instance from the canvas
    const starfieldInstance = canvas._starfield;
    if (!starfieldInstance) return;
    
    // Toggle matrix code effect for Digital Frontier slide
    toggleMatrixEffect(slideIndex === 1);
    
    // Adjust speed based on slide index
    switch(slideIndex) {
        case 0: // Title slide - normal speed
            starfieldInstance.speed = 1.5;
            break;
        case 1: // Digital Frontier slide - use matrix effect instead
            starfieldInstance.speed = 0; // Pause starfield
            break;
        case 2: // Technologies slide - slower
            starfieldInstance.speed = 1.2;
            break;
        case 3: // Contact slide - slowest
            starfieldInstance.speed = 0.8;
            break;
        default:
            starfieldInstance.speed = 1.5;
    }
}

/**
 * Toggle the Matrix code effect based on current slide
 * @param {boolean} show - Whether to show the matrix effect
 */
function toggleMatrixEffect(show) {
    const matrixCanvas = document.getElementById('matrix-code');
    const starfieldCanvas = document.getElementById('starfield');
    const spaceElementsContainer = document.getElementById('space-elements-container');
    
    if (!matrixCanvas || !starfieldCanvas) return;
    
    if (show) {
        // Show Matrix effect, hide starfield and space elements
        matrixCanvas.style.display = 'block';
        starfieldCanvas.style.display = 'none';
        
        // Hide space elements on Digital Frontier slide
        if (spaceElementsContainer) {
            spaceElementsContainer.style.display = 'none';
        }
    } else {
        // Show starfield, hide Matrix effect
        matrixCanvas.style.display = 'none';
        starfieldCanvas.style.display = 'block';
        
        // Show space elements on other slides
        if (spaceElementsContainer) {
            spaceElementsContainer.style.display = 'block';
        }
    }
}

/**
 * Add slide-specific animations based on slide index
 * @param {Element} slide - Current slide element
 * @param {number} index - Slide index
 */
function animateSlideContent(slide, index) {
    // Clear any existing animations
    anime.remove(slide.querySelectorAll('*'));
    
    // Apply animations based on slide index
    switch(index) {
        case 0: // Title slide
            // Animate title with a fade-in and scale effect
            anime({
                targets: slide.querySelector('h1'),
                opacity: [0, 1],
                scale: [0.9, 1],
                duration: 1500,
                easing: 'easeOutExpo'
            });
            
            // Animate subtitle with a delay
            anime({
                targets: slide.querySelector('h3'),
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 1200,
                delay: 300,
                easing: 'easeOutExpo'
            });
            break;
            
        case 1: // Digital Frontier slide
            // Animate the terminal with a special entrance
            anime({
                targets: slide.querySelector('.terminal'),
                translateY: [50, 0],
                opacity: [0, 1],
                duration: 1500,
                easing: 'easeOutExpo'
            });
            
            // Animate the typing text
            setTimeout(() => {
                const typingText = slide.querySelector('.typing-text');
                if (typingText) {
                    typingText.style.width = '0';
                    setTimeout(() => {
                        typingText.style.width = '100%';
                    }, 100);
                }
            }, 500);
            break;
            
        case 2: // Technologies slide
            // Stagger animation for list items
            anime({
                targets: slide.querySelectorAll('li:not(.fragment)'),
                translateX: [50, 0],
                opacity: [0, 1],
                duration: 800,
                delay: anime.stagger(100),
                easing: 'easeOutQuad'
            });
            break;
            
        case 3: // Contact slide
            // Animate the form elements
            anime({
                targets: slide.querySelectorAll('.form-element:not(.fragment)'),
                translateY: [20, 0],
                opacity: [0, 1],
                duration: 800,
                delay: anime.stagger(150),
                easing: 'easeOutQuad'
            });
            break;
    }
}

/**
 * Add interactive elements and event listeners
 */
function addInteractiveElements() {
    // Add click event for the embark button
    const embarkButton = document.querySelector('.glow-button');
    if (embarkButton) {
        embarkButton.addEventListener('click', () => {
            // Create a cosmic particle effect on click
            createParticleEffect(embarkButton);
            
            // Show a thank you message
            const formContainer = document.querySelector('.contact-form');
            if (formContainer) {
                // Hide the form
                anime({
                    targets: formContainer,
                    opacity: 0,
                    duration: 500,
                    easing: 'easeOutQuad',
                    complete: () => {
                        // Replace with thank you message
                        formContainer.innerHTML = '<h3 class="thank-you">Thank you for joining our cosmic journey!</h3>';
                        
                        // Show the message
                        anime({
                            targets: formContainer,
                            opacity: 1,
                            duration: 800,
                            easing: 'easeInQuad'
                        });
                    }
                });
            }
        });
    }
}

/**
 * Create a particle effect originating from an element
 * @param {Element} element - Source element for the effect
 */
function createParticleEffect(element) {
    // Get element position
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    // Create particle container if it doesn't exist
    let particleContainer = document.getElementById('particle-container');
    if (!particleContainer) {
        particleContainer = document.createElement('div');
        particleContainer.id = 'particle-container';
        particleContainer.style.position = 'fixed';
        particleContainer.style.top = '0';
        particleContainer.style.left = '0';
        particleContainer.style.width = '100%';
        particleContainer.style.height = '100%';
        particleContainer.style.pointerEvents = 'none';
        particleContainer.style.zIndex = '9999';
        document.body.appendChild(particleContainer);
    }
    
    // Create particles
    const particleCount = 20;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.borderRadius = '50%';
        particle.style.backgroundColor = '#5af';
        particle.style.boxShadow = '0 0 5px #5af';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particleContainer.appendChild(particle);
        particles.push(particle);
    }
    
    // Animate particles
    particles.forEach(particle => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 150;
        const duration = 1000 + Math.random() * 1000;
        
        anime({
            targets: particle,
            translateX: Math.cos(angle) * distance,
            translateY: Math.sin(angle) * distance,
            scale: [1, 0],
            opacity: [1, 0],
            duration: duration,
            easing: 'easeOutExpo',
            complete: () => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }
        });
    });
}

// Store starfield instance for speed control
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('starfield');
    if (canvas) {
        // Wait a bit for the starfield to initialize
        setTimeout(() => {
            // Find the Starfield instance
            for (const key in canvas) {
                if (canvas[key] instanceof Starfield) {
                    canvas._starfield = canvas[key];
                    break;
                }
            }
        }, 500);
    }
});
