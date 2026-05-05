const moduleTopics = {
  "HTML / CSS": ["How the Web Works"],
  JavaScript: ["How the Web Works"],
  React: [],
  MERN: []
};

const steps = [
  {
    title: "1) User enters URL",
    label: "Client starts request",
    activeNodes: ["client"],
    activeLinks: [],
    packet: { text: "REQ", x: 95, y: 83 },
    bullets: ["Browser parses URL and checks local cache/service worker."]
  },
  {
    title: "2) DNS lookup",
    label: "Client asks DNS for IP",
    activeNodes: ["client", "dns"],
    activeLinks: ["client-dns"],
    packet: { text: "REQ", x: 270, y: 83 },
    bullets: ["Cache miss triggers recursive DNS via resolver."]
  },
  {
    title: "3) DNS response",
    label: "DNS returns destination IP",
    activeNodes: ["client", "dns"],
    activeLinks: ["client-dns"],
    packet: { text: "IP", x: 95, y: 83 },
    bullets: ["Client now knows server IP address."]
  },
  {
    title: "4) TCP/TLS handshake",
    label: "Client establishes secure channel",
    activeNodes: ["client", "server"],
    activeLinks: ["dns-server"],
    packet: { text: "SYN", x: 270, y: 255 },
    bullets: ["SYN/SYN-ACK/ACK then TLS certificate + key exchange."]
  },
  {
    title: "5) HTTP request to server",
    label: "Request reaches app infra",
    activeNodes: ["client", "server"],
    activeLinks: ["dns-server"],
    packet: { text: "GET", x: 270, y: 255 },
    bullets: ["CDN/LB/App server receives request and processes it."]
  },
  {
    title: "6) HTTP response back",
    label: "Server returns HTML/CSS/JS",
    activeNodes: ["client", "server"],
    activeLinks: ["server-client"],
    packet: { text: "RES", x: 95, y: 255 },
    bullets: ["Status, headers, body returned and maybe cached."]
  },
  {
    title: "7) Browser render pipeline",
    label: "Client builds DOM/CSSOM",
    activeNodes: ["client", "render"],
    activeLinks: ["client-render"],
    packet: { text: "DOM", x: 95, y: 255 },
    bullets: ["DOM + CSSOM → render tree → layout → paint → composite."]
  },
  {
    title: "8) Interactivity/hydration",
    label: "App becomes interactive",
    activeNodes: ["render", "client"],
    activeLinks: ["client-render"],
    packet: { text: "JS", x: 95, y: 83 },
    bullets: ["JS hydrates UI and future user actions trigger new requests."]
  }
];

const nodeEls = {
  client: document.getElementById("node-client"),
  dns: document.getElementById("node-dns"),
  server: document.getElementById("node-server"),
  render: document.getElementById("node-render")
};
const linkEls = {
  "client-dns": document.querySelector(".link-client-dns"),
  "dns-server": document.querySelector(".link-dns-server"),
  "server-client": document.querySelector(".link-server-client"),
  "client-render": document.querySelector(".link-client-render")
};
const packet = document.getElementById("packet");
const stepTitle = document.getElementById("stepTitle");
const stepDescription = document.getElementById("stepDescription");
const stepBullets = document.getElementById("stepBullets");
const phaseIndex = document.getElementById("phaseIndex");
const stepLabel = document.getElementById("stepLabel");
const catalogue = document.getElementById("catalogue");

let idx = -1;
let timer;

function renderCatalogue() {
  const entries = Object.entries(moduleTopics).filter(([, topics]) => topics.length > 0);
  catalogue.innerHTML = entries
    .map(
      ([module, topics]) => `
      <div class="module-group">
        <h3>${module}</h3>
        <div>${topics.map((topic) => `<span class="topic-pill">${topic}</span>`).join("")}</div>
      </div>`
    )
    .join("");
}

function renderStep(i) {
  const s = steps[i];
  Object.values(nodeEls).forEach((el) => el.classList.remove("active"));
  Object.values(linkEls).forEach((el) => el.classList.remove("active"));
  s.activeNodes.forEach((n) => nodeEls[n].classList.add("active"));
  s.activeLinks.forEach((l) => linkEls[l].classList.add("active"));

  packet.classList.remove("hidden");
  packet.textContent = s.packet.text;
  packet.style.left = `${s.packet.x}px`;
  packet.style.top = `${s.packet.y}px`;

  stepTitle.textContent = s.title;
  stepDescription.textContent = "What is happening right now:";
  stepBullets.innerHTML = s.bullets.map((b) => `<li>${b}</li>`).join("");
  phaseIndex.textContent = `${i + 1} / ${steps.length}`;
  stepLabel.textContent = s.label;
}

function next() {
  if (idx < steps.length - 1) {
    idx += 1;
    renderStep(idx);
  } else {
    clearInterval(timer);
  }
}

function start() {
  clearInterval(timer);
  if (idx >= steps.length - 1) idx = -1;
  const delay = 2600 - Number(document.getElementById("speedRange").value) * 350;
  timer = setInterval(next, delay);
  next();
}

document.getElementById("startBtn").addEventListener("click", start);
document.getElementById("pauseBtn").addEventListener("click", () => clearInterval(timer));
document.getElementById("nextBtn").addEventListener("click", () => {
  clearInterval(timer);
  next();
});
document.getElementById("resetBtn").addEventListener("click", () => {
  clearInterval(timer);
  idx = -1;
  Object.values(nodeEls).forEach((el) => el.classList.remove("active"));
  Object.values(linkEls).forEach((el) => el.classList.remove("active"));
  packet.classList.add("hidden");
  stepTitle.textContent = 'Press “Start slow animation”';
  stepDescription.textContent = "Details for each phase will appear here.";
  stepBullets.innerHTML = "";
  phaseIndex.textContent = `0 / ${steps.length}`;
  stepLabel.textContent = "Press Start to animate.";
});

renderCatalogue();
