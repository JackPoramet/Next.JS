// Ultra Force Light Mode - ป้องกัน system theme ทุกรูปแบบ
(function() {
  try {
    // 1. ลบ dark class ทั้งหมด
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    
    // 2. เพิ่ม light class
    document.documentElement.classList.add('light');
    
    // 3. ลบ theme จาก localStorage เพื่อป้องกัน interference
    localStorage.removeItem('theme');
    localStorage.removeItem('app-theme');
    localStorage.removeItem('selectedTheme');
    localStorage.removeItem('color-theme');
    
    // 4. Override system preference โดยการ force color-scheme
    document.documentElement.style.colorScheme = 'light';
    document.body.style.colorScheme = 'light';
    
    // 5. Set data attributes เพื่อ override
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.removeAttribute('data-dark');
    
    // 6. Force background colors
    document.documentElement.style.backgroundColor = 'white';
    document.documentElement.style.color = 'black';
    document.body.style.backgroundColor = 'white';
    document.body.style.color = 'black';
    
    // 7. Override CSS custom properties
    document.documentElement.style.setProperty('--tw-bg-opacity', '1');
    document.documentElement.style.setProperty('--tw-text-opacity', '1');
    
    // 8. Monitor และป้องกันการเปลี่ยนแปลง
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;
          if (target.classList.contains('dark')) {
            target.classList.remove('dark');
            target.classList.add('light');
            console.log('Prevented dark mode activation');
          }
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });
    
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });
    
    // 9. Override system preference media query
    const style = document.createElement('style');
    style.textContent = `
      @media (prefers-color-scheme: dark) {
        html, body, * {
          color-scheme: light !important;
          background: white !important;
          color: black !important;
        }
      }
      
      html[data-theme="dark"],
      html.dark,
      [data-theme="dark"],
      .dark {
        color-scheme: light !important;
        background: white !important;
        color: black !important;
      }
    `;
    document.head.appendChild(style);
    
    console.log('Ultra Force Light Mode applied successfully');
  } catch (e) {
    console.error('Force Light Mode script error:', e);
  }
})();
