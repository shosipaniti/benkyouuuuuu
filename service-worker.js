const CACHE_NAME = "keizai-quiz-v61";
const ASSETS = [
  "./",
  "./index.html",
  "./study-quiz-site.html",
  "./styles.css",
  "./app.js",
  "./questions.js",
  "./predicted_questions.js",
  "./study_extra_questions.js",
  "./human_centered_final_guide.js",
  "./economics_final_guide.js",
  "./audio_engineering_guides.js",
  "./manifest.webmanifest",
  "./icon.svg",
  "./examples/question-template.csv",
  "./assets/keizai-2-figure-1.png",
  "./assets/keizai-3-figure-1.jpg",
  "./assets/ref-audio-larynx-test-redacted.png",
  "./assets/ref-audio-final-08-resonance.png",
  "./assets/ref-audio-final-09-two-mass.png",
  "./assets/ref-audio-final-10-rosenberg.png",
  "./assets/ref-audio-spectrum-cepstrum.svg",
  "./assets/ref-audio-vocal-tract.svg",
  "./assets/ref-audio-vowel-pentagon.svg",
  "./assets/ref-knowledge-decision-tree.svg",
  "./assets/ref-knowledge-electricity-tree.svg",
  "./assets/ref-knowledge-neural.svg",
  "./assets/ref-knowledge-quiz-expert-system.png",
  "./assets/ref-knowledge-quiz-tree.png",
  "./assets/ref-ml-gradient-hessian.svg",
  "./assets/ref-ml-normal-distribution.svg",
  "./assets/ref-regression.svg",
  "./assets/acoustics-final-cheatsheet.png",
  "./assets/acoustics-final-cheatsheet-concepts.svg",
  "./assets/acoustics-final-cheatsheet-calculations.svg",
  "./assets/acoustics-final-cheatsheet-concepts.png",
  "./assets/acoustics-final-cheatsheet-calculations.png"
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

  const shouldRefresh =
    event.request.mode === "navigate" ||
    ["document", "script", "style", "worker"].includes(event.request.destination);

  event.respondWith(
    (shouldRefresh
      ? fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
      : caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        }).catch(() => caches.match("./index.html"));
      }))
  );
});
