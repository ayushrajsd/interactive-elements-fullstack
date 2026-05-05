const steps = [
  {
    title: "1) User enters URL in the browser",
    short: "Enter URL",
    bullets: [
      "Browser parses protocol, domain, path, query.",
      "Checks browser cache and Service Worker first.",
      "If valid fresh cache exists, network work may be skipped."
    ]
  },
  {
    title: "2) DNS lookup begins",
    short: "Browser/OS cache",
    bullets: [
      "DNS cache hierarchy: browser → OS → router → ISP resolver.",
      "If IP found in cache and TTL not expired, return quickly."
    ]
  },
  {
    title: "3) Recursive DNS resolution if cache miss",
    short: "Root/TLD/Auth DNS",
    bullets: [
      "Resolver asks root name servers, then TLD servers (.com, .org).",
      "TLD points to authoritative name server for domain.",
      "Authoritative DNS returns A/AAAA record (IP address)."
    ]
  },
  {
    title: "4) TCP handshake to server IP",
    short: "TCP SYN/SYN-ACK/ACK",
    bullets: [
      "Client sends SYN.",
      "Server replies SYN-ACK.",
      "Client confirms with ACK; connection established."
    ]
  },
  {
    title: "5) TLS handshake for HTTPS",
    short: "TLS security",
    bullets: [
      "Certificate is sent and validated.",
      "Session keys are negotiated.",
      "Encrypted channel is ready."
    ]
  },
  {
    title: "6) HTTP request sent",
    short: "HTTP request",
    bullets: [
      "Request line + headers + optional body are sent.",
      "Cookies/auth headers and caching headers may be included."
    ]
  },
  {
    title: "7) Request reaches CDN / load balancer / app",
    short: "Infra routing",
    bullets: [
      "Edge/CDN may serve static content directly.",
      "Otherwise load balancer forwards to an app server instance."
    ]
  },
  {
    title: "8) Backend processing",
    short: "Server logic",
    bullets: [
      "Server runs business logic.",
      "May query DB/cache/microservices.",
      "Builds response payload (HTML/JSON/assets)."
    ]
  },
  {
    title: "9) HTTP response returned",
    short: "HTTP response",
    bullets: [
      "Status code, headers, body returned to client.",
      "Compression (gzip/br) and cache headers may be applied."
    ]
  },
  {
    title: "10) Browser parses HTML -> DOM",
    short: "DOM build",
    bullets: [
      "HTML parser incrementally builds DOM tree.",
      "Parser may block on synchronous scripts."
    ]
  },
  {
    title: "11) CSSOM, render tree, layout, paint, composite",
    short: "Render pipeline",
    bullets: [
      "CSS parsed into CSSOM.",
      "DOM + CSSOM -> render tree.",
      "Layout computes geometry, paint draws pixels, compositor combines layers."
    ]
  },
  {
    title: "12) JS hydration / interactivity / subsequent requests",
    short: "Interactive app",
    bullets: [
      "JavaScript attaches events and updates UI.",
      "SPA frameworks hydrate existing markup.",
      "User actions trigger fetch/XHR/WebSocket flows again."
    ]
  }
];

const flowTrack = document.getElementById("flowTrack");
const packet = document.getElementById("packet");
const stepTitle = document.getElementById("stepTitle");
const stepDescription = document.getElementById("stepDescription");
const stepBullets = document.getElementById("stepBullets");
const phaseIndex = document.getElementById("phaseIndex");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");
const speedRange = document.getElementById("speedRange");

let currentStep = -1;
let timer = null;
let running = false;

function buildFlow() {
  flowTrack.innerHTML = "";
  steps.forEach((step, index) => {
    const node = document.createElement("div");
    node.className = "step-node";
    node.dataset.index = String(index);
    node.textContent = step.short;
    flowTrack.appendChild(node);
  });
}

function renderStep(index) {
  const safeIndex = Math.max(0, Math.min(index, steps.length - 1));
  const current = steps[safeIndex];

  document.querySelectorAll(".step-node").forEach((node, i) => {
    node.classList.toggle("active", i === safeIndex);
    node.classList.toggle("done", i < safeIndex);
  });

  stepTitle.textContent = current.title;
  stepDescription.textContent = "What is happening right now:";
  stepBullets.innerHTML = current.bullets.map((x) => `<li>${x}</li>`).join("");
  phaseIndex.textContent = `${safeIndex + 1} / ${steps.length}`;
  packet.classList.remove("hidden");
  packet.style.transform = `translateY(${safeIndex * 54}px)`;

  if (safeIndex >= 8) {
    packet.textContent = "RES";
  } else {
    packet.textContent = "REQ";
  }
}

function nextStep() {
  if (currentStep < steps.length - 1) {
    currentStep += 1;
    renderStep(currentStep);
  } else {
    stopAnimation();
  }
}

function stopAnimation() {
  running = false;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function startAnimation() {
  stopAnimation();
  running = true;
  if (currentStep >= steps.length - 1) {
    currentStep = -1;
  }

  const speed = Number(speedRange.value);
  const delay = 2500 - speed * 350;

  timer = setInterval(() => {
    if (!running) return;
    nextStep();
  }, delay);

  nextStep();
}

startBtn.addEventListener("click", startAnimation);
pauseBtn.addEventListener("click", stopAnimation);
nextBtn.addEventListener("click", () => {
  stopAnimation();
  nextStep();
});
resetBtn.addEventListener("click", () => {
  stopAnimation();
  currentStep = -1;
  packet.classList.add("hidden");
  document.querySelectorAll(".step-node").forEach((node) => {
    node.classList.remove("active", "done");
  });
  stepTitle.textContent = 'Press “Start slow animation”';
  stepDescription.textContent = "Details for each phase will appear here.";
  stepBullets.innerHTML = "";
  phaseIndex.textContent = `0 / ${steps.length}`;
});

buildFlow();
