// "Service worker": un ayudante que el navegador guarda junto a la app.
// Su trabajo aquí es uno solo: tener copia de los archivos de la app dentro
// del celular, para que abra aunque no haya internet.

// IMPORTANTE: cada vez que cambies index.html, sube este número (v2, v3...).
// Así el iPhone se entera de que hay versión nueva y la descarga.
const VERSION = 'caja-v3';

const ARCHIVOS = ['./', './index.html', './manifest.json', './icono-180.png', './icono-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

// Borra las copias de versiones viejas
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(claves =>
    Promise.all(claves.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // La página principal: si hay internet se trae la versión más nueva (y se
  // guarda); si no hay, se usa la copia. Así los cambios llegan apenas se
  // abre la app con internet, sin tener que abrirla dos veces.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(r => { const copia = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', copia)); return r; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  // Lo demás (íconos, etc.) casi nunca cambia: primero la copia guardada
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});
