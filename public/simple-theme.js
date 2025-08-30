// Simple theme toggle script based on Tailwind CSS docs
function initTheme() {
  // Check localStorage or default to light
  const theme = localStorage.getItem('theme') || 'light';
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  
  if (isDark) {
    // Switch to light
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    console.log('Switched to light theme');
  } else {
    // Switch to dark
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    console.log('Switched to dark theme');
  }
}

// Initialize theme on page load
initTheme();

// Expose toggle function globally
window.toggleTheme = toggleTheme;
