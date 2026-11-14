const STORAGE_KEY = "pennywise-finance-v1";
const colors = ["#4d876b", "#e0ad6c", "#829abd", "#d48272", "#a4b899", "#dfe8de"];
const categories = ["Food", "Rent", "Transport", "Bills", "Shopping", "Health", "Entertainment", "Salary", "Other"];
const categoryIcons = { Food: "⌂", Rent: "⌂", Transport: "↗", Bills: "▤", Shopping: "◇", Health: "✚", Entertainment: "♫", Salary: "↙", Other: "·" };
const categoryClasses = { Food: "food", Rent: "home", Transport: "transport", Bills: "bills", Shopping: "shopping", Health: "health", Entertainment: "entertainment", Salary: "salary", Other: "other" };
const today = new Date();
const localDateString = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const dateOffset = (days, monthOffset = 0) => {
  const date = new Date(today.getFullYear(), today.getMonth() + monthOffset, today.getDate() - days);
  return localDateString(date);
};
const initialState = {
  openingBalance: 482000,
  overallBudget: 60000,
  budgets: { Food: 12000, Rent: 22000, Transport: 5000, Bills: 6000, Shopping: 7000, Health: 4000 },
  transactions: [
    { id: "seed-1", name: "Monthly salary", category: "Salary", type: "income", amount: 85000, date: dateOffset(1), account: "Everyday account", note: "Monthly salary" },
    { id: "seed-2", name: "Green Leaf Cafe", category: "Food", type: "expense", amount: 480, date: dateOffset(1), account: "Everyday account", note: "Lunch with Maya" },
    { id: "seed-3", name: "Apartment rent", category: "Rent", type: "expense", amount: 22000, date: dateOffset(2), account: "Everyday account", note: "Monthly rent" },
    { id: "seed-4", name: "Metro card recharge", category: "Transport", type: "expense", amount: 600, date: dateOffset(3), account: "Cash wallet", note: "Metro card recharge" },
    { id: "seed-5", name: "Electricity bill", category: "Bills", type: "expense", amount: 1840, date: dateOffset(4), account: "Everyday account", note: "Electricity bill" },
    { id: "seed-6", name: "Weekend groceries", category: "Food", type: "expense", amount: 2150, date: dateOffset(5), account: "Credit card", note: "Weekend groceries" },
    { id: "seed-7", name: "Bookstore", category: "Shopping", type: "expense", amount: 1299, date: dateOffset(7), account: "Credit card", note: "A little weekend reading" },
    { id: "seed-8", name: "Yoga studio", category: "Health", type: "expense", amount: 1800, date: dateOffset(9), account: "Everyday account", note: "Monthly membership" },
    { id: "seed-9", name: "Freelance project", category: "Salary", type: "income", amount: 12500, date: dateOffset(10), account: "Savings account", note: "Freelance project" },
    { id: "seed-10", name: "Dinner at Sora", category: "Food", type: "expense", amount: 1650, date: dateOffset(12), account: "Credit card", note: "Dinner at Sora" },
    { id: "seed-11", name: "Cab ride", category: "Transport", type: "expense", amount: 420, date: dateOffset(14), account: "Everyday account", note: "Cab ride home" },
    { id: "seed-12", name: "Streaming subscription", category: "Entertainment", type: "expense", amount: 649, date: dateOffset(16), account: "Credit card", note: "Streaming subscription" },
    { id: "seed-13", name: "Pharmacy", category: "Health", type: "expense", amount: 560, date: dateOffset(19), account: "Cash wallet", note: "Pharmacy" },
    { id: "seed-14", name: "Coffee & croissant", category: "Food", type: "expense", amount: 380, date: dateOffset(22), account: "Everyday account", note: "Coffee & croissant" },
    { id: "seed-15", name: "Phone bill", category: "Bills", type: "expense", amount: 899, date: dateOffset(25), account: "Everyday account", note: "Phone bill" },
    { id: "seed-16", name: "Dinner with friends", category: "Food", type: "expense", amount: 2350, date: dateOffset(28), account: "Credit card", note: "Dinner with friends" },
    { id: "seed-17", name: "Home supplies", category: "Shopping", type: "expense", amount: 1450, date: dateOffset(5, -1), account: "Everyday account", note: "Home supplies" },
    { id: "seed-18", name: "Monthly salary", category: "Salary", type: "income", amount: 85000, date: dateOffset(2, -1), account: "Everyday account", note: "Monthly salary" },
    { id: "seed-19", name: "Groceries", category: "Food", type: "expense", amount: 4820, date: dateOffset(9, -1), account: "Credit card", note: "Groceries" },
    { id: "seed-20", name: "Water & internet", category: "Bills", type: "expense", amount: 2350, date: dateOffset(12, -1), account: "Everyday account", note: "Water & internet" },
    { id: "seed-21", name: "Weekend getaway", category: "Entertainment", type: "expense", amount: 5900, date: dateOffset(17, -1), account: "Credit card", note: "Weekend getaway" },
    { id: "seed-22", name: "Freelance project", category: "Salary", type: "income", amount: 9500, date: dateOffset(21, -1), account: "Savings account", note: "Freelance project" }
  ]
};
let state = loadState();
let toastTimer;
let importRows = [];
let importHeaders = [];
let showAllTransactions = false;

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(initialState);
    const parsed = JSON.parse(saved);
    if (!parsed || !Array.isArray(parsed.transactions) || !parsed.budgets) throw new Error("Invalid saved data");
    return parsed;
  } catch (error) {
    console.error("Could not load saved finance data.", error);
    return structuredClone(initialState);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    showToast("Could not save your changes on this device.");
    console.error("Could not save finance data.", error);
  }
}

