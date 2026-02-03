// Mobile Menu Toggle
const mobileMenu = document.querySelector('.mobile-menu');
const closeMenu = document.querySelector('.close-menu');
const mobileNav = document.querySelector('.mobile-nav');
const mobileLinks = document.querySelectorAll('.mobile-link');

mobileMenu.addEventListener('click', () => {
    mobileNav.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
});

closeMenu.addEventListener('click', () => {
    mobileNav.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable scrolling
});

mobileLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        // Close mobile menu
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';

        // Scroll to target section after a short delay to allow menu transition
        setTimeout(() => {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }, 300);
    });
});

// Header Scroll Effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        window.scrollTo({
            top: target.offsetTop - 80,
            behavior: 'smooth'
        });
    });
});

// Animation on Scroll
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe timeline items, project cards, and skill tags
document.querySelectorAll('.timeline-item, .project-card, .skill-tag').forEach(el => {
    observer.observe(el);
});

// Add animation classes
document.querySelectorAll('.timeline-item').forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = 'all 0.1s ease ' + (index * 0.2) + 's';
});

document.querySelectorAll('.project-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.5s ease ' + (index * 0.2) + 's';
});

document.querySelectorAll('.skill-tag').forEach((tag, index) => {
    tag.style.opacity = '0';
    tag.style.transform = 'translateY(20px)';
    tag.style.transition = 'all 0.3s ease ' + (index * 0.05) + 's';
});

// Prevent flip on button click
document.querySelectorAll('.project-links a').forEach(btn => {
    btn.addEventListener('click', e => {
        e.stopPropagation(); // Prevent flip on click
    });
});

// GPA bar fill animation
const gpaFills = document.querySelectorAll('.gpa-fill');

const gpaObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const fill = entry.target;
            const targetWidth = fill.getAttribute('data-width');
            fill.style.width = targetWidth;

            // Add bounce effect after width transition
            setTimeout(() => {
                fill.style.animation = 'bounce-scale 0.4s ease';
            }, 1000); // 1s matches your width transition time

            observer.unobserve(fill); // Animate once only
        }
    });
}, {
    threshold: 0.5
});

gpaFills.forEach(fill => {
    gpaObserver.observe(fill);
});

// Theme Toggle
const toggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

function updateThemeIcon() {
    const isLight = document.body.classList.contains('light-mode');
    themeIcon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
}

// Single event listener only
toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    updateThemeIcon();
});

// Run once on page load
updateThemeIcon();