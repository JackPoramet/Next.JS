export function ThemeScript() {
  // Force light-only to avoid dark artifacts until dark mode is reintroduced explicitly
  const script = `
    (function() {
      try {
        var root = document.documentElement;
        var body = document.body;
        root.classList.remove('dark');
        body.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
        body.style.backgroundColor = 'hsl(0 0% 100%)';
        body.style.color = 'hsl(0 0% 3.9%)';
      } catch (e) {
        console.error('Theme script error:', e);
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