const money = (amount, compact = false) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0,
  notation: compact ? "compact" : "standard", compactDisplay: "short"
}).format(Math.round(amount || 0));
const currentMonth = () => `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
const dateLabel = value => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(`${value}T00:00:00`));
const isCurrentMonth = tx => tx.date && tx.date.slice(0, 7) === currentMonth();

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function render() {
  renderSummary();
  renderBreakdown();
  renderTrend();
  renderBudgets();
  renderTransactions();
}

function renderSummary() {
  const monthTransactions = state.transactions.filter(isCurrentMonth);
  const income = monthTransactions.filter(tx => tx.type === "income").reduce((sum, tx) => sum + Number(tx.amount), 0);
  const expenses = monthTransactions.filter(tx => tx.type === "expense").reduce((sum, tx) => sum + Number(tx.amount), 0);
  const balance = Number(state.openingBalance) + state.transactions.reduce((sum, tx) => sum + (tx.type === "income" ? Number(tx.amount) : -Number(tx.amount)), 0);
  document.getElementById("balanceAmount").textContent = money(balance);
  document.getElementById("incomeAmount").textContent = money(income);
  document.getElementById("expenseAmount").textContent = money(expenses);
  document.getElementById("savedAmount").textContent = money(income - expenses);
  document.getElementById("savingsTrack").style.width = `${Math.max(3, Math.min(100, income ? (income - expenses) / income * 100 : 0))}%`;
  const prettyDate = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" }).format(today);
  document.getElementById("todayLabel").textContent = prettyDate;
  document.getElementById("dateInput").value = localDateString(today);
  const monthSelect = document.getElementById("monthSelect");
  if (!monthSelect.options.length) {
    for (let offset = 0; offset < 6; offset++) {
      const month = new Date(today.getFullYear(), today.getMonth() - offset, 1);
      const value = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
      monthSelect.add(new Option(new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(month), value));
    }
  }
}

function renderBreakdown() {
  const month = document.getElementById("monthSelect").value || currentMonth();
  const totals = {};
  state.transactions.filter(tx => tx.type === "expense" && tx.date.slice(0, 7) === month).forEach(tx => {
    totals[tx.category] = (totals[tx.category] || 0) + Number(tx.amount);
  });
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const total = sorted.reduce((sum, entry) => sum + entry[1], 0);
  document.getElementById("donutTotal").textContent = money(total, true);
  document.getElementById("breakdownTotal").textContent = money(total);
  const segments = sorted.map((entry, index) => {
    const start = sorted.slice(0, index).reduce((sum, item) => sum + item[1], 0) / (total || 1) * 100;
    const end = start + entry[1] / (total || 1) * 100;
    return `${colors[index % colors.length]} ${start}% ${end}%`;
  });
  document.getElementById("donutChart").style.background = total ? `conic-gradient(${segments.join(",")})` : "#edf0ec";
  document.getElementById("categoryLegend").innerHTML = sorted.length ? sorted.map(([category, amount], index) =>
    `<div class="legend-item"><span class="legend-dot" style="background:${colors[index % colors.length]}"></span><span>${escapeHtml(category)}</span><strong>${Math.round(amount / total * 100)}%</strong></div>`
  ).join("") : '<span class="empty-legend">No spending this month yet.</span>';
}

function renderTrend() {
  const count = Number(document.getElementById("trendRange").value) || 6;
  const months = [];
  for (let offset = count - 1; offset >= 0; offset--) {
    const date = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthTransactions = state.transactions.filter(tx => tx.date.slice(0, 7) === key);
    months.push({
      key,
      label: new Intl.DateTimeFormat("en-IN", { month: "short" }).format(date),
      income: monthTransactions.filter(tx => tx.type === "income").reduce((sum, tx) => sum + Number(tx.amount), 0),
      expenses: monthTransactions.filter(tx => tx.type === "expense").reduce((sum, tx) => sum + Number(tx.amount), 0)
    });
  }
  const max = Math.max(1, ...months.flatMap(month => [month.income, month.expenses]));
  document.getElementById("trendChart").innerHTML = months.map(month => {
    const incomeHeight = month.income ? Math.max(3, month.income / max * 100) : 0;
    const expenseHeight = month.expenses ? Math.max(3, month.expenses / max * 100) : 0;
    const label = `${month.label}: income ${money(month.income)}, expenses ${money(month.expenses)}`;
    return `<div class="trend-month" role="group" aria-label="${escapeHtml(label)}"><div class="trend-bars"><i class="trend-bar income" title="Income: ${money(month.income)}" style="height:${incomeHeight}%"></i><i class="trend-bar expense" title="Expenses: ${money(month.expenses)}" style="height:${expenseHeight}%"></i></div><span class="trend-month-label">${escapeHtml(month.label)}</span></div>`;
  }).join("");
  document.getElementById("trendChart").setAttribute("aria-label", `Income and expenses for the last ${count} months`);
}

function renderBudgets() {
  const spent = {};
  state.transactions.filter(tx => tx.type === "expense" && isCurrentMonth(tx)).forEach(tx => {
    spent[tx.category] = (spent[tx.category] || 0) + Number(tx.amount);
  });
  const totalSpent = Object.values(spent).reduce((sum, amount) => sum + amount, 0);
  const overall = Number(state.overallBudget) || 0;
  document.getElementById("overallBudgetText").textContent = money(overall);
  document.getElementById("overallSpentText").textContent = `${money(totalSpent)} spent`;
  document.getElementById("overallRemaining").textContent = overall > totalSpent ? `${money(overall - totalSpent)} left` : `${money(totalSpent - overall)} over`;
  const overallProgress = document.getElementById("overallProgress");
  overallProgress.style.width = `${overall ? Math.min(100, totalSpent / overall * 100) : 0}%`;
  overallProgress.className = totalSpent > overall ? "over" : totalSpent / (overall || 1) >= .8 ? "warning" : "";
  const entries = Object.entries(state.budgets).filter(([, amount]) => Number(amount) > 0);
  document.getElementById("budgetList").innerHTML = entries.length ? entries.map(([category, budget]) => {
    const amount = spent[category] || 0;
    const ratio = amount / Number(budget);
    const status = ratio > 1 ? "over" : ratio >= .8 ? "warning" : "";
    return `<div class="budget-item"><div class="budget-item-top"><span>${escapeHtml(category)}</span><strong>${money(amount, true)} <span style="color:#a0a49e;font-weight:400">/ ${money(budget, true)}</span></strong></div><div class="progress-track"><span class="${status}" style="width:${Math.min(100, ratio * 100)}%"></span></div></div>`;
  }).join("") : '<span class="empty-legend">Add a category budget to get started.</span>';
  const note = document.getElementById("budgetNote");
  const overCount = entries.filter(([category, budget]) => (spent[category] || 0) > Number(budget)).length;
  const warningCount = entries.filter(([category, budget]) => (spent[category] || 0) / Number(budget) >= .8 && (spent[category] || 0) <= Number(budget)).length;
  note.innerHTML = overCount ? `<span>!</span><span>${overCount} ${overCount === 1 ? "category is" : "categories are"} over budget. Take a closer look.</span>` : warningCount ? `<span>!</span><span>${warningCount} ${warningCount === 1 ? "category is" : "categories are"} getting close to its budget.</span>` : "<span>✦</span><span>You’re doing great! You’re spending within your category budgets.</span>";
}

function renderTransactions() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const filter = document.getElementById("typeFilter").value;
  const rows = state.transactions.filter(tx => (filter === "all" || tx.type === filter) &&
    `${tx.name} ${tx.note} ${tx.category} ${tx.account}`.toLowerCase().includes(query))
    .sort((a, b) => b.date.localeCompare(a.date));
  const visibleRows = showAllTransactions ? rows : rows.slice(0, 7);
  document.getElementById("transactionRows").innerHTML = visibleRows.map(tx => {
    const iconClass = categoryClasses[tx.category] || "other";
    const sign = tx.type === "income" ? "+" : "−";
    return `<tr><td><div class="transaction-name"><span class="transaction-symbol ${iconClass}">${categoryIcons[tx.category] || "·"}</span><span><strong>${escapeHtml(tx.name || tx.category)}</strong><small>${escapeHtml(tx.note || tx.account)}</small></span></div></td><td><span class="category-pill">${escapeHtml(tx.category)}</span></td><td>${dateLabel(tx.date)}</td><td>${escapeHtml(tx.account || "Everyday account")}</td><td class="amount-value ${tx.type}">${sign}${money(tx.amount)}</td><td><button class="delete-transaction" data-delete="${escapeHtml(tx.id)}" title="Delete transaction" aria-label="Delete ${escapeHtml(tx.name)}">×</button></td></tr>`;
  }).join("");
  document.getElementById("emptyState").hidden = rows.length > 0;
  document.getElementById("transactionCount").textContent = rows.length ? `Showing ${visibleRows.length} of ${rows.length} transactions` : "0 transactions";
  document.getElementById("viewAllButton").hidden = rows.length <= 7;
  document.getElementById("viewAllButton").innerHTML = showAllTransactions ? 'Show less <span>↑</span>' : 'View all <span>→</span>';
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function openModal(id) {
  document.getElementById(id).hidden = false;
  const focusTarget = id === "transactionModal" ? document.getElementById("amountInput") : document.querySelector(`#${id} input`);
  setTimeout(() => focusTarget?.focus(), 0);
}

