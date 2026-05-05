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
    bullets: ["Browser parses URL and checks local cache/service worker."],
    detail: `
      <div class="mini-diagram">
        <h4>URL parsing flow</h4>
        <div class="flow-row"><span>https://</span><span>domain</span><span>/path?query</span></div>
        <p>Browser splits protocol, host, path, and query before networking.</p>
      </div>`
  },
  {
    title: "2) DNS lookup",
    label: "Client asks DNS for IP",
    activeNodes: ["client", "dns"],
    activeLinks: ["client-dns"],
    packet: { text: "REQ", x: 270, y: 83 },
    bullets: ["Cache miss triggers recursive DNS via resolver."],
    detail: `
      <div class="mini-diagram">
        <h4>DNS cache resolution path</h4>
        <div class="stack">
          <div>1. Browser cache</div>
          <div>2. OS cache</div>
          <div>3. Router/ISP resolver cache</div>
          <div>4. Recursive resolver</div>
        </div>
      </div>`
  },
  {
    title: "3) DNS response",
    label: "DNS returns destination IP",
    activeNodes: ["client", "dns"],
    activeLinks: ["client-dns"],
    packet: { text: "IP", x: 95, y: 83 },
    bullets: ["Client now knows server IP address."],
    detail: `
      <div class="mini-diagram">
        <h4>Recursive DNS chain</h4>
        <div class="arrow-chain">
          <span>Resolver</span><span>Root</span><span>TLD</span><span>Authoritative NS</span><span>A/AAAA Record</span>
        </div>
      </div>`
  },
  {
    title: "4) TCP/TLS handshake",
    label: "Client establishes secure channel",
    activeNodes: ["client", "server"],
    activeLinks: ["dns-server"],
    packet: { text: "SYN", x: 270, y: 255 },
    bullets: ["SYN/SYN-ACK/ACK then TLS certificate + key exchange."],
    detail: `
      <div class="mini-diagram">
        <h4>TCP 3-way handshake</h4>
        <div class="line-diagram">
          <div><b>Client</b> ─── SYN ───► <b>Server</b></div>
          <div><b>Client</b> ◄── SYN-ACK ─ <b>Server</b></div>
          <div><b>Client</b> ─── ACK ───► <b>Server</b></div>
        </div>
        <h4>TLS setup</h4>
        <div class="line-diagram"><div>ClientHello ⇄ ServerHello + Certificate ⇄ Session keys</div></div>
      </div>`
  },
  {
    title: "5) HTTP request to server",
    label: "Request reaches app infra",
    activeNodes: ["client", "server"],
    activeLinks: ["dns-server"],
    packet: { text: "GET", x: 270, y: 255 },
    bullets: ["CDN/LB/App server receives request and processes it."],
    detail: `
      <div class="mini-diagram">
        <h4>Infrastructure path</h4>
        <div class="arrow-chain"><span>Client</span><span>CDN</span><span>Load Balancer</span><span>App Server</span></div>
        <p>Headers, cookies, auth token and route metadata arrive with the request.</p>
      </div>`
  },
  {
    title: "6) HTTP response back",
    label: "Server returns HTML/CSS/JS",
    activeNodes: ["client", "server"],
    activeLinks: ["server-client"],
    packet: { text: "RES", x: 95, y: 255 },
    bullets: ["Status, headers, body returned and maybe cached."],
    detail: `
      <div class="mini-diagram">
        <h4>Response structure</h4>
        <div class="stack">
          <div>Status: 200 OK / 304 / ...</div>
          <div>Headers: cache-control, content-type, etag</div>
          <div>Body: HTML / JSON / assets</div>
        </div>
      </div>`
  },
  {
    title: "7) Browser render pipeline",
    label: "Client builds DOM/CSSOM",
    activeNodes: ["client", "render"],
    activeLinks: ["client-render"],
    packet: { text: "DOM", x: 95, y: 255 },
    bullets: ["DOM + CSSOM → render tree → layout → paint → composite."],
    detail: `
      <div class="mini-diagram">
        <h4>Rendering stages</h4>
        <div class="arrow-chain"><span>HTML→DOM</span><span>CSS→CSSOM</span><span>Render Tree</span><span>Layout</span><span>Paint</span><span>Composite</span></div>
      </div>`
  },
  {
    title: "8) Interactivity/hydration",
    label: "App becomes interactive",
    activeNodes: ["render", "client"],
    activeLinks: ["client-render"],
    packet: { text: "JS", x: 95, y: 83 },
    bullets: ["JS hydrates UI and future user actions trigger new requests."],
    detail: `
      <div class="mini-diagram">
        <h4>Hydration loop</h4>
        <div class="arrow-chain"><span>JS bundle</span><span>Attach events</span><span>User action</span><span>API call</span><span>Re-render</span></div>
      </div>`
  }
];

const nodeEls = {
  client: document.getElementById("node-client"), dns: document.getElementById("node-dns"),
  server: document.getElementById("node-server"), render: document.getElementById("node-render")
};
const linkEls = {
  "client-dns": document.querySelector(".link-client-dns"), "dns-server": document.querySelector(".link-dns-server"),
  "server-client": document.querySelector(".link-server-client"), "client-render": document.querySelector(".link-client-render")
};
const packet = document.getElementById("packet");
const stepTitle = document.getElementById("stepTitle");
const stepDescription = document.getElementById("stepDescription");
const stepBullets = document.getElementById("stepBullets");
const phaseIndex = document.getElementById("phaseIndex");
const stepLabel = document.getElementById("stepLabel");
const catalogue = document.getElementById("catalogue");
const detailDiagram = document.getElementById("detailDiagram");

let idx = -1;
let timer;

function renderCatalogue() {
  const entries = Object.entries(moduleTopics).filter(([, topics]) => topics.length > 0);
  catalogue.innerHTML = entries.map(([module, topics]) => `<div class="module-group"><h3>${module}</h3><div>${topics.map((t) => `<span class="topic-pill">${t}</span>`).join("")}</div></div>`).join("");
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
  detailDiagram.innerHTML = s.detail;
}

function next() { if (idx < steps.length - 1) { idx += 1; renderStep(idx); } else { clearInterval(timer); } }
function start() {
  clearInterval(timer);
  if (idx >= steps.length - 1) idx = -1;
  const delay = 2600 - Number(document.getElementById("speedRange").value) * 350;
  timer = setInterval(next, delay);
  next();
}

document.getElementById("startBtn").addEventListener("click", start);
document.getElementById("pauseBtn").addEventListener("click", () => clearInterval(timer));
document.getElementById("nextBtn").addEventListener("click", () => { clearInterval(timer); next(); });
document.getElementById("resetBtn").addEventListener("click", () => {
  clearInterval(timer); idx = -1;
  Object.values(nodeEls).forEach((el) => el.classList.remove("active"));
  Object.values(linkEls).forEach((el) => el.classList.remove("active"));
  packet.classList.add("hidden");
  stepTitle.textContent = 'Press “Start slow animation”';
  stepDescription.textContent = "Details for each phase will appear here.";
  stepBullets.innerHTML = "";
  phaseIndex.textContent = `0 / ${steps.length}`;
  stepLabel.textContent = "Press Start to animate.";
  detailDiagram.innerHTML = "";
});

renderCatalogue();
