// terminal.js - Interactive terminal component

class Terminal {
  constructor(containerId, data) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.data = data;
    this.output = this.container.querySelector('.terminal__output');
    this.input = this.container.querySelector('.terminal__input');
    this.body = this.container.querySelector('.terminal__body');
    
    this.commandHistory = [];
    this.historyIndex = -1;
    this.currentPage = {};
    
    this.commands = this.initCommands();
    this.init();
  }

  init() {
    if (!this.input) return;
    
    // Focus input on terminal click
    this.container.addEventListener('click', () => {
      this.input.focus();
    });
    
    // Handle input
    this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
    
    // Show welcome message
    this.showWelcome();
    
    // Auto-focus
    setTimeout(() => this.input.focus(), 500);
  }

  initCommands() {
    return {
      help: () => this.showHelp(),
      about: () => this.showAbout(),
      skills: (args) => this.showSkills(args),
      experience: () => this.showExperience(),
      education: () => this.showEducation(),
      projects: () => this.showProjects(),
      contact: () => this.showContact(),
      social: () => this.openSocial(),
      resume: () => this.openResume(),
      whoami: () => this.showWhoami(),
      ls: () => this.showList(),
      clear: () => this.clear(),
      next: () => this.nextPage(),
      prev: () => this.prevPage(),
      n: () => this.nextPage(),
      p: () => this.prevPage(),
    };
  }

  handleKeyDown(e) {
    switch(e.key) {
      case 'Enter':
        e.preventDefault();
        this.executeCommand(this.input.value.trim());
        this.input.value = '';
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.navigateHistory(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.navigateHistory(1);
        break;
      case 'Tab':
        e.preventDefault();
        this.autocomplete();
        break;
      case 'l':
        if (e.ctrlKey) {
          e.preventDefault();
          this.clear();
        }
        break;
    }
  }

  executeCommand(input) {
    if (!input) return;
    
    // Add to history
    this.commandHistory.push(input);
    this.historyIndex = this.commandHistory.length;
    
    // Show command in output
    this.addLine(this.getPrompt() + input, 'command');
    
    // Parse command and args
    const parts = input.toLowerCase().split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);
    
    // Execute command
    if (this.commands[cmd]) {
      this.commands[cmd](args);
    } else {
      this.addLine(`Command not found: ${cmd}. Type 'help' for available commands.`, 'error');
    }
    
    this.scrollToBottom();
  }

  navigateHistory(direction) {
    const newIndex = this.historyIndex + direction;
    
    if (newIndex >= 0 && newIndex < this.commandHistory.length) {
      this.historyIndex = newIndex;
      this.input.value = this.commandHistory[newIndex];
    } else if (newIndex >= this.commandHistory.length) {
      this.historyIndex = this.commandHistory.length;
      this.input.value = '';
    }
  }

  autocomplete() {
    const input = this.input.value.toLowerCase();
    if (!input) return;
    
    const matches = Object.keys(this.commands).filter(cmd => cmd.startsWith(input));
    
    if (matches.length === 1) {
      this.input.value = matches[0];
    } else if (matches.length > 1) {
      this.addLine(this.getPrompt() + input, 'command');
      this.addLine(matches.join('  '), 'info');
    }
  }

  getPrompt() {
    return `<span class="terminal__prompt-user">arun</span><span class="terminal__prompt-separator">@</span><span class="terminal__prompt-path">portfolio</span><span class="terminal__prompt-symbol"> $ </span>`;
  }

  addLine(content, type = 'output') {
    const line = document.createElement('div');
    line.className = `terminal__line terminal__line--${type}`;
    line.innerHTML = content;
    this.output.appendChild(line);
  }

  scrollToBottom() {
    this.body.scrollTop = this.body.scrollHeight;
  }

  clear() {
    this.output.innerHTML = '';
    this.currentPage = {};
  }

  wrapText(text, maxWidth = 60) {
    if (!text) return '';
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
    
    words.forEach(word => {
      if ((currentLine + ' ' + word).trim().length <= maxWidth) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);
    
    return lines.join('\n  ');
  }

  // === Command Implementations ===
  
  showWelcome() {
    const ascii = `
<span class="terminal__ascii">
    _                        _           _                 
   / \\   _ __ _   _ _ __    / \\   _   _ | |_ ___           
  / _ \\ | '__| | | | '_ \\  / _ \\ | | | || __/ _ \\          
 / ___ \\| |  | |_| | | | |/ ___ \\| |_| || || (_) |         
/_/   \\_\\_|   \\__,_|_| |_/_/   \\_\\\\__,_| \\__\\___/          
</span>`;
    
    this.addLine(ascii, 'output');
    this.addLine(`
Welcome to my interactive portfolio terminal!
Type <span class="terminal__line--highlight">'help'</span> to see available commands.

<span class="terminal__line--info">Hint: Try 'about', 'skills', or 'projects' to get started.</span>
    `, 'output');
  }

  showHelp() {
    this.addLine(`
╔══════════════════════════════════════════════════════════════╗
║                    AVAILABLE COMMANDS                        ║
╠══════════════════════════════════════════════════════════════╣
║  about       Display personal summary and bio                ║
║  skills      List technical skills by category               ║
║  experience  Show work experience                            ║
║  education   Display educational background                  ║
║  projects    Browse portfolio projects                       ║
║  contact     Show contact information                        ║
║  social      Display social media links                      ║
║  resume      Open resume in new tab                          ║
║  whoami      Quick introduction                              ║
║  ls          List available sections                         ║
║  clear       Clear terminal screen                           ║
║  help        Show this help message                          ║
╠══════════════════════════════════════════════════════════════╣
║  NAVIGATION:  next(n) / prev(p)  - Navigate paginated results║
║  SHORTCUTS:   Tab - Autocomplete  |  ↑/↓ - Command history   ║
╚══════════════════════════════════════════════════════════════╝
    `, 'output');
  }

  showAbout() {
    const about = this.data.about;
    
    this.addLine(`
┌─────────────────────────────────────────────────────────────┐
│  ABOUT ME                                                    │
└─────────────────────────────────────────────────────────────┘

  ${this.wrapText(about.summary, 58)}

┌─ CURRENT FOCUS ─────────────────────────────────────────────┐

  ${this.wrapText(about.current_work, 58)}

┌─ HIGHLIGHTS ────────────────────────────────────────────────┐

  ${this.wrapText(about.beyond_classroom, 58)}
    `, 'output');
  }

  showSkills(args) {
    const skills = this.data.skills;
    
    if (args && args[0]) {
      const category = args[0].toLowerCase();
      let categoryData;
      let categoryName;
      
      if (category === 'languages' || category === 'lang') {
        categoryData = skills.languages;
        categoryName = 'LANGUAGES';
      } else if (category === 'ai' || category === 'ml') {
        categoryData = skills.ai_ml;
        categoryName = 'AI & MACHINE LEARNING';
      } else if (category === 'frameworks' || category === 'libs') {
        categoryData = skills.frameworks_libraries;
        categoryName = 'FRAMEWORKS & LIBRARIES';
      } else if (category === 'cloud' || category === 'backend') {
        categoryData = skills.cloud_backend_data;
        categoryName = 'CLOUD & BACKEND';
      }
      
      if (categoryData) {
        this.addLine(`
[${categoryName}]
${categoryData.join(' • ')}
        `, 'output');
        return;
      }
    }
    
    this.addLine(`
┌─────────────────────────────────────────────────────────────┐
│  TECHNICAL SKILLS                                            │
└─────────────────────────────────────────────────────────────┘

<span class="terminal__line--highlight">[LANGUAGES]</span>
  ${skills.languages.join(' • ')}

<span class="terminal__line--highlight">[AI & MACHINE LEARNING]</span>
  ${skills.ai_ml.slice(0, 6).join(' • ')}
  ${skills.ai_ml.slice(6).join(' • ')}

<span class="terminal__line--highlight">[FRAMEWORKS & LIBRARIES]</span>
  ${skills.frameworks_libraries.slice(0, 8).join(' • ')}
  ${skills.frameworks_libraries.slice(8, 16).join(' • ')}
  ... and ${skills.frameworks_libraries.length - 16} more

<span class="terminal__line--highlight">[CLOUD & INFRASTRUCTURE]</span>
  ${skills.cloud_backend_data.slice(0, 6).join(' • ')}
  ... and ${skills.cloud_backend_data.length - 6} more

─────────────────────────────────────────────────────────────
<span class="terminal__line--info">Tip: Use 'skills [category]' for full list</span>
<span class="terminal__line--info">Categories: languages, ai, frameworks, cloud</span>
    `, 'output');
  }

  showExperience() {
    const experiences = this.data.experience;
    
    this.currentPage = {
      type: 'experience',
      data: experiences,
      index: 0,
      perPage: 1
    };
    
    this.displayExperiencePage();
  }

  displayExperiencePage() {
    const { data, index, perPage } = this.currentPage;
    const exp = data[index];
    
    if (!exp) return;
    
    this.addLine(`
┌─────────────────────────────────────────────────────────────┐
│  ${exp.position.toUpperCase().substring(0, 57).padEnd(57)} │
│  @ ${exp.company.substring(0, 55).padEnd(55)} │
│  ${exp.duration.padEnd(57)} │
│  📍 ${exp.location.padEnd(54)} │
└─────────────────────────────────────────────────────────────┘

${exp.responsibilities.map(r => `  ▹ ${this.wrapText(r, 55)}`).join('\n\n')}

<span class="terminal__line--info">Technologies: ${exp.technologies.slice(0, 5).join(', ')}...</span>

─────────────────────────────────────────────────────────────
<span class="terminal__line--highlight">[${index + 1}/${data.length}]</span> Type 'next' or 'prev' to navigate
    `, 'output');
  }

  showEducation() {
    const education = this.data.education;
    
    education.forEach(edu => {
      this.addLine(`
┌─────────────────────────────────────────────────────────────┐
│  ${edu.degree.toUpperCase().substring(0, 57).padEnd(57)} │
│  ${edu.institution.substring(0, 57).padEnd(57)} │
│  ${edu.duration.padEnd(57)} │
│  🎓 GPA: ${edu.gpa.padEnd(49)} │
└─────────────────────────────────────────────────────────────┘

<span class="terminal__line--info">Coursework: ${edu.coursework.slice(0, 4).join(', ')}...</span>
      `, 'output');
    });
  }

  showProjects() {
    const projects = this.data.projects;
    
    this.currentPage = {
      type: 'projects',
      data: projects,
      index: 0,
      perPage: 1
    };
    
    this.displayProjectPage();
  }

  displayProjectPage() {
    const { data, index } = this.currentPage;
    const proj = data[index];
    
    if (!proj) return;
    
    let badge = '';
    if (proj.achievement) {
      badge = `🏆 ${proj.achievement}`;
    } else if (proj.publication) {
      badge = `📄 ${proj.publication}`;
    }
    
    this.addLine(`
┌─────────────────────────────────────────────────────────────┐
│  ${proj.name.substring(0, 57).toUpperCase().padEnd(57)} │
${badge ? `│  <span class="terminal__line--success">${badge.substring(0, 57).padEnd(57)}</span> │\n` : ''}└─────────────────────────────────────────────────────────────┘

${proj.description.map(d => `  ${this.wrapText(d, 55)}`).join('\n\n')}

<span class="terminal__line--info">Tech: ${proj.technologies.join(', ')}</span>

─────────────────────────────────────────────────────────────
<span class="terminal__line--highlight">[${index + 1}/${data.length}]</span> Type 'next' or 'prev' to navigate
    `, 'output');
  }

  nextPage() {
    if (!this.currentPage.type) {
      this.addLine('No paginated content. Try "experience" or "projects" first.', 'warning');
      return;
    }
    
    if (this.currentPage.index < this.currentPage.data.length - 1) {
      this.currentPage.index++;
      
      if (this.currentPage.type === 'experience') {
        this.displayExperiencePage();
      } else if (this.currentPage.type === 'projects') {
        this.displayProjectPage();
      }
    } else {
      this.addLine('Already at the last item.', 'info');
    }
  }

  prevPage() {
    if (!this.currentPage.type) {
      this.addLine('No paginated content. Try "experience" or "projects" first.', 'warning');
      return;
    }
    
    if (this.currentPage.index > 0) {
      this.currentPage.index--;
      
      if (this.currentPage.type === 'experience') {
        this.displayExperiencePage();
      } else if (this.currentPage.type === 'projects') {
        this.displayProjectPage();
      }
    } else {
      this.addLine('Already at the first item.', 'info');
    }
  }

  showContact() {
    const contact = this.data.personal_info.contact;
    
    this.addLine(`
┌─────────────────────────────────────────────────────────────┐
│  CONTACT INFORMATION                                         │
└─────────────────────────────────────────────────────────────┘

  📧 Email    : ${contact.email}
  📱 Phone    : ${contact.phone}
  💼 LinkedIn : ${contact.linkedin}
  🐙 GitHub   : ${contact.github_alt}

─────────────────────────────────────────────────────────────
Type 'social' to open links or 'resume' to view CV
    `, 'output');
  }

  openSocial() {
    const contact = this.data.personal_info.contact;
    
    this.addLine(`
Opening social profiles in new tabs...
  • LinkedIn: ${contact.linkedin}
  • GitHub: ${contact.github_alt}
    `, 'success');
    
    window.open(contact.linkedin, '_blank');
    window.open(contact.github_alt, '_blank');
  }

  openResume() {
    const resumeLink = this.data.personal_info.resume_link;
    
    this.addLine(`Opening resume in new tab...`, 'success');
    window.open(resumeLink, '_blank');
  }

  showWhoami() {
    const info = this.data.personal_info;
    
    this.addLine(`
<span class="terminal__line--highlight">${info.name}</span>
${info.title}

"${this.data.about.summary.substring(0, 100)}..."

Type 'about' for full bio.
    `, 'output');
  }

  showList() {
    this.addLine(`
drwxr-xr-x  about/
drwxr-xr-x  education/
drwxr-xr-x  experience/
drwxr-xr-x  projects/
drwxr-xr-x  skills/
-rw-r--r--  contact.txt
-rw-r--r--  resume.pdf

<span class="terminal__line--info">Type any folder name to explore.</span>
    `, 'output');
  }
}

export default Terminal;
