/**
 * config.js – SAVIO OS Personal Configuration
 * ============================================
 * Edit this file to update all personal info, links, and project data.
 * This is the ONLY file you need to change for personal customization.
 */

const CONFIG = {
  // ─── Personal Info ────────────────────────────────────────────────────────
  personal: {
    name: "Don Savio Thomas",
    title: "Aspiring Software & DevOps Engineer",
    college: "Viswajyothi College of Engineering and Technology",
    degree: "B.Tech Information Technology",
    location: "Kerala, India",
    bio: "Passionate about Linux, Cloud Computing, Automation, and Software Development. Building the future one commit at a time.",
    avatar: "assets/images/avatar.svg", // Replace with your photo
    email: "saviottt@example.com",      // ← Replace with real email
  },

  // ─── Social Links ─────────────────────────────────────────────────────────
  social: {
    github:   "https://github.com/saviottt",           // ← Replace
    linkedin: "https://linkedin.com/in/saviottt",      // ← Replace
    instagram: "https://instagram.com/saviottt",       // ← Replace
    email:    "mailto:saviottt@example.com",           // ← Replace
  },

  // ─── Projects ─────────────────────────────────────────────────────────────
  projects: [
    {
      id: "naviq",
      name: "NaviQ",
      subtitle: "Indoor Navigation System",
      description: "A smart indoor navigation system using BLE beacons and ML-powered positioning algorithms to guide users in complex buildings like hospitals and airports.",
      icon: "🧭",
      color: "#0a84ff",
      tech: ["Python", "BLE", "Machine Learning", "React Native", "MQTT"],
      github: "https://github.com/saviottt/naviq",    // ← Replace
      demo: "#",
      status: "In Progress",
    },
    {
      id: "pulseshift",
      name: "PulseShift",
      subtitle: "AI Public Sentiment Intelligence",
      description: "Real-time public sentiment analysis platform leveraging NLP and transformer models to track social media trends and provide actionable intelligence dashboards.",
      icon: "📊",
      color: "#30d158",
      tech: ["Python", "HuggingFace", "FastAPI", "React", "PostgreSQL"],
      github: "https://github.com/saviottt/pulseshift", // ← Replace
      demo: "#",
      status: "Completed",
    },
    {
      id: "medvision",
      name: "MedVision AI",
      subtitle: "Intelligent Fracture Analysis",
      description: "Deep learning-powered medical imaging platform that analyzes X-rays to detect and classify bone fractures with radiologist-level accuracy using CNNs.",
      icon: "🩻",
      color: "#ff375f",
      tech: ["Python", "TensorFlow", "OpenCV", "Flask", "DICOM"],
      github: "https://github.com/saviottt/medvision",  // ← Replace
      demo: "#",
      status: "Completed",
    },
    {
      id: "solar",
      name: "Solar Intelligence",
      subtitle: "AI-based Solar Analysis",
      description: "AI platform that predicts solar energy output using satellite imagery, weather data, and time-series forecasting models to optimize solar farm efficiency.",
      icon: "☀️",
      color: "#ffd60a",
      tech: ["Python", "Scikit-learn", "Pandas", "Django", "Docker"],
      github: "https://github.com/saviottt/solar-intel", // ← Replace
      demo: "#",
      status: "Completed",
    },
    {
      id: "jarvis",
      name: "Jarvis AI",
      subtitle: "Personal Voice Assistant",
      description: "A fully local voice assistant with wake-word detection, natural language understanding, smart home integration and a custom skills framework — inspired by JARVIS.",
      icon: "🤖",
      color: "#bf5af2",
      tech: ["Python", "Whisper", "LangChain", "Ollama", "MQTT"],
      github: "https://github.com/saviottt/jarvis-ai",  // ← Replace
      demo: "#",
      status: "In Progress",
    },
  ],

  // ─── Skills ───────────────────────────────────────────────────────────────
  skills: {
    languages: ["Python", "JavaScript", "Bash", "Go", "SQL", "HTML/CSS"],
    devops: ["Docker", "Kubernetes", "GitHub Actions", "Terraform", "Ansible", "Nginx"],
    cloud: ["AWS", "Google Cloud", "Azure", "Firebase", "Vercel"],
    tools: ["Git", "Linux", "VS Code", "Vim", "Postman", "Figma"],
    frameworks: ["FastAPI", "Flask", "Node.js", "React", "Tailwind CSS"],
    databases: ["PostgreSQL", "MongoDB", "Redis", "SQLite"],
  },

  // ─── Education ────────────────────────────────────────────────────────────
  education: [
    {
      degree: "B.Tech – Information Technology",
      institution: "Viswajyothi College of Engineering and Technology",
      year: "2022 – 2026",
      status: "Pursuing",
      icon: "🎓",
    },
    {
      degree: "Higher Secondary – Computer Science",
      institution: "St. Thomas HSS",
      year: "2020 – 2022",
      status: "Completed",
      icon: "📚",
    },
  ],

  // ─── Wallpapers ───────────────────────────────────────────────────────────
  wallpapers: [
    { id: "sonoma",   name: "Sonoma",    css: "linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%)" },
    { id: "sequoia",  name: "Sequoia",   css: "linear-gradient(135deg, #0d1117 0%, #1a3a2a 40%, #2d5a3d 70%, #0d2818 100%)" },
    { id: "monterey", name: "Monterey",  css: "linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7b2d8b 100%)" },
    { id: "aurora",   name: "Aurora",    css: "linear-gradient(135deg, #000428 0%, #004e92 50%, #2b5876 100%)" },
    { id: "sunset",   name: "Sunset",    css: "linear-gradient(135deg, #1a0533 0%, #6d1b7b 30%, #c2185b 60%, #ff7043 100%)" },
  ],

  // ─── Dock Apps ────────────────────────────────────────────────────────────
  dockApps: [
    { id: "finder",    name: "Finder",    icon: "finder",    emoji: "📁" },
    { id: "safari",    name: "Safari",    icon: "safari",    emoji: "🌐" },
    { id: "terminal",  name: "Terminal",  icon: "terminal",  emoji: "⬛" },
    { id: "vscode",    name: "VS Code",   icon: "vscode",    emoji: "💻" },
    { id: "github",    name: "GitHub",    icon: "github",    emoji: "🐙" },
    { id: "projects",  name: "Projects",  icon: "projects",  emoji: "🚀" },
    { id: "resume",    name: "Resume",    icon: "resume",    emoji: "📄" },
    { id: "about",     name: "About Me",  icon: "about",     emoji: "👤" },
    { id: "contact",   name: "Contact",   icon: "contact",   emoji: "✉️" },
    { id: "launchpad", name: "Launchpad", icon: "launchpad", emoji: "🚀" },
    { id: "trash",     name: "Trash",     icon: "trash",     emoji: "🗑️" },
  ],

  // ─── Resume ───────────────────────────────────────────────────────────────
  resume: {
    file: "documents/resume.pdf",
    name: "Don_Savio_Thomas_Resume.pdf",
  },
};

// Make config globally accessible
window.CONFIG = CONFIG;
