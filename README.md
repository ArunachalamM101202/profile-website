# Portfolio Website - Arunachalam Manikandan

A modern, Apple-inspired portfolio website featuring glassmorphism design, an interactive terminal, and a coral-to-purple gradient theme.

## 🎨 Design Philosophy

- **Apple-inspired minimalism** meets hacker aesthetic
- **Primary Accent:** Coral-to-Purple gradient (`#FF6B6B` → `#A855F7`)
- **Terminal Style:** Classic green phosphor on black (`#00FF00` on `#0a0a0a`)
- **Glass Effect:** Frosted glassmorphism with subtle blur and gradient borders

## 📁 Project Structure

```
portfolio/
├── index.html              # Main HTML file
├── css/
│   ├── variables.css       # CSS custom properties, theme tokens
│   ├── base.css            # Reset, typography, global styles
│   ├── components.css      # Reusable components (buttons, cards, glass)
│   ├── layout.css          # Grid, sections, navigation
│   ├── hero.css            # Hero section styles
│   ├── terminal.css        # Terminal-specific styles
│   ├── sections.css        # Content section styles
│   ├── animations.css      # Keyframes, transitions, scroll animations
│   └── responsive.css      # Media queries, mobile adjustments
├── js/
│   ├── main.js             # Entry point, initialization
│   ├── terminal.js         # Terminal logic, command parsing
│   ├── theme.js            # Dark/light mode toggle
│   ├── animations.js       # Scroll triggers, intersection observers
│   └── navigation.js       # Smooth scroll, active states
├── data/
│   └── portfolio.json      # All portfolio content
├── images/                  # Company logos and images
└── backup/                  # Previous website code
```

## ✨ Features

- **Interactive Terminal** - Explore the portfolio using command-line interface
- **Dark/Light Mode** - Toggle between themes with localStorage persistence
- **Glassmorphism UI** - Modern frosted glass card effects
- **Smooth Animations** - Scroll-triggered animations with Intersection Observer
- **Responsive Design** - Mobile-first approach with all breakpoints covered
- **Accessibility** - ARIA labels, focus states, reduced motion support
- **Dynamic Content** - All content loaded from JSON data file

## 🖥️ Terminal Commands

| Command | Description |
|---------|-------------|
| `help` | Show all available commands |
| `about` | Display personal summary and bio |
| `skills` | List technical skills by category |
| `experience` | Show work experience (paginated) |
| `education` | Display educational background |
| `projects` | Browse portfolio projects |
| `contact` | Show contact information |
| `social` | Open social media links |
| `resume` | Open resume in new tab |
| `whoami` | Quick introduction |
| `ls` | List available sections |
| `clear` | Clear terminal screen |
| `next/n` | Navigate to next item |
| `prev/p` | Navigate to previous item |

## 🚀 Getting Started

1. Clone or download the repository
2. Serve the files using a local web server (required for ES modules)

   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   
   # Using VS Code Live Server extension
   # Right-click index.html → Open with Live Server
   ```

3. Open `http://localhost:8000` in your browser

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox, Animations
- **JavaScript ES6+** - Modules, Classes, Async/Await
- **Google Fonts** - Inter & JetBrains Mono

## 📱 Responsive Breakpoints

- **Extra Large:** 1920px+
- **Large:** 1440px+
- **Desktop:** 1024px
- **Tablet:** 768px
- **Mobile:** 480px

## 🎯 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 Customization

### Updating Content

Edit `data/portfolio.json` to update:
- Personal information
- Experience
- Education
- Projects
- Skills

### Changing Colors

Edit `css/variables.css` to modify:
- Gradient colors (`--gradient-start`, `--gradient-end`)
- Terminal colors (`--terminal-green`)
- Background colors
- Text colors

## 📄 License

© 2024 Arunachalam Manikandan. All rights reserved.

## 🤝 Contact

- **Email:** amanikan063@gmail.com
- **LinkedIn:** [arunachalam-manikandan](https://www.linkedin.com/in/arunachalam-manikandan)
- **GitHub:** [ArunachalamM101202](https://github.com/ArunachalamM101202)
