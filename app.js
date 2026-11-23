const icons = {
  terminal: '<path d="m4 7 4.5 4.5L4 16m8 0h7"/>',
  radar: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="m12 12 6-6M12 12h.01"/>',
  nodes: '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4m-6 4v-4h12v4"/>',
  shield: '<path d="M12 3 4.5 6v5.3c0 4.3 3 7.6 7.5 9.7 4.5-2.1 7.5-5.4 7.5-9.7V6L12 3Z"/><path d="m9 12 2 2 4-4"/>',
  activity: '<path d="M3 12h4l2.5-6 4.5 12 2.5-6H21"/>',
  file: '<path d="M13 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9l-6-6Z"/><path d="M13 3v6h6M8 13h8m-8 4h8"/>',
  home: '<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',
  book: '<path d="M12 6.5C9.5 4 6.5 4 3 4.5v14c3.5-.5 6.5-.5 9 2 2.5-2.5 5.5-2.5 9-2v-14c-3.5-.5-6.5-.5-9 2Zm0 0v14"/>',
  github: '<path d="M9 19c-4.3 1.4-4.3-2.2-6-2.7m12 5v-3.5c0-1 .1-1.4-.5-2 2.7-.3 5.5-1.3 5.5-6a4.6 4.6 0 0 0-1.2-3.2c.2-.7.3-1.8-.2-3.1 0 0-1-.3-3.3 1.2a11.7 11.7 0 0 0-6.1 0C6.9 3.2 5.9 3.5 5.9 3.5c-.5 1.3-.4 2.4-.2 3.1a4.6 4.6 0 0 0-1.2 3.2c0 4.7 2.8 5.7 5.5 6-.5.5-1 1.2-1 2v3.5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  search: '<circle cx="10.5" cy="10.5" r="5.8"/><path d="m15 15 4.5 4.5"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  link: '<path d="M10 13.5a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.7 1.7m2.7 4a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 19.2l1.7-1.7"/>',
};

const main = document.getElementById("main");
const navigation = document.getElementById("navigation");
const breadcrumb = document.getElementById("breadcrumb");
const menuButton = document.getElementById("menu-button");
const searchTrigger = document.getElementById("search-trigger");
const searchDialog = document.getElementById("search-dialog");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
const searchSummary = document.getElementById("search-summary");
const toast = document.getElementById("toast");

const commands = phases.flatMap(phase => phase.commands.map(command => ({
  ...command,
  phase,
  href: `#${phase.id}/${command.id}`,
})));

const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

function icon(name) {
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;
}

document.querySelectorAll("[data-icon]").forEach(element => {
  element.innerHTML = icon(element.dataset.icon);
});

function phaseNumber(index) {
  return String(index + 1).padStart(2, "0");
}

function navLink(id, title, symbol, color = "") {
  return `<a class="nav-link ${color}" href="#${id}" data-route="${id}"><span class="nav-icon">${icon(symbol)}</span><span>${escapeHTML(title)}</span></a>`;
}

navigation.innerHTML = `
  ${navLink("accueil", "Vue d’ensemble", "home")}
  <p class="nav-heading">Phases PTES</p>
  ${phases.map(phase => navLink(phase.id, phase.title, phase.icon, phase.color)).join("")}
  <div class="nav-divider"></div>
  ${navLink("ressources", "Ressources", "book")}
`;

function block(code, shell, title) {
  return `<div class="code-block">
    <div class="code-bar">
      <span>${escapeHTML(shell)}</span>
      <button class="copy-button" type="button" aria-label="${escapeHTML(`Copier — ${title}`)}" data-copy>${icon("copy")}<span>Copier</span></button>
    </div>
    <pre tabindex="0"><code>${escapeHTML(code)}</code></pre>
  </div>`;
}

function resourceLink(resource) {
  return `<li class="resource-item" id="item-${resource.id}" tabindex="-1">
    <a href="${escapeHTML(resource.url)}">
      <span class="resource-icon">${icon("link")}</span>
      <span><strong>${escapeHTML(resource.name)}</strong><span class="resource-description">${escapeHTML(resource.description)}</span></span>
      <span class="resource-category">${escapeHTML(resource.category)}</span>
    </a>
  </li>`;
}

