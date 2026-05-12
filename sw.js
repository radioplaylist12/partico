// sw.js - Service Worker para Rádio Patico IA (modo offline)
const CACHE_NAME = 'radio-patico-v2';
const urlsToCache = [
  './',
  './index.html',          // seu arquivo HTML principal
  './manifest.json',       // se você tiver (opcional, mas recomendado)
  './falcon.png',          // ícones usados no seu HTML
  './favicon.ico',
  // ⚠️ Adicione abaixo os VÍDEOS que você usa (os .mp4)
  './pai101.mp4',
  './sertanejo181.mp4',
  './forro181.mp4',
  './forroant181.mp4',
  './brga181.mp4',
  './pop181.mp4',
  './mpb181.mp4',
  './samba181.mp4',
  './variadas.mp4',
  './modatop181.mp4',
  './modop.mp4',           // vídeo do modo TV
  // ⚠️ Adicione as VINHETAS (áudio)
  './radiopm.mp3',
  './Paticom.mp3',
  './zzvc.mp3',
  // ⚠️ O CSS e JS externos NÃO precisam cachear (já são da web), mas podemos opcionalmente
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap'
];

// Instalação: abre o cache e adiciona os arquivos estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('[SW] Erro ao adicionar ao cache:', err))
  );
});

// Ativação: remove caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Estratégia: quando offline, busca do cache; se não houver, faz fetch normal (se estiver online)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // retorna do cache
        }
        // se não estiver no cache, tenta buscar da rede (e guarda no cache para próxima)
        return fetch(event.request).then(networkResponse => {
          // só adiciona ao cache se for uma requisição bem-sucedida do mesmo domínio ou recurso externo permitido
          if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Fallback para offline: retorna uma página amigável ou um aviso
          return caches.match('./index.html'); // mostra a página principal ao menos
        });
      })
  );
});