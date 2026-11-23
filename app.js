const phaseIcons = {
  reconnaissance: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="m12 12 6-6M12 12h.01"/>',
  "internal-services": '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4m-6 4v-4h12v4"/>',
  vulnerabilites: '<path d="M12 3 4.5 6v5.3c0 4.3 3 7.6 7.5 9.7 4.5-2.1 7.5-5.4 7.5-9.7V6L12 3Z"/><path d="m9 12 2 2 4-4"/>',
  exploitation: '<path d="m4 7 4.5 4.5L4 16m8 0h7"/>',
  "post-exploitation": '<path d="M3 12h4l2.5-6 4.5 12 2.5-6H21"/>',
  "web-enumeration": '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4a12 12 0 0 1 0 16 12 12 0 0 1 0-16Z"/>',
  privesc: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3m-4 4v2"/>',
  verification: '<circle cx="12" cy="12" r="8"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  rapport: '<path d="M13 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9l-6-6Z"/><path d="M13 3v6h6M8 13h8m-8 4h8"/>',
};

const main = document.getElementById("main");
const searchDialog = document.getElementById("search-dialog");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
const searchSummary = document.getElementById("search-summary");
const copyStatus = document.getElementById("copy-status");

const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

const legacyEntries = {
  workflow: "reconnaissance",
  "workflow-network": "reconnaissance",
  "workflow-web": "web-enumeration",
  "workflow-whatweb": "whatweb-local",
  "workflow-advisories": "vulnerabilites",
  "workflow-linux": "post-exploitation",
  "workflow-account": "identite-linux",
  "workflow-os": "linux-release",
  "workflow-files": "home-directories",
  "workflow-permissions": "privesc",
  "workflow-schedules": "taches-systemd",
  "workflow-report": "rapport",
};

function icon(id) {
  return `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${phaseIcons[id]}</svg>`;
}

function pageHeader(title, includeReferences = true) {
  return `<nav aria-label="Workflow navigation">
    <a href="#accueil">All stages</a>
    <div class="nav-actions">
      ${includeReferences ? '<a href="#ressources">References</a>' : ""}
      <button type="button" data-search>Search</button>
    </div>
  </nav>
  <h1>${escapeHTML(title)}</h1>`;
}

function renderHome() {
  main.className = "home";
  main.innerHTML = `
    <h1 class="visually-hidden">Pentesting Workflow</h1>
    <nav aria-label="Workflow stages">
      <ul class="phase-grid">${stages.map(stage => `
        <li><a href="#${stage.id}" class="phase-link" aria-label="${escapeHTML(stage.title)}">
          <span class="phase-icon">${icon(stage.id)}</span>
          <span>${escapeHTML(stage.tileTitle || stage.title)}</span>
        </a></li>`).join("")}
      </ul>
    </nav>`;
}

function renderCommands(commands) {
  return `<ul class="command-list">${commands.map(command => {
    const title = escapeHTML(command.title);
    return `<li class="command" id="item-${command.id}" tabindex="-1">
      <p class="command-title">${title}</p>
      ${command.when ? `<p class="guidance">${escapeHTML(command.when)}</p>` : ""}
      <div class="terminal">
        <pre><code>${escapeHTML(command.code)}</code></pre>
        <button type="button" aria-label="Copy ${title}" data-copy>Copy</button>
      </div>
      <p class="command-description">${escapeHTML(command.description)}</p>
    </li>`;
  }).join("")}</ul>`;
}

function referenceLinks(ids, listClass) {
  return `<ul class="${listClass}">${ids.map(id => {
    const resource = resources[id];
    return `<li><a href="${escapeHTML(resource.url)}">${escapeHTML(resource.name)}</a></li>`;
  }).join("")}</ul>`;
}

function renderDisclosure(item, body, className) {
  return `<details class="disclosure ${className}" id="item-${item.id}">
    <summary aria-expanded="false" aria-controls="panel-${item.id}">
      <span class="disclosure-text">
        <span class="disclosure-title">${escapeHTML(item.title)}</span>
        <span class="disclosure-purpose">${escapeHTML(item.purpose)}</span>
      </span>
    </summary>
    <div id="panel-${item.id}" class="disclosure-content">${body}</div>
  </details>`;
}

function renderGuidance(item) {
  return item.when ? `<p class="guidance"><strong>When to use.</strong> ${escapeHTML(item.when)}</p>` : "";
}

function renderWorkflow() {
  main.className = "document workflow-page";
  main.innerHTML = `${pageHeader("Workflow")}
    <div class="stages">${stages.map(stage => renderDisclosure(stage, `
      ${renderGuidance(stage)}
      ${renderCommands(stage.commands)}
      ${(stage.sections || []).map(section => renderDisclosure(section,
        renderGuidance(section) + renderCommands(section.commands), "subsection"
      )).join("")}
      ${stage.references ? referenceLinks(stage.references, "stage-references") : ""}
    `, "stage")).join("")}</div>`;
}

function renderResources() {
  main.className = "document resources-page";
  main.innerHTML = `${pageHeader("References", false)}
    <ul class="reference-list">${Object.entries(resources).map(([id, resource]) =>
      `<li id="item-${id}" tabindex="-1"><a href="${escapeHTML(resource.url)}">${escapeHTML(resource.name)}</a></li>`
    ).join("")}</ul>`;
}

