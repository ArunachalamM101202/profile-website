// main.js - Application entry point

import ThemeManager from './theme.js';
import Navigation from './navigation.js';
import ScrollAnimations from './animations.js';
import Terminal from './terminal.js';

class PortfolioApp {
  constructor() {
    this.data = null;
    this.init();
  }

  async init() {
    try {
      // Load portfolio data
      await this.loadData();
      
      // Initialize modules
      this.initTheme();
      this.initNavigation();
      this.initAnimations();
      this.initTerminal();
      
      // Render dynamic content
      this.renderHero();
      this.renderAbout();
      this.renderEducation();
      this.renderExperience();
      this.renderProjects();
      this.renderSkills();
      this.renderContact();
      
      // Initialize Lucide icons after all content is rendered
      this.initLucideIcons();
      
      // Initialize after render
      this.initScrollAnimations();
      
      console.log('Portfolio initialized successfully!');
    } catch (error) {
      console.error('Error initializing portfolio:', error);
    }
  }

  async loadData() {
    try {
      const response = await fetch('./data/portfolio.json');
      if (!response.ok) throw new Error('Failed to load data');
      this.data = await response.json();
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      throw error;
    }
  }

  initTheme() {
    new ThemeManager();
  }

  initNavigation() {
    new Navigation();
  }

  initAnimations() {
    // Initial animations are handled by CSS
  }

  initScrollAnimations() {
    new ScrollAnimations();
  }

  initLucideIcons() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  initTerminal() {
    if (this.data) {
      new Terminal('terminal', this.data);
    }
  }

  // === Render Methods ===

  renderHero() {
    if (!this.data) return;
    
    const { personal_info, about } = this.data;
    
    // Update hero content
    const heroName = document.querySelector('.hero__name');
    const heroTitle = document.querySelector('.hero__title');
    const heroDescription = document.querySelector('.hero__description');
    const heroImage = document.querySelector('.hero__image');
    
    if (heroName) {
      heroName.innerHTML = `Hi, I'm <span class="gradient-text">${personal_info.name.split(' ')[0]}</span>`;
    }
    
    if (heroTitle) {
      heroTitle.textContent = personal_info.title.split('|')[0].trim();
    }
    
    if (heroDescription) {
      heroDescription.textContent = about.summary.substring(0, 200) + '...';
    }
    
    if (heroImage) {
      heroImage.src = personal_info.profile_image;
      heroImage.alt = personal_info.name;
    }
    
    // Update social links
    this.renderSocialLinks('.hero__social', personal_info.contact);
  }

