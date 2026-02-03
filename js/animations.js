// animations.js - Scroll-triggered animations

class ScrollAnimations {
  constructor() {
    this.animatedElements = document.querySelectorAll('[data-animate]');
    this.staggerContainers = document.querySelectorAll('[data-animate-stagger]');
    
    this.observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    };
    
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.setupObservers();
    } else {
      // Fallback: Show all elements immediately
      this.showAllElements();
    }
  }

  setupObservers() {
    // Observer for individual animated elements
    const elementObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target);
          elementObserver.unobserve(entry.target);
        }
      });
    }, this.observerOptions);

    this.animatedElements.forEach(element => {
      elementObserver.observe(element);
    });

    // Observer for stagger containers
    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateStaggerContainer(entry.target);
          staggerObserver.unobserve(entry.target);
        }
      });
    }, this.observerOptions);

    this.staggerContainers.forEach(container => {
      staggerObserver.observe(container);
    });
  }

  animateElement(element) {
    // Get custom delay if specified
    const delay = element.dataset.delay || 0;
    
    setTimeout(() => {
      element.classList.add('is-visible');
    }, parseInt(delay));
  }

  animateStaggerContainer(container) {
    container.classList.add('is-visible');
  }

  showAllElements() {
    this.animatedElements.forEach(element => {
      element.classList.add('is-visible');
    });
    
    this.staggerContainers.forEach(container => {
      container.classList.add('is-visible');
    });
  }

  // Method to manually trigger animation on an element
  triggerAnimation(element) {
    if (element.hasAttribute('data-animate')) {
      this.animateElement(element);
    } else if (element.hasAttribute('data-animate-stagger')) {
      this.animateStaggerContainer(element);
    }
  }

  // Method to reset an element's animation
  resetAnimation(element) {
    element.classList.remove('is-visible');
  }
}

// Parallax effect for background elements
class ParallaxEffect {
  constructor() {
    this.elements = document.querySelectorAll('[data-parallax]');
    this.init();
  }

  init() {
    if (this.elements.length === 0) return;
    
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  updateParallax() {
    const scrollY = window.scrollY;

    this.elements.forEach(element => {
      const speed = parseFloat(element.dataset.parallax) || 0.5;
      const offset = scrollY * speed;
      element.style.transform = `translateY(${offset}px)`;
    });
  }
}

// Cursor follow effect
class CursorEffect {
  constructor() {
    this.cursor = document.querySelector('.custom-cursor');
    this.interactiveElements = document.querySelectorAll('a, button, .glass-card, .skill-item');
    
    this.init();
  }

  init() {
    if (!this.cursor) return;
    
    // Check for touch devices
    if ('ontouchstart' in window) {
      this.cursor.style.display = 'none';
      return;
    }

    // Check for reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.cursor.style.display = 'none';
      return;
    }

    document.addEventListener('mousemove', (e) => {
      this.cursor.style.left = e.clientX + 'px';
      this.cursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mouseenter', () => {
      this.cursor.classList.add('custom-cursor--visible');
    });

    document.addEventListener('mouseleave', () => {
      this.cursor.classList.remove('custom-cursor--visible');
    });

    this.interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.cursor.classList.add('custom-cursor--hover');
      });
      
      el.addEventListener('mouseleave', () => {
        this.cursor.classList.remove('custom-cursor--hover');
      });
    });
  }
}

// Text typing animation
class TypeWriter {
  constructor(element, text, speed = 50) {
    this.element = element;
    this.text = text;
    this.speed = speed;
    this.index = 0;
  }

  type() {
    return new Promise((resolve) => {
      const typeChar = () => {
        if (this.index < this.text.length) {
          this.element.textContent += this.text.charAt(this.index);
          this.index++;
          setTimeout(typeChar, this.speed);
        } else {
          resolve();
        }
      };
      typeChar();
    });
  }

  clear() {
    this.element.textContent = '';
    this.index = 0;
  }
}

// Counter animation for stats
class CounterAnimation {
  constructor() {
    this.counters = document.querySelectorAll('[data-counter]');
    this.init();
  }

  init() {
    if (this.counters.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    this.counters.forEach(counter => observer.observe(counter));
  }

  animateCounter(element) {
    const target = parseInt(element.dataset.counter);
    const duration = parseInt(element.dataset.duration) || 2000;
    const start = 0;
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (target - start) * easeOutQuart);
      
      element.textContent = current.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target.toLocaleString();
      }
    };

    requestAnimationFrame(updateCounter);
  }
}

export { ScrollAnimations, ParallaxEffect, CursorEffect, TypeWriter, CounterAnimation };
export default ScrollAnimations;
