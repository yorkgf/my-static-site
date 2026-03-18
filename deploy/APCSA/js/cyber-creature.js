// Fourier pattern generator
class ByteStream {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.relativeX = Math.random(); // Store position as percentage (0-1)
    this.relativeY = Math.random();
    this.updatePosition();
    
    // Responsive speed based on screen size
    const baseFactor = Math.min(window.innerWidth, window.innerHeight) / 1000;
    this.speed = (0.5 + Math.random()) * baseFactor * 5;
    this.chars = '01';
    this.stream = [];
    this.length = 10 + Math.floor(Math.random() * 20);
    this.opacity = 0.1 + Math.random() * 0.3;
    
    // Initialize stream
    for (let i = 0; i < this.length; i++) {
      this.stream.push({
        char: this.chars[Math.floor(Math.random() * this.chars.length)],
        y: i * -20
      });
    }
  }

  updatePosition() {
    // Update actual position based on current canvas size and relative position
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    // Position within container bounds if possible
    const container = document.querySelector('.container');
    if (container) {
      const rect = container.getBoundingClientRect();
      this.x = rect.left + this.relativeX * rect.width;
      this.y = rect.top + this.relativeY * rect.height;
    } else {
      this.x = this.relativeX * this.width;
      this.y = this.relativeY * this.height;
    }
  }
  
  update() {
    // Update position in case window was resized
    this.updatePosition();
    
    // Move stream downward
    for (let i = 0; i < this.stream.length; i++) {
      this.stream[i].y += this.speed;
    }
    
    // Reset characters that fall off screen
    if (this.stream[0].y > this.height) {
      this.stream.shift();
      this.stream.push({
        char: this.chars[Math.floor(Math.random() * this.chars.length)],
        y: -20
      });
    }
  }

  draw() {
    this.ctx.save();
    this.ctx.translate(this.x, 0);
    
    // Responsive font size based on screen width
    const fontSize = Math.max(10, Math.min(16, window.innerWidth / 60));
    this.ctx.font = `${fontSize}px monospace`;
    
    // Draw with fading effect
    for (let i = 0; i < this.stream.length; i++) {
      const alpha = Math.min(1, (this.stream[i].y / 100) * this.opacity);
      this.ctx.fillStyle = `rgba(0, 255, 100, ${alpha})`;
      this.ctx.fillText(this.stream[i].char, 0, this.stream[i].y);
    }
    
    this.ctx.restore();
  }
}

class FourierPattern {
  constructor(canvas, type) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.type = type;
    
    // Fourier series parameters
    this.terms = 8;
    this.coefficients = [];
    this.frequencies = [];
    this.phases = [];
    
    // Store relative position (0-1) for responsive positioning
    this.relativeX = Math.random();
    this.relativeY = Math.random();
    this.x = 0;
    this.y = 0;
    
    // Responsive speed and size based on screen dimensions
    const sizeFactor = Math.min(window.innerWidth, window.innerHeight) / 1000;
    this.speed = (0.0001 + Math.random() * 0.0002) * sizeFactor * 2;
    this.time = 0;
    this.size = (30 + Math.random() * 50) * sizeFactor * 10;
    
