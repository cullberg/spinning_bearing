import{w as a,q as c,p as e,M as i,L as d,S as l,t as m,O as p,i as h}from"./chunk-B7RQU5TL-WGoqqZ8d.js";const f=()=>[{rel:"preconnect",href:"https://fonts.googleapis.com"},{rel:"preconnect",href:"https://fonts.gstatic.com",crossOrigin:"anonymous"},{rel:"stylesheet",href:"https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"}];function x({children:t}){return e.jsxs("html",{lang:"en",children:[e.jsxs("head",{children:[e.jsx("meta",{charSet:"utf-8"}),e.jsx("meta",{name:"viewport",content:"width=device-width, initial-scale=1"}),e.jsx(i,{}),e.jsx(d,{}),e.jsx("script",{dangerouslySetInnerHTML:{__html:`
            (function() {
              // Apply theme based on system preference
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (prefersDark) {
                document.documentElement.classList.add('dark');
              }

              // Listen for theme changes
              window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (e.matches) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              });
            })();
          `}})]}),e.jsxs("body",{children:[t,e.jsx(l,{}),e.jsx(m,{})]})]})}const j=a(function(){return e.jsx(p,{})}),g=c(function({error:s}){let r="Oops!",n="An unexpected error occurred.",o;return h(s)&&(r=s.status===404?"404":"Error",n=s.status===404?"The requested page could not be found.":s.statusText||n),e.jsxs("main",{className:"pt-16 p-4 container mx-auto",children:[e.jsx("h1",{children:r}),e.jsx("p",{children:n}),o]})});export{g as ErrorBoundary,x as Layout,j as default,f as links};
