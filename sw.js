/**
 * sw.js — service worker minimal untuk Silsilah Keluarga.
 * Hanya meng-cache "app shell" (file statis) agar aplikasi bisa dibuka
 * lagi dengan cepat / saat offline. Panggilan API ke Google Apps Script
 * SENGAJA tidak di-cache di sini supaya data keluarga selalu yang terbaru.
 *
 * Naikkan CACHE_NAME setiap kali men-deploy perubahan pada app shell,
 * supaya klien lama otomatis mengambil versi baru.
 */
const CACHE_NAME = 'silsilah-keluarga-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Jangan pernah cache request ke Google Apps Script / Drive — data harus selalu segar.
  if (url.hostname.includes('script.google.com') || url.hostname.includes('googleusercontent.com') || url.hostname.includes('drive.google.com')) {
    return; // biarkan browser fetch langsung ke network
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((res) => {
          if (res && res.ok && event.request.method === 'GET') {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return res;
        })
        .catch(() => cached); // offline → pakai cache jika ada
      return cached || network;
    })
  );
});
