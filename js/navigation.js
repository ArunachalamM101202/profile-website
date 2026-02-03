// navigation.js - Header scroll behavior & active states

class Navigation {
  constructor() {
    this.header = document.querySelector('.header');
    this.mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    this.mobileNav = document.querySelector('.mobile-nav');
    this.mobileNavOverlay = document.querySelector('.mobile-nav__overlay');
    this.navLinks = document.querySelectorAll('.nav__link, .mobile-nav__link');
    this.sections = document.querySelectorAll('section[id]');
    
    this.isScrolled = false;
    this.isMobileMenuOpen = false;
    this.scrollThreshold = 50;
    
    this.init();
  }

  init() {
    this.setupScrollListener();
    this.setupMobileMenu();
    this.setupSmoothScroll();
    this.setupActiveStates();
  }

  setupScrollListener() {
    let ticking = false;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      if (scrollY > this.scrollThreshold && !this.isScrolled) {
        this.isScrolled = true;
        this.header?.classList.add('header--scrolled');
      } else if (scrollY <= this.scrollThreshold && this.isScrolled) {
        this.isScrolled = false;
        this.header?.classList.remove('header--scrolled');
      }
      
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
      }
    }, { passive: true });

    // Initial check
    handleScroll();
  }

  setupMobileMenu() {
    if (!this.mobileMenuBtn || !this.mobileNav) return;

    // Toggle button click
    this.mobileMenuBtn.addEventListener('click', () => {
      this.toggleMobileMenu();
    });

    // Overlay click to close
    if (this.mobileNavOverlay) {
      this.mobileNavOverlay.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMobileMenuOpen) {
        this.closeMobileMenu();
      }
    });

    // Close menu when clicking nav links
    const mobileLinks = this.mobileNav.querySelectorAll('.mobile-nav__link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    this.mobileMenuBtn.classList.toggle('is-active', this.isMobileMenuOpen);
    this.mobileNav.classList.toggle('mobile-nav--open', this.isMobileMenuOpen);
    this.mobileNavOverlay?.classList.toggle('mobile-nav__overlay--visible', this.isMobileMenuOpen);
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
    
    // Accessibility
    this.mobileMenuBtn.setAttribute('aria-expanded', this.isMobileMenuOpen);
    this.mobileNav.setAttribute('aria-hidden', !this.isMobileMenuOpen);
  }

  closeMobileMenu() {
    if (!this.isMobileMenuOpen) return;
    
    this.isMobileMenuOpen = false;
    this.mobileMenuBtn.classList.remove('is-active');
    this.mobileNav.classList.remove('mobile-nav--open');
    this.mobileNavOverlay?.classList.remove('mobile-nav__overlay--visible');
    document.body.style.overflow = '';
    
    this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
    this.mobileNav.setAttribute('aria-hidden', 'true');
  }

  setupSmoothScroll() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            const headerOffset = this.header?.offsetHeight || 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }

  setupActiveStates() {
    if (this.sections.length === 0) return;

    const observerOptions = {
      rootMargin: `-${(this.header?.offsetHeight || 80) + 20}px 0px -50% 0px`,
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('id');
          this.setActiveLink(sectionId);
        }
      });
    }, observerOptions);

    this.sections.forEach(section => {
      observer.observe(section);
    });
  }

  setActiveLink(sectionId) {
    this.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      const isActive = href === `#${sectionId}`;
      
      link.classList.toggle('nav__link--active', isActive);
      link.classList.toggle('mobile-nav__link--active', isActive);
      
      if (isActive) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }
}

export default Navigation;