function closeModal(id) {
  document.getElementById(id).hidden = true;
}

function fillCategories() {
  const select = document.getElementById("categoryInput");
  select.innerHTML = categories.filter(category => category !== "Salary").map(category => `<option>${escapeHtml(category)}</option>`).join("");
  select.add(new Option("Salary", "Salary"));
}

function showBudgetEditor() {
  document.getElementById("overallBudgetInput").value = state.overallBudget;
  document.getElementById("budgetInputs").innerHTML = Object.entries(state.budgets).map(([category, value]) =>
    `<label class="field-label">${escapeHtml(category)}<div class="amount-input"><span>₹</span><input type="number" min="0" step="500" data-budget-category="${escapeHtml(category)}" value="${Number(value)}"></div></label>`
  ).join("");
  openModal("budgetModal");
}

function parseCsvLine(line) {
  const fields = [];
  let field = "", quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"' && quoted) { field += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { fields.push(field.trim()); field = ""; }
    else field += char;
  }
  fields.push(field.trim());
  return fields;
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) throw new Error("The CSV needs a header row and at least one transaction.");
  const headers = parseCsvLine(lines[0]);
  return { headers, rows: lines.slice(1).map(line => parseCsvLine(line)) };
}

function openImportPreview(file) {
  const reader = new FileReader();
  reader.onerror = () => showToast("Could not read that file. Please try another CSV.");
  reader.onload = () => {
    try {
      const parsed = parseCsv(String(reader.result));
      importHeaders = parsed.headers;
      importRows = parsed.rows;
      renderImportMapping();
      document.getElementById("uploadZone").hidden = true;
      document.getElementById("importPreview").hidden = false;
      renderImportSample();
    } catch (error) {
      showToast(error.message || "Could not read that CSV.");
    }
  };
  reader.readAsText(file);
}