function renderHome() {
  const cards = phases.map((phase, index) => `<li>
    <a class="phase-link ${phase.color}" href="#${phase.id}">
      <span class="phase-icon">${icon(phase.icon)}</span>
      <span class="phase-text"><strong>${escapeHTML(phase.title)}</strong><span>${escapeHTML(phase.summary)}</span></span>
      <span class="phase-number" aria-hidden="true">${phaseNumber(index)}</span>
    </a>
  </li>`).join("");

  const shortcuts = quickCommands.map(id => {
    const command = commands.find(item => item.id === id);
    return `<li class="quick-item"><a href="${command.href}"><strong>${escapeHTML(command.title)}</strong></a>${block(command.code, command.shell, command.title)}</li>`;
  }).join("");

  main.innerHTML = `
    <section class="hero">
      <div class="hero-content">
        <p class="hero-byline">Le mémo de WaridoSann</p>
        <h1>Carnet de pentest</h1>
        <p>Commandes d’audit, points à vérifier et références, de la reconnaissance au rapport.</p>
      </div>
      <div class="signal" aria-hidden="true">
        <div class="signal-grid"></div>
        <div class="signal-circle signal-outer"></div><div class="signal-circle signal-middle"></div><div class="signal-circle signal-inner"></div>
        <div class="signal-axis signal-horizontal"></div><div class="signal-axis signal-vertical"></div>
        <span class="signal-point signal-center"></span><span class="signal-point signal-point-one"></span><span class="signal-point signal-point-two"></span>
      </div>
    </section>
    <section class="home-section" aria-labelledby="phase-heading">
      <h2 id="phase-heading">Phases PTES</h2>
      <ol class="phase-grid">${cards}</ol>
    </section>
    <section class="home-section" aria-labelledby="quick-heading">
      <h2 id="quick-heading">Commandes rapides</h2>
      <ul class="quick-grid">${shortcuts}</ul>
    </section>`;
}

function renderPhase(phase) {
  const index = phases.indexOf(phase);
  const commandCards = phase.commands.map(command => `<article class="command" id="item-${command.id}" tabindex="-1">
    <h3>${escapeHTML(command.title)}</h3>
    <p>${escapeHTML(command.description)}</p>
    ${block(command.code, command.shell, command.title)}
  </article>`).join("");
  const links = phase.links.map(id => resourceLink(resources.find(resource => resource.id === id))).join("");
  const report = phase.template ? `<section class="detail-section"><h2>Modèle de constat</h2>${block(phase.template, "Texte", "Modèle de constat")}</section>` : "";

  main.innerHTML = `
    <header class="detail-header ${phase.color}">
      <div class="detail-label"><span class="phase-icon">${icon(phase.icon)}</span><span>Phase ${phaseNumber(index)} sur ${phases.length}</span></div>
      <h1>${escapeHTML(phase.title)}</h1>
      <p>${escapeHTML(phase.introduction)}</p>
    </header>
    <div class="detail-grid">
      <div class="detail-primary">
        <section class="detail-section"><h2>Commandes</h2><div class="command-list">${commandCards}</div></section>
        ${report}
      </div>
      <aside class="phase-aside" aria-label="Repères pour cette phase">
        <section class="aside-panel">
          <h2>À vérifier</h2>
          <ul class="check-list">${phase.checks.map(item => `<li>${icon("check")}<span>${escapeHTML(item)}</span></li>`).join("")}</ul>
        </section>
        <section class="aside-panel reminder">
          <h2>À retenir</h2><p>${escapeHTML(phase.reminder)}</p>
        </section>
      </aside>
    </div>
    <section class="detail-section"><h2>Références</h2><ul class="resource-list">${links}</ul></section>`;
}

function renderResources() {
  main.innerHTML = `
    <header class="detail-header">
      <div class="detail-label"><span class="phase-icon">${icon("book")}</span></div>
      <h1>Ressources</h1>
      <p>Documentation officielle pour retrouver une option, un avis ou une méthode.</p>
    </header>
    <ul class="resource-list">${resources.map(resourceLink).join("")}</ul>`;
}

function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  menuButton.innerHTML = icon(open ? "close" : "menu");
}

