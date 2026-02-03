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
      this.renderExperience();
      this.renderEducation();
      this.renderProjects();
      this.renderSkills();
      this.renderContact();
      
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </a>
      <a href="${contact.github_alt}" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="GitHub">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      </a>
      <a href="mailto:${contact.email}" class="social-link" aria-label="Email">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
        </svg>
      </a>
    `;
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
              <span>📅 ${exp.duration}</span>
              <span>📍 ${exp.location}</span>
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
            <span>📅 ${edu.duration}</span>
            <span>📍 ${edu.location}</span>
            <span class="education-card__gpa">GPA: ${edu.gpa}</span>
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
      { key: 'languages', title: 'Programming Languages', icon: '💻' },
      { key: 'ai_ml', title: 'AI & Machine Learning', icon: '🤖' },
      { key: 'frameworks_libraries', title: 'Frameworks & Libraries', icon: '📚' },
      { key: 'cloud_backend_data', title: 'Cloud & Infrastructure', icon: '☁️' }
    ];
    
    container.innerHTML = categories.map(cat => `
      <div class="skills-category glass-card" data-animate="fade-up">
        <h3 class="skills-category__title">${cat.icon} ${cat.title}</h3>
        <div class="skills-list" data-animate-stagger>
          ${skills[cat.key].map(skill => `<span class="skill-item">${skill}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }

  renderContact() {
    if (!this.data) return;
    
    const { contact, resume_link } = this.data.personal_info;
    
    // Update contact methods
    const contactMethods = document.querySelector('.contact-methods');
    if (contactMethods) {
      contactMethods.innerHTML = `
        <a href="mailto:${contact.email}" class="contact-method">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
          </svg>
          ${contact.email}
        </a>
        <a href="tel:${contact.phone.replace(/[^0-9]/g, '')}" class="contact-method">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
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