function renderImportMapping() {
  const options = `<option value="">Skip column</option>${importHeaders.map((header, index) => `<option value="${index}">${escapeHtml(header)}</option>`).join("")}`;
  const fields = [["date", "Date"], ["amount", "Amount"], ["note", "Note"], ["type", "Type"], ["category", "Category"]];
  document.getElementById("importMapping").innerHTML = fields.map(([field, label]) => {
    const guess = importHeaders.findIndex(header => {
      const value = header.toLowerCase();
      return field === "date" ? /date|time/.test(value) : field === "amount" ? /amount|value|sum|total/.test(value) : field === "note" ? /note|description|merchant|name|memo/.test(value) : field === "type" ? /type|kind|direction/.test(value) : /category|type/.test(value);
    });
    const selected = field === "amount" && guess < 0 ? 0 : guess;
    return `<label class="field-label">${label}<select data-import-field="${field}">${options}</select></label>`;
  }).join("");
  document.querySelectorAll("[data-import-field]").forEach(select => {
    const field = select.dataset.importField;
    const guess = importHeaders.findIndex(header => {
      const value = header.toLowerCase();
      return field === "date" ? /date|time/.test(value) : field === "amount" ? /amount|value|sum|total/.test(value) : field === "note" ? /note|description|merchant|name|memo/.test(value) : field === "type" ? /type|kind|direction/.test(value) : /category|type/.test(value);
    });
    select.value = String(field === "amount" && guess < 0 ? 0 : guess);
  });
}

