/**
 * Animations using anime.js
 * Handles all the animations for page elements
 */

// Initialize animations when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Planet rotation animation
    animatePlanet();
    
    // Button pulse animation
    animateButton();
    
    // Title glow animation
    animateTitle();
});

/**
 * Animate the planet with rotation and pulsing effects
 */
function animatePlanet() {
    const planet = document.getElementById('planet1');
    if (!planet) return;
    
    // Create rotation animation
    anime({
        targets: planet,
        rotate: '360deg',
        duration: 30000,
        easing: 'linear',
        loop: true
    });
    
    // Create pulsing glow effect
    anime({
        targets: planet,
        boxShadow: [
            '0 0 15px rgba(74, 137, 220, 0.5)',
            '0 0 20px rgba(74, 137, 220, 0.6)',
            '0 0 15px rgba(74, 137, 220, 0.5)'
        ],
        duration: 5000,
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true
    });
    
    // Create subtle size animation
    anime({
        targets: planet,
        scale: [1, 1.03, 1],
        duration: 10000,
        easing: 'easeInOutSine',
        loop: true
    });
}

/**
 * Animate the embark button with a pulsing effect
 */
function animateButton() {
    const button = document.querySelector('.glow-button');
    if (!button) return;
    
    // Create pulsing animation
    anime({
        targets: button,
        boxShadow: [
            '0 0 8px rgba(85, 170, 255, 0.5)',
            '0 0 12px rgba(85, 170, 255, 0.6)',
            '0 0 8px rgba(85, 170, 255, 0.5)'
        ],
        scale: [1, 1.02, 1],
        duration: 3000,
        easing: 'easeInOutQuad',
        direction: 'alternate',
        loop: true
    });
}

/**
 * Animate the main title with a glow effect
 */
function animateTitle() {
    const title = document.querySelector('h1');
    if (!title) return;
    
    // Create glow animation
    anime({
        targets: title,
        textShadow: [
            '0 0 5px rgba(100, 180, 255, 0.5)',
            '0 0 8px rgba(100, 180, 255, 0.7)',
            '0 0 5px rgba(100, 180, 255, 0.5)'
        ],
        duration: 6000,
        easing: 'easeInOutSine',
        loop: true
    });
    
    // Create subtle color shift
    anime({
        targets: title,
        color: [
            '#8af',
            '#7af',
            '#8af'
        ],
        duration: 10000,
        easing: 'easeInOutSine',
        loop: true
    });
}

/**
 * Create a typing animation for text elements
 * @param {string} selector - CSS selector for the element
 * @param {string} text - Text to type
 * @param {number} speed - Typing speed in milliseconds
 */
function typeText(selector, text, speed = 50) {
    const element = document.querySelector(selector);
    if (!element) return;
    
    element.textContent = '';
    
    anime({
        targets: element,
        innerHTML: [0, text.length].map(i => text.substring(0, i)),
        easing: 'steps(' + text.length + ')',
        duration: text.length * speed,
        delay: 500
    });
}

/**
 * Create a floating animation for an element
 * @param {string} selector - CSS selector for the element
 */
function floatElement(selector) {
    const element = document.querySelector(selector);
    if (!element) return;
    
    anime({
        targets: element,
        translateY: ['0px', '-15px', '0px'],
        duration: 3000,
        easing: 'easeInOutQuad',
        loop: true
    });
}

// Export functions for use in other scripts
window.cosmicAnimations = {
    typeText,
    floatElement
};