    this.initializeCoefficients();
  }

  initializeCoefficients() {
    for (let i = 0; i < this.terms; i++) {
      this.coefficients.push(Math.random() * 30 + 10);
      this.frequencies.push(Math.random() * 0.03 + 0.005);
      this.phases.push(Math.random() * Math.PI * 2);
    }
  }

  updateSize() {
    // Update size based on current window dimensions
    const sizeFactor = Math.min(window.innerWidth, window.innerHeight) / 1000;
    this.size = (30 + Math.random() * 50) * sizeFactor * 10;
    
    // Update width and height
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }
  
  update() {
    this.updateSize();
    this.time += this.speed;
    
    // Calculate new position using Fourier series
    let dx = 0, dy = 0;
    for (let i = 0; i < this.terms; i++) {
      const t = this.time * this.frequencies[i] + this.phases[i];
      const sizeFactor = Math.min(window.innerWidth, window.innerHeight) / 1000;
      dx += this.coefficients[i] * Math.cos(t) * sizeFactor * 5;
      dy += this.coefficients[i] * Math.sin(t) * sizeFactor * 5;
    }
    
    // Position in center of tab content
    const tabContent = document.querySelector('.tab-content.active');
    if (tabContent) {
      const rect = tabContent.getBoundingClientRect();
      this.x = rect.left + rect.width/2 + dx;
      this.y = rect.top + rect.height/2 + dy;
    } else {
      this.x = this.width/2 + dx;
      this.y = this.height/2 + dy;
    }
  }

  draw() {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    
    // Draw different patterns based on type
    if (this.type === 'circle') {
      this.drawCirclePattern();
    } else if (this.type === 'spiral') {
      this.drawSpiralPattern();
    } else {
      this.drawComplexPattern();
    }
    
    this.ctx.restore();
  }

  drawCirclePattern() {
    this.ctx.beginPath();
    for (let i = 0; i < Math.PI * 2; i += 0.01) {
      const r = this.size * (0.8 + 0.2 * Math.sin(this.time * 2 + i * 5));
      const x = r * Math.cos(i);
      const y = r * Math.sin(i);
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.strokeStyle = `rgba(100, 200, 255, ${0.3 + 0.2 * Math.sin(this.time)})`;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  drawSpiralPattern() {
    this.ctx.beginPath();
    for (let i = 0; i < Math.PI * 4; i += 0.05) {
      const r = this.size * (0.5 + 0.3 * Math.sin(this.time + i));
      const x = r * Math.cos(i);
      const y = r * Math.sin(i);
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.strokeStyle = `rgba(255, 100, 200, ${0.3 + 0.2 * Math.cos(this.time)})`;
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
  }

  drawComplexPattern() {
    // Multi-layered Fourier pattern
    for (let layer = 0; layer < 3; layer++) {
      this.ctx.beginPath();
      for (let i = 0; i < Math.PI * 2; i += 0.02) {
        const r1 = this.size * (0.6 + 0.2 * Math.sin(this.time * 0.7 + i * 3 + layer));
        const r2 = this.size * (0.4 + 0.1 * Math.sin(this.time * 1.3 + i * 5 + layer * 2));
        const r = (r1 + r2) / 2;
        const x = r * Math.cos(i + this.time * 0.3 * layer);
        const y = r * Math.sin(i + this.time * 0.2 * layer);
        
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.closePath();
      this.ctx.strokeStyle = `rgba(${100 + layer * 50}, ${150 + layer * 30}, 255, ${0.2 + 0.1 * layer})`;
      this.ctx.lineWidth = 1 + layer * 0.5;
      this.ctx.stroke();
    }
  }
}

// Cyber creature using Fourier series animation
class CyberCreature {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    
    // Fourier series parameters
    this.terms = 5;
    this.coefficients = [];
    this.frequencies = [];
    this.phases = [];
    
    // Movement parameters
    this.x = this.width;
    this.y = this.height;
    
    // Responsive speed based on screen size
    const sizeFactor = Math.min(window.innerWidth, window.innerHeight) / 1000;
    this.speed = 0.0002 * sizeFactor * 2;
    this.time = 0;
    
    // Size factor for responsive sizing
    this.sizeFactor = sizeFactor;
    
    this.initializeCoefficients();
  }

  initializeCoefficients() {
    // Generate random Fourier coefficients
    for (let i = 0; i < this.terms; i++) {
      this.coefficients.push(Math.random() * 50 + 10);
      this.frequencies.push(Math.random() * 0.05 + 0.01);
      this.phases.push(Math.random() * Math.PI * 2);
    }
  }

  updateSize() {
    // Update dimensions and size factor
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.sizeFactor = Math.min(window.innerWidth, window.innerHeight) / 1000;
  }
  
  update() {
    this.updateSize();
    this.time += this.speed;
    
    // Calculate new position using Fourier series
    let dx = 0, dy = 0;
    for (let i = 0; i < this.terms; i++) {
      const t = this.time * this.frequencies[i] + this.phases[i];
      dx += this.coefficients[i] * Math.cos(t) * this.sizeFactor * 5;
      dy += this.coefficients[i] * Math.sin(t) * this.sizeFactor * 5;
    }
    
    this.x = this.width/2 + dx;
    this.y = this.height/2 + dy;
  }

  draw() {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    
    // Calculate responsive sizes
    const bodySize = 15 * this.sizeFactor * 10;
    const tentacleLength = (30 + 10 * Math.sin(this.time * 2)) * this.sizeFactor * 10;
    const lineWidth = Math.max(1, 2 * this.sizeFactor * 5);
    
    this.ctx.restore();
  }
}

// Main animation loop
function initCyberCreature() {
  const canvas = document.getElementById('cyber-creature');
  if (!canvas) return;
  
  // Set canvas size to match window
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  // Initial resize
  resizeCanvas();
  
  const creature = new CyberCreature(canvas);
  
  // Adjust number of patterns based on screen size
  const screenSize = Math.min(window.innerWidth, window.innerHeight);
  const patternCount = Math.max(3, Math.min(6, Math.floor(screenSize / 200)));
  
  const patterns = [];
  for (let i = 0; i < patternCount; i++) {
    const types = ['circle', 'spiral', 'complex'];
    const type = types[Math.floor(Math.random() * types.length)];
    //patterns.push(new FourierPattern(canvas, type));
  }

  // Create byte streams - number based on screen size
  const streamCount = Math.max(20, Math.min(50, Math.floor(screenSize / 30)));
  const byteStreams = [];
  for (let i = 0; i < streamCount; i++) {
    byteStreams.push(new ByteStream(canvas));
  }
  
  // Handle window resize
  window.addEventListener('resize', () => {
    resizeCanvas();
  });
  
  function animate() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw semi-transparent background
    ctx.fillStyle = 'rgba(10, 10, 20, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw patterns
    patterns.forEach(pattern => {
      pattern.update();
      pattern.draw();
    });
    
    // Update and draw byte streams
    byteStreams.forEach(stream => {
      stream.update();
      stream.draw();
    });

    // Update and draw creature
    creature.update();
    creature.draw();
    
    requestAnimationFrame(animate);
  }
  
  animate();
}

// Start animation when DOM is loaded
document.addEventListener('DOMContentLoaded', initCyberCreature);
