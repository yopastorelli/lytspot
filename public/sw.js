/**
 * Service Worker para LytSpot PWA
 * @version 1.1.0 - 2025-03-15 - Melhorada a robustez para lidar com recursos ausentes
 */

// Nome do cache
const CACHE_NAME = 'lytspot-cache-v1';

// Arquivos para cache inicial - apenas recursos que sabemos que existem
const urlsToCache = [
  '/',
  '/manifest.json',
  '/js/web-vitals.js'
];

// Instalação do service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        // Cache cada URL individualmente para evitar falha total se um recurso estiver ausente
        const cachePromises = urlsToCache.map(url => {
          // Usar fetch().then() em vez de addAll para lidar com falhas individuais
          return fetch(url)
            .then(response => {
              if (!response.ok) {
                console.warn(`Falha ao armazenar em cache: ${url} - Status: ${response.status}`);
                return;
              }
              return cache.put(url, response);
            })
            .catch(error => {
              console.warn(`Não foi possível buscar recurso para cache: ${url}`, error);
            });
        });
        
        return Promise.all(cachePromises);
      })
  );
});

// Ativação do service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estratégia de cache: Network First, fallback para cache
self.addEventListener('fetch', event => {
  // Ignorar requisições para analytics para evitar erros 405
  if (event.request.url.includes('/api/analytics')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Verificar se a resposta é válida
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clonar a resposta para o cache
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          })
          .catch(error => {
            console.warn('Erro ao armazenar em cache:', error);
          });

        return response;
      })
      .catch(() => {
        // Se a rede falhar, tentar do cache
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Se não estiver no cache, retornar uma resposta de fallback para navegação
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            
            // Para outros recursos, retornar um erro 404 personalizado
            return new Response('Recurso não disponível offline', {
              status: 404,
              statusText: 'Not Found',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});
