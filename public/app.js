const editor = document.getElementById("sql-editor");
const runBtn = document.getElementById("run-btn");
const clearBtn = document.getElementById("clear-btn");
const runInfo = document.getElementById("run-info");
const errorBox = document.getElementById("error-box");
const resultMeta = document.getElementById("result-meta");
const table = document.getElementById("results-table");
const thead = table.querySelector("thead tr");
const tbody = table.querySelector("tbody");
const emptyState = document.getElementById("empty-state");
const schemaListEl = document.getElementById("schema-list");
const examplesListEl = document.getElementById("examples-list");

function badgeClass(value) {
  if (value === "high") return "badge-high";
  if (value === "medium") return "badge-medium";
  if (value === "low") return "badge-low";
  return "";
}

async function loadSchema() {
  const res = await fetch("/api/schema");
  const schema = await res.json();
  schemaListEl.innerHTML = "";
  Object.entries(schema).forEach(([table, info]) => {
    const item = document.createElement("div");
    item.className = "schema-item";
    item.innerHTML = `
      <div class="schema-item-head">
        <span>${table}</span>
        <span class="count">${info.row_count} riadkov</span>
      </div>
      <div class="schema-cols">${info.columns.map(c => `${c.name} <span style="opacity:.55">(${c.type})</span>`).join("<br/>")}</div>
    `;
    item.addEventListener("click", () => item.classList.toggle("open"));
    schemaListEl.appendChild(item);
  });
}

async function loadExamples() {
  const res = await fetch("/api/examples");
  const examples = await res.json();
  examplesListEl.innerHTML = "";
  examples.forEach((ex) => {
    const item = document.createElement("div");
    item.className = "example-item";
    item.innerHTML = `<div class="ex-title">${ex.title}</div><div class="ex-desc">${ex.description}</div>`;
    item.addEventListener("click", () => {
      editor.value = ex.sql;
      editor.focus();
    });
    examplesListEl.appendChild(item);
  });
}

async function runQuery() {
  const sql = editor.value.trim();
  if (!sql) return;

  errorBox.hidden = true;
  runInfo.textContent = "beží...";
  runBtn.disabled = true;

  try {
    const res = await fetch("/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql })
    });
    const data = await res.json();

    if (!res.ok) {
      errorBox.textContent = data.error || "Neznama chyba.";
      errorBox.hidden = false;
      runInfo.textContent = "";
      thead.innerHTML = "";
      tbody.innerHTML = "";
      emptyState.hidden = false;
      emptyState.textContent = "Dotaz zlyhal - oprav chybu vyssie a skus znova.";
      return;
    }

    runInfo.textContent = `${data.ms} ms`;
    resultMeta.textContent = `${data.row_count} riadkov · ${data.columns.length} stlpcov`;

    thead.innerHTML = data.columns.map(c => `<th>${c}</th>`).join("");
    tbody.innerHTML = "";

    if (data.rows.length === 0) {
      emptyState.hidden = false;
      emptyState.textContent = "Dotaz prebehol uspesne, ale nevratil ziadne riadky.";
    } else {
      emptyState.hidden = true;
      const frag = document.createDocumentFragment();
      data.rows.forEach((row) => {
        const tr = document.createElement("tr");
        data.columns.forEach((col) => {
          const td = document.createElement("td");
          const val = row[col];
          td.textContent = val === null || val === undefined ? "NULL" : val;
          const cls = badgeClass(val);
          if (cls) td.className = cls;
          tr.appendChild(td);
        });
        frag.appendChild(tr);
      });
      tbody.appendChild(frag);
    }
  } catch (e) {
    errorBox.textContent = "Chyba pripojenia k serveru: " + e.message;
    errorBox.hidden = false;
  } finally {
    runBtn.disabled = false;
  }
}

runBtn.addEventListener("click", runQuery);
clearBtn.addEventListener("click", () => {
  editor.value = "";
  editor.focus();
});

editor.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    runQuery();
  }
});

loadSchema();
loadExamples();
runQuery(); // spusti default query pri nacitani stranky
