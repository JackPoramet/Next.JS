// Clear theme storage and force reset
console.log("Clearing theme storage...");
localStorage.removeItem('theme');
localStorage.removeItem('app-theme');

// Force remove dark class
document.documentElement.classList.remove('dark');
document.documentElement.classList.add('light');

console.log("Theme storage cleared, page will reload...");
setTimeout(() => {
  window.location.reload();
}, 1000);
