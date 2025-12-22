const CACHE_NAME = 'stream-bypass-v1';

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only intercept iframe requests from streaming sources
  if (event.request.destination === 'iframe' || url.pathname.includes('embed') || url.pathname.includes('stream')) {
    event.respondWith(
      fetch(event.request).then((response) => {
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
