const main = document.getElementById("main");
const searchDialog = document.getElementById("search-dialog");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
const searchSummary = document.getElementById("search-summary");
const copyStatus = document.getElementById("copy-status");

const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

function pageHeader(title, includeReferences = true) {
  return `<nav aria-label="Workflow navigation">
    ${includeReferences ? '<a href="#ressources">References</a>' : '<a href="#reconnaissance">Reconnaissance</a>'}
    <button type="button" data-search>Search</button>
  </nav>
  <h1>${escapeHTML(title)}</h1>`;
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
  main.innerHTML = `${pageHeader("Reconnaissance Workflow")}
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
  const selected = resource ? undefined : workflowIndex.find(item => item.id === entry) ||
    workflowIndex.find(item => item.id === page);
  let target;

  if (resource) {
    renderResources();
    target = entry && document.getElementById(`item-${entry}`);
    document.title = "References · Reconnaissance Workflow";
  } else {
    if (!main.classList.contains("workflow-page")) renderWorkflow();
    const resolved = selected || workflowIndex[0];
    target = document.getElementById(`item-${resolved.id}`);
    if (fragment && location.hash !== resolved.href) history.replaceState(null, "", resolved.href);
    document.title = "Reconnaissance Workflow";
  }

  if (target) {
    for (let details = target.closest("details"); details; details = details.parentElement.closest("details")) {
      details.open = true;
      syncExpanded(details);
    }
  }
  if (target && (selected || resource)) {
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
