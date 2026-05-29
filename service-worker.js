const CACHE_NAME = "keizai-quiz-v19";
const ASSETS = [
  "./",
  "./index.html",
  "./study-quiz-site.html",
  "./styles.css",
  "./app.js",
  "./questions.js",
  "./predicted_questions.js",
  "./study_extra_questions.js?v=6",
  "./manifest.webmanifest",
  "./icon.svg",
  "./examples/question-template.csv",
  "./assets/keizai-2-figure-1.png",
  "./assets/keizai-3-figure-1.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
