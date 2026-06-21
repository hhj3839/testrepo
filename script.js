const year = document.querySelector("#year");
const progress = document.querySelector(".scroll-progress");
const cursorLight = document.querySelector(".cursor-light");
const typeTarget = document.querySelector(".type-line");
const revealItems = document.querySelectorAll(".reveal");
const statNumbers = document.querySelectorAll("[data-count]");
const skillCards = document.querySelectorAll(".skill-card");
const tiltCards = document.querySelectorAll(".tilt-card");
const parallaxTarget = document.querySelector("[data-parallax]");

if (year) {
  year.textContent = new Date().getFullYear();
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function updateProgress() {
  if (!progress) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
  progress.style.width = `${Math.min(ratio * 100, 100)}%`;
}

function animateCount(element) {
  const end = Number(element.dataset.count || 0);
  const duration = 900;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - elapsed, 3);
    element.textContent = Math.round(end * eased);

    if (elapsed < 1) {
      requestAnimationFrame(tick);
    } else if (end === 100) {
      element.textContent = "100%";
    }
  }

  requestAnimationFrame(tick);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");

      if (entry.target.matches("[data-count]")) {
        animateCount(entry.target);
      }

      if (entry.target.classList.contains("skill-card")) {
        const meter = entry.target.querySelector(".meter span");
        if (meter) {
          meter.style.width = `${entry.target.dataset.level}%`;
        }
      }

      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach((item) => revealObserver.observe(item));
statNumbers.forEach((item) => revealObserver.observe(item));
skillCards.forEach((item) => revealObserver.observe(item));

function typeLoop() {
  if (!typeTarget || prefersReducedMotion) return;

  const phrases = (typeTarget.dataset.phrases || "").split("|").filter(Boolean);
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function type() {
    const phrase = phrases[phraseIndex] || "";
    typeTarget.textContent = phrase.slice(0, charIndex);

    if (!deleting && charIndex < phrase.length) {
      charIndex += 1;
      setTimeout(type, 72);
      return;
    }

    if (!deleting && charIndex === phrase.length) {
      deleting = true;
      setTimeout(type, 1200);
      return;
    }

    if (deleting && charIndex > 0) {
      charIndex -= 1;
      setTimeout(type, 38);
      return;
    }

    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    setTimeout(type, 260);
  }

  type();
}

tiltCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (prefersReducedMotion) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateX(${y * -7}deg) rotateY(${x * 7}deg) translateY(-4px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

window.addEventListener("pointermove", (event) => {
  if (!cursorLight || prefersReducedMotion) return;
  cursorLight.style.opacity = "1";
  cursorLight.style.left = `${event.clientX}px`;
  cursorLight.style.top = `${event.clientY}px`;
});

window.addEventListener("scroll", () => {
  updateProgress();

  if (parallaxTarget && !prefersReducedMotion) {
    parallaxTarget.style.transform = `translateY(${window.scrollY * -0.025}px)`;
  }
});

updateProgress();
typeLoop();
