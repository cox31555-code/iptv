const CACHE_NAME = 'stream-bypass-v2';
const STATIC_CACHE = 'static-assets-v2';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/favicon.ico'
      ]).catch(() => {
        // Silently fail if caching fails
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only intercept iframe requests from streaming sources
  if (event.request.destination === 'iframe' || url.pathname.includes('embed') || url.pathname.includes('stream')) {
    event.respondWith(
      fetch(event.request).then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }
        
        const clonedResponse = response.clone();
        const headers = new Headers(clonedResponse.headers);
        
        // Remove restrictive headers
        headers.delete('X-Frame-Options');
        headers.delete('Content-Security-Policy');
        headers.delete('X-Content-Security-Policy');
        headers.delete('X-WebKit-CSP');
        
        // Modify CSP to allow scripts if it exists
        const csp = headers.get('Content-Security-Policy');
        if (csp) {
          const modifiedCsp = csp
            .replace(/script-src[^;]*/g, "script-src 'self' 'unsafe-inline' 'unsafe-eval' *")
            .replace(/frame-ancestors[^;]*/g, 'frame-ancestors *');
          headers.set('Content-Security-Policy', modifiedCsp);
        }
        
        return new Response(clonedResponse.body, {
          status: clonedResponse.status,
          statusText: clonedResponse.statusText,
          headers: headers
        });
      }).catch(() => {
        return fetch(event.request);
      })
    );
  }
});
