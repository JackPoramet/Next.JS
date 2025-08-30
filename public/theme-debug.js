console.log("Theme Debug Script Loaded");

// Monitor theme changes
const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
      const htmlElement = document.documentElement;
      console.log("HTML class changed:", htmlElement.className);
      console.log("Is dark mode:", htmlElement.classList.contains('dark'));
    }
  });
});

// Start observing
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['class']
});

// Check initial state
document.addEventListener('DOMContentLoaded', function() {
  console.log("Initial HTML class:", document.documentElement.className);
  console.log("Initial body class:", document.body.className);
});