function importMappingValues() {
  return Object.fromEntries([...document.querySelectorAll("[data-import-field]")].map(select => [select.dataset.importField, select.value === "" ? -1 : Number(select.value)]));
}

function renderImportSample() {
  const mapping = importMappingValues();
  const header = ["Date", "Description", "Amount", "Category"];
  document.getElementById("previewHead").innerHTML = `<tr>${header.map(label => `<th>${label}</th>`).join("")}</tr>`;
  document.getElementById("previewBody").innerHTML = importRows.slice(0, 5).map(row => {
    const amount = mapping.amount < 0 ? "" : row[mapping.amount] || "";
    const note = mapping.note < 0 ? "" : row[mapping.note] || "";
    const date = mapping.date < 0 ? "" : row[mapping.date] || "";
    const category = mapping.category < 0 ? "" : row[mapping.category] || "";
    return `<tr><td>${escapeHtml(date)}</td><td>${escapeHtml(note)}</td><td>${escapeHtml(amount)}</td><td>${escapeHtml(category)}</td></tr>`;
  }).join("");
  document.getElementById("previewCount").textContent = `${importRows.length} rows found · Previewing the first ${Math.min(importRows.length, 5)}.`;
}

function normalizeDate(value) {
  const input = String(value || "").trim();
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(input)) return input.split("-").map((part, index) => index ? part.padStart(2, "0") : part).join("-");
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
}

function commitImport() {
  const mapping = importMappingValues();
  if (mapping.amount < 0 || mapping.date < 0) {
    showToast("Map both a date and amount column to continue.");
    return;
  }
  const toAdd = [];
  let skipped = 0;
  importRows.forEach(row => {
    const date = normalizeDate(row[mapping.date]);
    const amountText = String(row[mapping.amount] || "").replace(/[₹,\s]/g, "");
    const amount = Math.round(Math.abs(Number(amountText)) * 100) / 100;
    if (!date || !Number.isFinite(amount) || amount <= 0) { skipped++; return; }
    const note = mapping.note < 0 ? "" : String(row[mapping.note] || "");
    const rawType = mapping.type < 0 ? "" : String(row[mapping.type] || "").toLowerCase();
    const type = /income|credit|deposit|salary|^in$/.test(rawType) ? "income" : "expense";
    const category = mapping.category < 0 ? (type === "income" ? "Salary" : "Other") : (categories.includes(row[mapping.category]) ? row[mapping.category] : "Other");
    const duplicate = state.transactions.some(tx => tx.date === date && Number(tx.amount) === amount && String(tx.note || "").toLowerCase() === note.toLowerCase());
    if (duplicate) { skipped++; return; }
    toAdd.push({ id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, name: note || category, category, type, amount, date, account: "Everyday account", note });
  });
  state.transactions.push(...toAdd);
  saveState();
  render();
  closeModal("importModal");
  resetImport();
  showToast(`${toAdd.length} imported${skipped ? ` · ${skipped} skipped` : ""}.`);
}