function navigate(moveFocus = false) {
  if (location.hash === "#main") return;
  const [requestedPage, entry] = location.hash.slice(1).split("/");
  const phase = phases.find(item => item.id === requestedPage);
  const page = phase?.id || (requestedPage === "ressources" ? "ressources" : "accueil");
  const label = phase?.title || (page === "ressources" ? "Ressources" : "Vue d’ensemble");

  if (phase) renderPhase(phase);
  else if (page === "ressources") renderResources();
  else renderHome();

  for (const link of navigation.querySelectorAll("a")) {
    if (link.dataset.route === page) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  breadcrumb.textContent = label;
  document.title = page === "accueil" ? "Carnet PTES · WaridoSann" : `${label} · Carnet PTES`;
  setMenu(false);

  const target = entry && document.getElementById(`item-${entry}`);
  if (target) {
    target.scrollIntoView({ block: "start" });
    target.focus({ preventScroll: true });
  } else if (moveFocus) {
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }
}

const searchIndex = [
  ...phases.map(phase => ({
    title: phase.title, detail: phase.summary, href: `#${phase.id}`, type: "Phase", icon: phase.icon,
    keywords: `${phase.introduction} ${phase.checks.join(" ")} ${phase.reminder} ${phase.id === "post-exploitation" ? "privesc élévation de privilèges" : ""}`,
  })),
  ...commands.map(command => ({
    title: command.title, detail: command.phase.title, href: command.href, type: command.shell, icon: "terminal",
    keywords: `${command.code} ${command.description}`,
  })),
  ...resources.map(resource => ({
    title: resource.name, detail: resource.description, href: `#ressources/${resource.id}`, type: resource.category, icon: "book",
    keywords: resource.id === "hashcat" ? "hash hachage mots de passe password" : "",
  })),
].map(entry => ({ ...entry, index: normalize(`${entry.title} ${entry.detail} ${entry.type} ${entry.keywords}`) }));

function normalize(value) {
  return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function showSearchResults() {
  const query = normalize(searchInput.value.trim());
  const words = query.split(/\s+/);
  const matches = query
    ? searchIndex.filter(item => words.every(word => item.index.includes(word)))
    : searchIndex.slice(0, phases.length);
  searchSummary.textContent = !query
    ? "Accès direct aux phases"
    : matches.length
      ? `${matches.length} résultat${matches.length === 1 ? "" : "s"}`
      : "Aucun résultat. Essaie « Linux », « ports » ou « Hashcat ».";
  searchResults.innerHTML = matches.map(item => `<li>
    <a href="${item.href}"><span class="search-result-icon">${icon(item.icon)}</span><span><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.detail)}</small></span><span class="search-result-type">${escapeHTML(item.type)}</span></a>
  </li>`).join("");
}

function openSearch() {
  if (searchDialog.open) return;
  searchInput.value = "";
  showSearchResults();
  searchDialog.showModal();
  searchInput.focus();
}

searchTrigger.addEventListener("click", openSearch);
searchInput.addEventListener("input", showSearchResults);
searchInput.addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === "ArrowDown") {
    const first = searchResults.querySelector("a");
    if (!first) return;
    event.preventDefault();
    if (event.key === "Enter") first.click();
    else first.focus();
  }
});

menuButton.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openSearch();
  }
  if (event.key === "Escape" && document.body.classList.contains("menu-open") && !searchDialog.open) {
    setMenu(false);
    menuButton.focus();
  }
});

document.addEventListener("click", event => {
  const anchor = event.target.closest('a[href^="#"]');
  if (!anchor || anchor.hash === "#main" || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  if (searchDialog.open) searchDialog.close();
  if (anchor.hash === location.hash) navigate(true);
});

let toastTimer;
function announce(message) {
  clearTimeout(toastTimer);
  toast.hidden = false;
  toast.textContent = message;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2400);
}

main.addEventListener("click", async event => {
  const button = event.target.closest("button[data-copy]");
  if (!button) return;
  const code = button.closest(".code-block").querySelector("code");
  try {
    await navigator.clipboard.writeText(code.textContent);
    announce("Copié dans le presse-papiers");
  } catch {
    const range = document.createRange();
    range.selectNodeContents(code);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    if (document.execCommand("copy")) {
      selection.removeAllRanges();
      announce("Copié dans le presse-papiers");
    } else {
      announce("Texte sélectionné. Utilise le raccourci de copie.");
    }
  }
});

window.addEventListener("hashchange", () => navigate(true));
navigate();
