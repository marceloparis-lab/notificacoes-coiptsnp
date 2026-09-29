/* Service worker: guarda o app no aparelho para funcionar sem internet */
const VERSAO = 'notif-v1.0.0';
const ARQUIVOS = [
  './', 'index.html', 'config.js', 'manifest.webmanifest', 'css/app.css',
  'lib/jszip.min.js', 'js/extenso.js', 'js/docgen.js', 'js/db.js', 'js/foto.js', 'js/sync.js', 'js/app.js',
  'modelos/modelo_contrato.docx', 'modelos/modelo_convenio.docx',
  'icons/icon-192.png', 'icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return; // login Google e servidor: sempre pela rede
  // rede primeiro (para receber atualizacoes), cache se estiver offline
  e.respondWith(
    fetch(e.request).then((resp) => {
      if (resp && resp.ok) { const copia = resp.clone(); caches.open(VERSAO).then((c) => c.put(e.request, copia)); }
      return resp;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html')))
  );
});