function syncExpanded(details) {
  details.firstElementChild.setAttribute("aria-expanded", String(details.open));
}

main.addEventListener("toggle", event => {
  if (event.target instanceof HTMLDetailsElement) syncExpanded(event.target);
}, true);

function navigate(moveFocus = false) {
  const fragment = location.hash.slice(1);
  const [page, entry] = fragment.split("/");
  const resource = page === "ressources";
  const namedStage = page === "modelisation" ? "vulnerabilites" : page;
  const entryId = legacyEntries[entry] || entry;
  const selected = resource ? undefined : workflowIndex.find(item => item.id === entryId) ||
    workflowIndex.find(item => item.id === namedStage);
  let target;

  if (resource) {
    renderResources();
    target = entry && document.getElementById(`item-${entry}`);
    document.title = "References · Pentesting Workflow";
  } else if (selected || page === "workflow") {
    if (!main.classList.contains("workflow-page")) renderWorkflow();
    target = selected && document.getElementById(`item-${selected.id}`);
    if (selected && location.hash !== selected.href) history.replaceState(null, "", selected.href);
    document.title = selected ? `${selected.context || selected.title} · Pentesting Workflow` : "Pentesting Workflow";
  } else {
    renderHome();
    document.title = "Pentesting Workflow";
  }

  if (target) {
    for (let details = target.closest("details"); details; details = details.parentElement.closest("details")) {
      details.open = true;
      syncExpanded(details);
    }
    target.scrollIntoView({ block: "start" });
    const focusTarget = target instanceof HTMLDetailsElement ? target.firstElementChild : target;
    focusTarget.focus({ preventScroll: true });
  } else if (moveFocus) {
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }
}

function normalize(value) {
  return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function workflowSearchItem(item, stage) {
  return {
    id: item.id,
    title: item.title,
    context: item === stage ? "" : stage.title,
    href: item === stage ? `#${stage.id}` : `#${stage.id}/${item.id}`,
    keywords: [item.code, item.purpose, item.when, item.description].filter(Boolean).join(" "),
  };
}

const workflowIndex = stages.flatMap(stage => [
  workflowSearchItem(stage, stage),
  ...stage.commands.map(command => workflowSearchItem(command, stage)),
  ...(stage.sections || []).flatMap(section => [
    workflowSearchItem(section, stage),
    ...section.commands.map(command => workflowSearchItem(command, stage)),
  ]),
]);

const searchIndex = [
  ...workflowIndex,
  ...Object.entries(resources).map(([id, resource]) => ({
    title: resource.name, context: "References", href: `#ressources/${id}`, keywords: "",
  })),
].map(item => ({ ...item, text: normalize(`${item.title} ${item.context} ${item.keywords}`) }));

function showSearchResults() {
  const query = normalize(searchInput.value.trim());
  const words = query.split(/\s+/);
  const matches = query
    ? searchIndex.filter(item => words.every(word => item.text.includes(word)))
    : searchIndex.filter(item => !item.context);
  searchSummary.textContent = matches.length ? "" : "No results.";
  searchResults.innerHTML = matches.map(item => `<li><a href="${item.href}">
    <span>${escapeHTML(item.title)}</span>
    ${item.context ? `<small>${escapeHTML(item.context)}</small>` : ""}
  </a></li>`).join("");
}

function openSearch() {
  if (searchDialog.open) return;
  searchInput.value = "";
  showSearchResults();
  searchDialog.showModal();
  searchInput.focus();
}

async function copyCommand(button) {
  const code = button.closest(".command").querySelector("pre code");
  let copied = true;
  try {
    await navigator.clipboard.writeText(code.textContent);
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(code);
    selection.removeAllRanges();
    selection.addRange(range);
    copied = document.execCommand("copy");
    if (copied) selection.removeAllRanges();
  }
  button.textContent = copied ? "Copied" : "Selected";
  copyStatus.textContent = copied ? "Copied to the clipboard." : "Text selected. Use your copy shortcut.";
  clearTimeout(copyTimers.get(button));
  copyTimers.set(button, setTimeout(() => { button.textContent = "Copy"; }, 2200));
}

const copyTimers = new WeakMap();

main.addEventListener("click", event => {
  if (event.target.closest("button[data-search]")) openSearch();
  const copyButton = event.target.closest("button[data-copy]");
  if (copyButton) void copyCommand(copyButton);
});

searchInput.addEventListener("input", showSearchResults);
searchInput.addEventListener("keydown", event => {
  if (event.key !== "Enter" && event.key !== "ArrowDown") return;
  const first = searchResults.querySelector("a");
  if (!first) return;
  event.preventDefault();
  if (event.key === "Enter") first.click();
  else first.focus();
});

document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openSearch();
  }
});

document.addEventListener("click", event => {
  const anchor = event.target.closest('a[href^="#"]');
  if (!anchor || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  if (searchDialog.open) searchDialog.close();
  if (anchor.hash === location.hash) navigate(true);
});

window.addEventListener("hashchange", () => navigate(true));
navigate();