function resetImport() {
  document.getElementById("csvFileInput").value = "";
  document.getElementById("uploadZone").hidden = false;
  document.getElementById("importPreview").hidden = true;
  importRows = [];
  importHeaders = [];
}

function exportCsv() {
  const rows = [["date", "type", "amount", "category", "account", "note"], ...state.transactions.map(tx => [tx.date, tx.type, tx.amount, tx.category, tx.account, tx.note])];
  const content = rows.map(row => row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  link.download = `pennywise-transactions-${currentMonth()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Your transactions are ready to export.");
}

document.getElementById("addTransactionButton").addEventListener("click", () => openModal("transactionModal"));
document.getElementById("transactionForm").addEventListener("submit", event => {
  event.preventDefault();
  const amount = Number(document.getElementById("amountInput").value);
  if (!Number.isFinite(amount) || amount <= 0) return showToast("Enter an amount greater than zero.");
  const type = document.querySelector('input[name="type"]:checked').value;
  const category = document.getElementById("categoryInput").value;
  const note = document.getElementById("noteInput").value.trim();
  state.transactions.push({
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    name: note || category, category, type, amount: Math.round(amount * 100) / 100,
    date: document.getElementById("dateInput").value,
    account: document.getElementById("accountInput").value, note
  });
  saveState();
  render();
  event.target.reset();
  document.getElementById("dateInput").value = localDateString(today);
  closeModal("transactionModal");
  showToast(`${type === "income" ? "Income" : "Expense"} added.`);
});
document.getElementById("searchInput").addEventListener("input", renderTransactions);
document.getElementById("typeFilter").addEventListener("change", renderTransactions);
document.getElementById("monthSelect").addEventListener("change", renderBreakdown);
document.getElementById("trendRange").addEventListener("change", renderTrend);
document.getElementById("transactionRows").addEventListener("click", event => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  state.transactions = state.transactions.filter(tx => tx.id !== button.dataset.delete);
  saveState();
  render();
  showToast("Transaction deleted.");
});
document.getElementById("clearFilters").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  document.getElementById("typeFilter").value = "all";
  renderTransactions();
});
document.getElementById("viewAllButton").addEventListener("click", () => {
  showAllTransactions = !showAllTransactions;
  renderTransactions();
  showToast(showAllTransactions ? "Showing all matching transactions." : "Showing recent transactions.");
});
document.getElementById("exportButton").addEventListener("click", exportCsv);
document.getElementById("importButton").addEventListener("click", () => { resetImport(); openModal("importModal"); });
document.getElementById("csvFileInput").addEventListener("change", event => {
  const file = event.target.files[0];
  if (file) openImportPreview(file);
});
document.getElementById("importMapping").addEventListener("change", renderImportSample);
document.getElementById("confirmImport").addEventListener("click", commitImport);
document.getElementById("editBudgetButton").addEventListener("click", showBudgetEditor);
document.getElementById("budgetForm").addEventListener("submit", event => {
  event.preventDefault();
  state.overallBudget = Number(document.getElementById("overallBudgetInput").value);
  document.querySelectorAll("[data-budget-category]").forEach(input => { state.budgets[input.dataset.budgetCategory] = Number(input.value); });
  saveState();
  render();
  closeModal("budgetModal");
  showToast("Your budgets have been updated.");
});
document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => closeModal(button.dataset.close)));
document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.addEventListener("click", event => {
  if (event.target === backdrop) closeModal(backdrop.id);
}));
document.addEventListener("keydown", event => {
  if (event.key === "Escape") document.querySelectorAll(".modal-backdrop:not([hidden])").forEach(modal => closeModal(modal.id));
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openModal("transactionModal");
  }
});
document.getElementById("menuToggle").addEventListener("click", () => document.getElementById("sidebar").classList.toggle("open"));
document.querySelectorAll(".nav-link").forEach(link => link.addEventListener("click", () => {
  document.querySelectorAll(".nav-link").forEach(item => item.classList.remove("active"));
  link.classList.add("active");
  document.getElementById("sidebar").classList.remove("open");
}));

fillCategories();
render();