  renderSocialLinks(selector, contact) {
    const container = document.querySelector(selector);
    if (!container) return;
    
    container.innerHTML = `
      <a href="${contact.linkedin}" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="LinkedIn">
        <i data-lucide="linkedin"></i>
      </a>
      <a href="${contact.github_alt}" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="GitHub">
        <i data-lucide="github"></i>
      </a>
      <a href="mailto:${contact.email}" class="social-link" aria-label="Email">
        <i data-lucide="mail"></i>
      </a>
    `;
    
    // Re-initialize Lucide icons for new elements
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  renderAbout() {
    if (!this.data) return;
    
    const { about, personal_info } = this.data;
    const container = document.querySelector('.about-text');
    
    if (!container) return;
    
    container.innerHTML = `
      <p>${about.summary}</p>
      <p>${about.education_research}</p>
      <p>${about.current_work}</p>
      <p>${about.beyond_classroom}</p>
    `;
    
    // Update about image
    const aboutImage = document.querySelector('.about-image img');
    if (aboutImage) {
      aboutImage.src = personal_info.profile_image;
      aboutImage.alt = personal_info.name;
    }
  }

  renderExperience() {
    if (!this.data) return;
    
    const container = document.querySelector('.experience-grid');
    if (!container) return;
    
    container.innerHTML = this.data.experience.map(exp => `
      <article class="experience-card glass-card" data-animate="fade-up">
        <div class="experience-card__logo">
          <img src="${exp.logo}" alt="${exp.company} logo" loading="lazy" onerror="this.style.display='none'">
        </div>
        <div class="experience-card__content">
          <header class="experience-card__header">
            <h3 class="experience-card__company">${exp.company}</h3>
            <p class="experience-card__position">${exp.position}</p>
            <div class="experience-card__meta">
              <span><i data-lucide="calendar" class="icon-inline"></i> ${exp.duration}</span>
              <span><i data-lucide="map-pin" class="icon-inline"></i> ${exp.location}</span>
            </div>
          </header>
          <ul class="experience-card__responsibilities">
            ${exp.responsibilities.map(r => `<li>${r}</li>`).join('')}
          </ul>
          <div class="experience-card__tech">
            ${exp.technologies.slice(0, 6).map(tech => `<span class="tag">${tech}</span>`).join('')}
          </div>
        </div>
      </article>
    `).join('');
  }

  renderEducation() {
    if (!this.data) return;
    
    const container = document.querySelector('.education-grid');
    if (!container) return;
    
    container.innerHTML = this.data.education.map(edu => `
      <article class="education-card glass-card" data-animate="fade-up">
        <div class="education-card__logo">
          <img src="${edu.logo}" alt="${edu.institution} logo" loading="lazy" onerror="this.style.display='none'">
        </div>
        <div class="education-card__content">
          <h3 class="education-card__degree">${edu.degree}</h3>
          <p class="education-card__institution">${edu.institution}</p>
          <div class="education-card__meta">
            <span><i data-lucide="calendar" class="icon-inline"></i> ${edu.duration}</span>
            <span><i data-lucide="map-pin" class="icon-inline"></i> ${edu.location}</span>
            <span class="education-card__gpa"><i data-lucide="award" class="icon-inline"></i> GPA: ${edu.gpa}</span>
          </div>
          <div class="education-card__coursework">
            <p class="education-card__coursework-title">Relevant Coursework:</p>
            <div class="education-card__coursework-list">
              ${edu.coursework.map(course => `<span class="tag">${course}</span>`).join('')}
            </div>
          </div>
        </div>
      </article>
    `).join('');
  }

  renderProjects() {
    if (!this.data) return;
    
    const container = document.querySelector('.projects-grid');
    if (!container) return;
    
    container.innerHTML = this.data.projects.map(proj => {
      let badge = '';
      if (proj.achievement) {
        badge = `<span class="project-card__badge">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
            <path d="M5 8.5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0zm3.5-1.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
            <path d="M8.5 0a8.5 8.5 0 105.27 15.176l5.294 5.294a1 1 0 001.414-1.414l-5.294-5.294A8.5 8.5 0 008.5 0zm-6.5 8.5a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"/>
          </svg>
          ${proj.achievement}
        </span>`;
      } else if (proj.publication) {
        badge = `<span class="project-card__badge">📄 ${proj.publication}</span>`;
      }
      
      return `
        <article class="project-card glass-card" data-animate="fade-up">
          ${badge}
          <h3 class="project-card__title">${proj.name}</h3>
          <div class="project-card__description">
            ${proj.description.map(d => `<p>${d}</p>`).join('')}
          </div>
          <div class="project-card__tech">
            ${proj.technologies.map(tech => `<span class="tag">${tech}</span>`).join('')}
          </div>
        </article>
      `;
    }).join('');
  }

  renderSkills() {
    if (!this.data) return;
    
    const container = document.querySelector('.skills-grid');
    if (!container) return;
    
    const { skills } = this.data;
    
    const categories = [
      { key: 'languages', title: 'Programming Languages', icon: 'code-2' },
      { key: 'ai_ml', title: 'AI & Machine Learning', icon: 'brain' },
      { key: 'frameworks_libraries', title: 'Frameworks & Libraries', icon: 'library' },
      { key: 'cloud_backend_data', title: 'Cloud & Infrastructure', icon: 'cloud' }
    ];
    
    container.innerHTML = categories.map(cat => `
      <div class="skills-category glass-card" data-animate="fade-up">
        <h3 class="skills-category__title"><i data-lucide="${cat.icon}" class="icon-inline"></i> ${cat.title}</h3>
        <div class="skills-list" data-animate-stagger>
          ${skills[cat.key].map(skill => `<span class="skill-item">${skill}</span>`).join('')}
        </div>
      </div>
    `).join('');
    
    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  renderContact() {
    if (!this.data) return;
    
    const { contact, resume_link } = this.data.personal_info;
    
    // Update contact methods
    const contactMethods = document.querySelector('.contact-methods');
    if (contactMethods) {
      contactMethods.innerHTML = `
        <a href="mailto:${contact.email}" class="contact-method">
          <i data-lucide="mail"></i>
          ${contact.email}
        </a>
        <a href="tel:${contact.phone.replace(/[^0-9]/g, '')}" class="contact-method">
          <i data-lucide="phone"></i>
          ${contact.phone}
        </a>
      `;
    }
    
    // Update resume button
    const resumeBtn = document.querySelector('.resume-btn');
    if (resumeBtn) {
      resumeBtn.href = resume_link;
    }
    
    // Update contact social links
    this.renderSocialLinks('.contact-social', contact);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PortfolioApp();
});

export default PortfolioApp;
