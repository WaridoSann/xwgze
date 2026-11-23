const phaseIcons = {
  reconnaissance: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="m12 12 6-6M12 12h.01"/>',
  modelisation: '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4m-6 4v-4h12v4"/>',
  vulnerabilites: '<path d="M12 3 4.5 6v5.3c0 4.3 3 7.6 7.5 9.7 4.5-2.1 7.5-5.4 7.5-9.7V6L12 3Z"/><path d="m9 12 2 2 4-4"/>',
  exploitation: '<path d="m4 7 4.5 4.5L4 16m8 0h7"/>',
  "post-exploitation": '<path d="M3 12h4l2.5-6 4.5 12 2.5-6H21"/>',
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

function pageHeader(title) {
  return `<nav aria-label="Notebook navigation">
    <a href="#accueil">All phases</a>
    <button type="button" data-search>Search</button>
  </nav>
  <h1>${escapeHTML(title)}</h1>`;
}

function renderHome() {
  main.className = "home";
  main.innerHTML = `
    <h1 class="visually-hidden">PTES Notebook</h1>
    <nav aria-label="PTES phases">
      <ul class="phase-grid">${phases.map(phase => `
        <li><a href="#${phase.id}" class="phase-link" aria-label="${escapeHTML(phase.title)}">
          <span class="phase-icon"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${phaseIcons[phase.id]}</svg></span>
          <span>${escapeHTML(phase.tileTitle || phase.title)}</span>
        </a></li>`).join("")}
      </ul>
    </nav>`;
}

function renderCommand(command, step) {
  const title = escapeHTML(command.title);
  const heading = step ? `${step}. ${title}` : title;
  const flags = command.flags ? `<dl class="command-flags">${command.flags.map(([flag, description]) =>
    `<dt><code>${escapeHTML(flag)}</code></dt><dd>${escapeHTML(description)}</dd>`
  ).join("")}</dl>` : "";
  return `<li class="command" id="item-${command.id}" tabindex="-1">
    <div class="command-text">
      <p class="command-title">${heading}</p>
      ${command.why ? `<p class="command-hint">${escapeHTML(command.why)}</p>` : ""}
      <pre><code>${escapeHTML(command.code)}</code></pre>
      ${flags}
      ${command.hint ? `<p class="command-hint">${escapeHTML(command.hint)}</p>` : ""}
    </div>
    <button type="button" aria-label="Copy ${title}" data-copy>Copy</button>
  </li>`;
}

function referenceLinks(ids) {
  return `<ul class="reference-list">${ids.map(id => {
    const resource = resources[id];
    return `<li id="item-${id}" tabindex="-1"><a href="${escapeHTML(resource.url)}">${escapeHTML(resource.name)}</a></li>`;
  }).join("")}</ul>`;
}

function renderWorkflow(group) {
  const commands = new Map(group.commands.map(command => [command.id, command]));
  return `<ol class="workflow-steps">${group.steps.map(step => `
    <li class="workflow-step" id="item-${step.id}" tabindex="-1">
      <h3>${escapeHTML(step.title)}</h3>
      <p class="command-hint">${escapeHTML(step.description)}</p>
      ${step.commandIds ? `<ul class="command-list">${step.commandIds.map(id => renderCommand(commands.get(id))).join("")}</ul>` : ""}
    </li>`).join("")}
  </ol>
  ${group.summary ? `<p class="command-hint workflow-summary">${escapeHTML(group.summary)}</p>` : ""}`;
}

function renderGroup(group) {
  const listTag = group.ordered ? "ol" : "ul";
  const anchor = group.id ? ` id="item-${group.id}" tabindex="-1"` : "";
  const content = group.steps ? renderWorkflow(group) : `<${listTag} class="command-list">${group.commands.map((command, index) =>
    renderCommand(command, group.ordered ? index + 1 : undefined)
  ).join("")}</${listTag}>`;
  return `<section${anchor}>
    <h2>${escapeHTML(group.name)}</h2>
    ${group.note ? `<p class="command-hint">${escapeHTML(group.note)}</p>` : ""}
    ${content}
  </section>`;
}

function renderPhase(phase) {
  main.className = "document";
  main.innerHTML = `${pageHeader(phase.title)}
    ${phase.groups.map(renderGroup).join("")}
    <section class="references">
      <h2>References</h2>
      ${referenceLinks(phase.references)}
    </section>`;
}

function renderResources() {
  main.className = "document";
  main.innerHTML = `${pageHeader("Resources")}${referenceLinks(Object.keys(resources))}`;
}

function navigate(moveFocus = false) {
  let [page, entry] = location.hash.slice(1).split("/");
  if (page === "reconnaissance" && entry) {
    const audit = phases.find(phase => phase.id === "post-exploitation")?.groups.find(group => group.id === "privesc");
    if (audit?.steps.some(step => step.id === entry) || audit?.commands.some(command => command.id === entry)) {
      page = "post-exploitation";
      history.replaceState(null, "", `#${page}/${entry}`);
    }
  }
  const phase = phases.find(item => item.id === page);
  const title = phase?.title || (page === "ressources" ? "Resources" : "");

  if (phase) renderPhase(phase);
  else if (page === "ressources") renderResources();
  else renderHome();

  document.title = title ? `${title} · PTES Notebook` : "PTES Notebook";

  const target = entry && document.getElementById(`item-${entry}`);
  if (target) {
    target.scrollIntoView({ block: "start" });
    target.focus({ preventScroll: true });
  } else if (moveFocus) {
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }
}

function normalize(value) {
  return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

const searchIndex = [
  ...phases.map(phase => ({
    title: phase.title, href: `#${phase.id}`, keywords: phase.keywords || "",
  })),
  ...phases.flatMap(phase => phase.groups.flatMap(group => [
    ...(group.id ? [{ title: group.name, context: phase.title, href: `#${phase.id}/${group.id}`, keywords: "" }] : []),
    ...(group.steps || []).map(step => ({
      title: step.title, context: phase.title, href: `#${phase.id}/${step.id}`, keywords: step.description,
    })),
    ...group.commands.map(command => ({
      title: command.title, context: phase.title, href: `#${phase.id}/${command.id}`,
      keywords: `${group.name} ${command.code} ${command.hint || ""} ${command.why || ""}`,
    })),
  ])),
  ...Object.entries(resources).map(([id, resource]) => ({
    title: resource.name, context: "Resources", href: `#ressources/${id}`, keywords: resource.keywords || "",
  })),
].map(item => ({ ...item, text: normalize(`${item.title} ${item.context || ""} ${item.keywords}`) }));

function showSearchResults() {
  const query = normalize(searchInput.value.trim());
  const words = query.split(/\s+/);
  const matches = query
    ? searchIndex.filter(item => words.every(word => item.text.includes(word)))
    : searchIndex.slice(0, phases.length);
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
  const code = button.closest(".command").querySelector("code");
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
