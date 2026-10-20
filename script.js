
"use strict";

// ========================================
// COOKIE EMPIRE — GAME SETTINGS
// ========================================

const SAVE_KEY = "cookieClickerModernSave_v1";
const SAVE_VERSION = 1;
const PRESTIGE_REQUIREMENT = 1_000_000;
const PRESTIGE_BONUS_PER_STAR = 0.10;
const REBIRTH_REQUIREMENT = 100_000;
const REBIRTH_BONUS = 0.05;

const BUILDINGS = [
  { id: "cursor", name: "Cursor", icon: "🖱️", description: "An extra hand to click for you.", baseCost: 15, cps: 0.1 },
  { id: "grandma", name: "Grandma", icon: "👵", description: "A loving grandma who bakes cookies.", baseCost: 100, cps: 1 },
  { id: "farm", name: "Cookie Farm", icon: "🌱", description: "Grow an entire field of cookie dough.", baseCost: 1100, cps: 8 },
  { id: "mine", name: "Cookie Mine", icon: "⛏️", description: "Mine delicious cookie deposits.", baseCost: 12000, cps: 47 },
  { id: "factory", name: "Factory", icon: "🏭", description: "Mass-produce cookies around the clock.", baseCost: 130000, cps: 260 },
  { id: "bank", name: "Cookie Bank", icon: "🏦", description: "Put your cookie empire to work.", baseCost: 1400000, cps: 1400 }
];

const ACHIEVEMENTS = [
  { id: "first", name: "First Crumb", icon: "🍪", description: "Bake your first cookie.", goal: 1 },
  { id: "hundred", name: "Getting Started", icon: "✨", description: "Bake 100 lifetime cookies.", goal: 100 },
  { id: "thousand", name: "Cookie Collector", icon: "🧺", description: "Bake 1,000 lifetime cookies.", goal: 1000 },
  { id: "tenThousand", name: "Cookie Enthusiast", icon: "💜", description: "Bake 10,000 lifetime cookies.", goal: 10000 },
  { id: "hundredThousand", name: "Cookie Tycoon", icon: "💰", description: "Bake 100,000 lifetime cookies.", goal: 100000 },
  { id: "million", name: "Millionaire Baker", icon: "👑", description: "Bake 1 million lifetime cookies.", goal: 1000000 },
  { id: "tenMillion", name: "Cookie Legend", icon: "🌟", description: "Bake 10 million lifetime cookies.", goal: 10000000 },
  { id: "builder", name: "Big Business", icon: "🏗️", description: "Own 25 buildings at once.", buildingGoal: 25 }
];

const $ = id => document.getElementById(id);

function initialState() {
  const buildings = {};
  BUILDINGS.forEach(b => buildings[b.id] = 0);

  return {
    cookies: 0,
    runEarned: 0,
    totalEarned: 0,
    totalClicks: 0,
    buildings,
    achievements: [],
    prestige: 0,
    rebirths: 0,
    redeemedCodes: [],
    settings: {
      clickEffects: true,
      music: false,
      reducedMotion: false
    }
  };
}

let state = initialState();
let lastTick = Date.now();
let lastRender = 0;
let lastSave = 0;
let toastTimeout;
let buyMode = 1;

const ui = {
  cookieCount: $("cookieCount"),
  clickPower: $("clickPower"),
  cps: $("cps"),
  shopList: $("shopList"),
  achievementCount: $("achievementCount"),
  achievementList: $("achievementList"),
  availableStars: $("availableStars"),
  prestigeBonus: $("prestigeBonus"),
  prestigeNote: $("prestigeNote"),
  prestigeButton: $("prestigeButton"),
  cookieButton: $("cookieButton"),
  floatingLayer: $("floatingLayer"),
  progressFill: $("progressFill"),
  achievementProgress: $("achievementProgress"),
  saveStatus: $("saveStatus"),
  toast: $("toast"),
  rebirthCount: $("rebirthCount"),
  rebirthBonus: $("rebirthBonus"),
  rebirthNote: $("rebirthNote"),
  rebirthButton: $("rebirthButton"),
  clickEffectsToggle: $("clickEffectsToggle"),
  musicToggle: $("musicToggle"),
  reducedMotionToggle: $("reducedMotionToggle")
};

// ========================================
// NUMBERS AND GAME CALCULATIONS
// ========================================

function formatNumber(n) {
  if (!Number.isFinite(n)) return "∞";

  if (n < 1000) {
    return n.toLocaleString("en-US", {
      maximumFractionDigits: n < 10 ? 1 : 0
    });
  }

  const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No"];
  const tier = Math.floor(Math.log10(n) / 3);

  if (tier >= suffixes.length) return n.toExponential(2);

  return (n / Math.pow(1000, tier)).toLocaleString("en-US", {
    maximumFractionDigits: 2
  }) + suffixes[tier];
}

// CPS-specific formatter: preserves useful decimal places.
function formatCps(n) {
  if (!Number.isFinite(n)) return "∞";

  if (n < 1000) {
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    });
  }

  return formatNumber(n);
}

function buildingCount() {
  return BUILDINGS.reduce((sum, b) => sum + state.buildings[b.id], 0);
}

function totalMultiplier() {
  return (1 + state.prestige * PRESTIGE_BONUS_PER_STAR) *
         (1 + state.rebirths * REBIRTH_BONUS);
}

function clickPower() {
  return totalMultiplier();
}

function cookiesPerSecond() {
  return BUILDINGS.reduce(
    (sum, b) => sum + state.buildings[b.id] * b.cps,
    0
  ) * totalMultiplier();
}

function buildingCost(building, owned = state.buildings[building.id]) {
  return Math.ceil(building.baseCost * Math.pow(1.15, owned));
}

function availableStars() {
  return Math.max(
    0,
    Math.floor(Math.sqrt(state.totalEarned / PRESTIGE_REQUIREMENT)) -
      state.prestige
  );
}

// ========================================
// NOTIFICATIONS AND CLICKING
// ========================================

function toast(message) {
  if (!ui.toast) return;

  ui.toast.textContent = message;
  ui.toast.classList.add("visible");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(
    () => ui.toast.classList.remove("visible"),
    2600
  );
}

function clickCookie(event) {
  const amount = clickPower();

  state.cookies += amount;
  state.runEarned += amount;
  state.totalEarned += amount;
  state.totalClicks++;

  if (state.settings.clickEffects) {
    showFloatingNumber(amount, event);
  }

  if (!state.settings.reducedMotion) {
    ui.cookieButton.classList.remove("clicked");
    void ui.cookieButton.offsetWidth;
    ui.cookieButton.classList.add("clicked");
  }

  checkAchievements();
  render();
}

function showFloatingNumber(amount, event) {
  const el = document.createElement("span");
  el.className = "float-number";
  el.textContent = "+" + formatNumber(amount);

  const rect = ui.floatingLayer.getBoundingClientRect();

  el.style.left =
    `${(event?.clientX || rect.left + rect.width / 2) - rect.left}px`;
  el.style.top =
    `${(event?.clientY || rect.top + rect.height / 2) - rect.top}px`;

  ui.floatingLayer.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

// ========================================
// SHOP AND BULK PURCHASES
// ========================================

function bulkCost(building) {
  const owned = state.buildings[building.id];
  let count = 0;
  let total = 0;
  let remaining = state.cookies;

  const limit = buyMode === "max" ? 10000 : buyMode;

  while (count < limit) {
    const cost = buildingCost(building, owned + count);

    if (remaining < cost) break;

    remaining -= cost;
    total += cost;
    count++;
  }

  return { count, total };
}

function buyBuilding(id) {
  const building = BUILDINGS.find(b => b.id === id);
  if (!building) return;

  // Recalculate the purchase at click time using current cookies.
  const purchase = bulkCost(building);

  if (purchase.count < 1 || purchase.total > state.cookies) {
    toast("You need more cookies!");
    renderShop();
    return;
  }

  state.cookies -= purchase.total;
  state.buildings[id] += purchase.count;

  checkAchievements();
  saveGame();

  // Immediately refresh the shop and all displayed stats.
  render();
  renderShop();

  toast(
    `${purchase.count} ${building.name}` +
    `${purchase.count > 1 ? "s" : ""} purchased!`
  );
}

function renderShop() {
  if (!ui.shopList) return;

  ui.shopList.innerHTML = "";

  BUILDINGS.forEach(building => {
    const owned = state.buildings[building.id];
    const purchase = bulkCost(building);
    const affordable = purchase.count > 0;

    const card = document.createElement("div");
    card.className = "shop-item" + (affordable ? " affordable" : "");

    const icon = document.createElement("div");
    icon.className = "building-icon";
    icon.textContent = building.icon;

    const info = document.createElement("div");
    info.className = "building-info";

    const name = document.createElement("div");
    name.className = "building-name";
    name.textContent = building.name;

    const description = document.createElement("div");
    description.className = "building-description";
    description.textContent =
      `${building.description} +${formatCps(building.cps)} cookies/sec`;

    const ownedLabel = document.createElement("div");
    ownedLabel.className = "building-owned";
    ownedLabel.textContent = `Owned: ${owned}`;

    info.append(name, description, ownedLabel);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "buy-button";
    button.disabled = !affordable;

    const label = document.createElement("strong");
    label.textContent = purchase.count > 0
      ? `BUY ${purchase.count}`
      : buyMode === "max"
        ? "BUY MAX"
        : `BUY ${buyMode}`;

    const price = document.createElement("span");
    price.textContent = purchase.count > 0
      ? `TOTAL: 🍪 ${formatNumber(purchase.total)}`
      : `Need 🍪 ${formatNumber(buildingCost(building))}`;

    button.append(label, price);
    button.addEventListener("click", () => buyBuilding(building.id));

    card.append(icon, info, button);
    ui.shopList.appendChild(card);
  });
}

// ========================================
// ACHIEVEMENTS
// ========================================

function hasAchievement(id) {
  return state.achievements.includes(id);
}

function checkAchievements() {
  let unlockedAny = false;

  ACHIEVEMENTS.forEach(a => {
    if (hasAchievement(a.id)) return;

    const unlocked = a.goal !== undefined
      ? state.totalEarned >= a.goal
      : buildingCount() >= a.buildingGoal;

    if (unlocked) {
      state.achievements.push(a.id);
      toast("Achievement unlocked: " + a.name);
      unlockedAny = true;
    }
  });

  if (unlockedAny) saveGame();
}

function renderAchievements() {
  if (!ui.achievementList) return;

  ui.achievementList.innerHTML = "";
  let unlockedCount = 0;

  ACHIEVEMENTS.forEach(a => {
    const unlocked = hasAchievement(a.id);
    if (unlocked) unlockedCount++;

    const card = document.createElement("div");
    card.className = "achievement-item" + (unlocked ? " unlocked" : "");

    const icon = document.createElement("div");
    icon.className = "achievement-icon";
    icon.textContent = a.icon;

    const info = document.createElement("div");
    info.className = "achievement-info";

    const name = document.createElement("div");
    name.className = "achievement-name";
    name.textContent = a.name;

    const desc = document.createElement("div");
    desc.className = "achievement-description";
    desc.textContent = a.description;

    info.append(name, desc);
    card.append(icon, info);

    if (unlocked) {
      const check = document.createElement("span");
      check.className = "achievement-check";
      check.textContent = "✓";
      card.appendChild(check);
    }

    ui.achievementList.appendChild(card);
  });

  if (ui.achievementCount) {
    ui.achievementCount.textContent =
      `${unlockedCount} / ${ACHIEVEMENTS.length}`;
  }
}

// ========================================
// PRESTIGE
// ========================================

function renderPrestige() {
  const available = availableStars();
  const nextTarget =
    Math.pow(state.prestige + 1, 2) * PRESTIGE_REQUIREMENT;

  if (ui.availableStars) {
    ui.availableStars.textContent = formatNumber(available);
  }

  if (ui.prestigeBonus) {
    ui.prestigeBonus.textContent =
      "+" + formatNumber(
        (state.prestige * PRESTIGE_BONUS_PER_STAR +
          state.rebirths * REBIRTH_BONUS) * 100
      ) + "%";
  }

  if (ui.prestigeButton) {
    ui.prestigeButton.disabled = available < 1;
  }

  if (ui.prestigeNote) {
    if (available > 0) {
      ui.prestigeNote.textContent =
        `Ascend now for ${formatNumber(available)} star(s). Cookies and buildings will reset.`;
    } else {
      ui.prestigeNote.textContent =
        `Bake ${formatNumber(Math.max(0, nextTarget - state.totalEarned))} more lifetime cookies to reach your next milestone.`;
    }
  }

  if (ui.prestigeButton) {
    ui.prestigeButton.textContent = available > 0
      ? `Ascend for ${formatNumber(available)} star(s)`
      : "Ascend to a new era";
  }

  renderRebirth();
}

function ascend() {
  const available = availableStars();

  if (available < 1) {
    return toast("You need more lifetime cookies to ascend.");
  }

  if (!confirm(
    `Ascend and earn ${available} prestige star(s)?\n\n` +
    "Your current cookies and buildings reset. Lifetime cookies, achievements, and rebirths remain."
  )) return;

  state.prestige += available;
  state.cookies = 0;
  state.runEarned = 0;
  BUILDINGS.forEach(b => state.buildings[b.id] = 0);

  lastTick = Date.now();
  render();
  saveGame();
  closePanels();
  toast("A new era begins! Your bakery is stronger.");
}

// ========================================
// REBIRTH
// ========================================

function renderRebirth() {
  if (ui.rebirthCount) {
    ui.rebirthCount.textContent = formatNumber(state.rebirths);
  }

  if (ui.rebirthBonus) {
    ui.rebirthBonus.textContent =
      "+" + formatNumber(state.rebirths * 5) + "%";
  }

  const ready = state.runEarned >= REBIRTH_REQUIREMENT;

  if (ui.rebirthButton) {
    ui.rebirthButton.disabled = !ready;
  }

  if (ui.rebirthNote) {
    ui.rebirthNote.textContent = ready
      ? "Ready! Rebirth resets current cookies and buildings."
      : `Earn ${formatNumber(REBIRTH_REQUIREMENT - state.runEarned)} more cookies this run to unlock rebirth.`;
  }
}

function doRebirth() {
  if (state.runEarned < REBIRTH_REQUIREMENT) {
    return toast("Earn 100,000 cookies this run to rebirth.");
  }

  if (!confirm(
    "Rebirth now? Your current cookies and buildings reset, " +
    "but lifetime cookies, achievements, prestige, and rebirth bonuses stay."
  )) return;

  state.rebirths++;
  state.cookies = 0;
  state.runEarned = 0;
  BUILDINGS.forEach(b => state.buildings[b.id] = 0);

  lastTick = Date.now();
  render();
  saveGame();
  closePanels();
  toast("Rebirth complete! Permanent production increased by 5%.");
}

// ========================================
// SETTINGS
// ========================================

function syncSettings() {
  if (ui.clickEffectsToggle) {
    ui.clickEffectsToggle.checked = state.settings.clickEffects;
  }

  if (ui.musicToggle) {
    ui.musicToggle.checked = state.settings.music;
  }

  if (ui.reducedMotionToggle) {
    ui.reducedMotionToggle.checked = state.settings.reducedMotion;
  }

  document.body.classList.toggle(
    "reduced-motion",
    state.settings.reducedMotion
  );
}

function applySettings() {
  if (ui.clickEffectsToggle) {
    state.settings.clickEffects = ui.clickEffectsToggle.checked;
  }

  if (ui.musicToggle) {
    state.settings.music = ui.musicToggle.checked;
  }

  if (ui.reducedMotionToggle) {
    state.settings.reducedMotion = ui.reducedMotionToggle.checked;
  }

  document.body.classList.toggle(
    "reduced-motion",
    state.settings.reducedMotion
  );

  saveGame();

  if (state.settings.music) {
    toast("Music setting enabled. Background audio needs an audio track to play.");
  }
}

// ========================================
// REDEEM CODES
// ========================================

function redeemCode(event) {
  event.preventDefault();

  const input = $("codeInput");
  const code = input.value.trim().toUpperCase();

  const rewards = {
    COOKIESTART: 1000,
    GOLDENCOOKIE: 10000
  };

  if (!code) return toast("Enter a code first.");

  if (!Object.hasOwn(rewards, code)) {
    return toast("That code isn't valid.");
  }

  if (state.redeemedCodes.includes(code)) {
    return toast("You've already redeemed that code.");
  }

  const reward = rewards[code];

  state.cookies += reward;
  state.runEarned += reward;
  state.totalEarned += reward;
  state.redeemedCodes.push(code);

  input.value = "";

  checkAchievements();
  render();
  saveGame();
  closePanels();

  toast(`Code redeemed! +${formatNumber(reward)} cookies.`);
}

// ========================================
// MENUS AND PANELS
// ========================================

function openPanel(id) {
  document.querySelectorAll(".modal").forEach(panel => {
    panel.hidden = panel.id !== id;
  });

  $("modalBackdrop").hidden = false;
  $("menuDropdown").hidden = true;
  $("menuButton").setAttribute("aria-expanded", "false");

  if (id === "rebirthModal") renderRebirth();
}

function closePanels() {
  $("modalBackdrop").hidden = true;
  $("shopDrawer").hidden = true;
  $("shopButton").setAttribute("aria-expanded", "false");
}

function toggleShop() {
  const drawer = $("shopDrawer");
  const opening = drawer.hidden;

  drawer.hidden = !opening;
  $("shopButton").setAttribute("aria-expanded", String(opening));

  if (opening) {
    $("menuDropdown").hidden = true;
    $("menuButton").setAttribute("aria-expanded", "false");
    renderShop();
  }
}

$("menuButton").addEventListener("click", () => {
  const dropdown = $("menuDropdown");

  dropdown.hidden = !dropdown.hidden;
  $("menuButton").setAttribute("aria-expanded", String(!dropdown.hidden));

  if (!dropdown.hidden) {
    $("shopDrawer").hidden = true;
    $("shopButton").setAttribute("aria-expanded", "false");
  }
});

document.querySelectorAll("[data-open-panel]").forEach(button => {
  button.addEventListener("click", () => {
    openPanel(button.dataset.openPanel);
  });
});

document.querySelectorAll("[data-close-modal], [data-close-panel]").forEach(button => {
  button.addEventListener("click", closePanels);
});

$("modalBackdrop").addEventListener("click", event => {
  if (event.target === $("modalBackdrop")) closePanels();
});

$("shopButton").addEventListener("click", toggleShop);

$("settingsDoneButton").addEventListener("click", () => {
  applySettings();
  closePanels();
});

[
  ui.clickEffectsToggle,
  ui.musicToggle,
  ui.reducedMotionToggle
].filter(Boolean).forEach(input => {
  input.addEventListener("change", applySettings);
});

$("rebirthButton").addEventListener("click", doRebirth);
$("codeForm").addEventListener("submit", redeemCode);

document.querySelectorAll("[data-buy-mode]").forEach(button => {
  button.addEventListener("click", () => {
    const value = button.dataset.buyMode;
    buyMode = value === "max" ? "max" : Number(value);

    document.querySelectorAll("[data-buy-mode]").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    renderShop();
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closePanels();
});

// ========================================
// SAVE AND LOAD
// ========================================

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      version: SAVE_VERSION,
      savedAt: Date.now(),
      state
    }));

    lastSave = Date.now();

    if (ui.saveStatus) {
      ui.saveStatus.textContent = "● Saved";
      ui.saveStatus.style.color = "var(--green)";
    }
  } catch (error) {
    console.error("Save failed:", error);
    toast("Could not save your game. Check browser storage settings.");
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;

    const data = JSON.parse(raw);
    if (!data?.state) return;

    const loaded = data.state;
    const fresh = initialState();

    state = {
      ...fresh,
      cookies: validNumber(loaded.cookies),
      runEarned: validNumber(loaded.runEarned),
      totalEarned: validNumber(loaded.totalEarned),
      totalClicks: validNumber(loaded.totalClicks),
      prestige: Math.floor(validNumber(loaded.prestige)),
      rebirths: Math.floor(validNumber(loaded.rebirths)),
      buildings: { ...fresh.buildings },

      achievements: Array.isArray(loaded.achievements)
        ? loaded.achievements.filter(id =>
            ACHIEVEMENTS.some(a => a.id === id)
          )
        : [],

      redeemedCodes: Array.isArray(loaded.redeemedCodes)
        ? loaded.redeemedCodes.filter(code => typeof code === "string")
        : [],

      settings: {
        clickEffects: loaded.settings?.clickEffects !== false,
        music: loaded.settings?.music === true,
        reducedMotion: loaded.settings?.reducedMotion === true
      }
    };

    BUILDINGS.forEach(b => {
      state.buildings[b.id] = Math.floor(
        validNumber(loaded.buildings?.[b.id])
      );
    });

    checkAchievements();

    // Offline production is capped at eight hours.
    if (typeof data.savedAt === "number") {
      const seconds = Math.min(
        Math.max(0, (Date.now() - data.savedAt) / 1000),
        8 * 60 * 60
      );

      const offline = cookiesPerSecond() * seconds;

      if (offline > 0 && Number.isFinite(offline)) {
        state.cookies += offline;
        state.runEarned += offline;
        state.totalEarned += offline;

        toast(
          `Welcome back! You earned ${formatNumber(offline)} cookies offline.`
        );
      }
    }
  } catch (error) {
    console.error("Could not load game:", error);
    state = initialState();
  }
}

function validNumber(value) {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
      ? value
      : 0;
}

// ========================================
// RESET GAME
// ========================================

function resetGame() {
  if (!confirm(
    "Reset your entire game?\n\nThis deletes cookies, buildings, achievements, prestige, and rebirths. This cannot be undone."
  )) return;

  state = initialState();

  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (error) {
    console.error("Could not clear save:", error);
  }

  lastTick = Date.now();
  render();
  saveGame();
  toast("Fresh bakery! Let's start clicking.");
}

// ========================================
// RENDER THE GAME
// ========================================

function render() {
  if (ui.cookieCount) {
    ui.cookieCount.textContent = formatNumber(state.cookies);
  }

  if (ui.clickPower) {
    ui.clickPower.textContent = formatNumber(clickPower());
  }

  if (ui.cps) {
    ui.cps.textContent = formatCps(cookiesPerSecond());
  }

  const next = ACHIEVEMENTS.find(a =>
    a.goal !== undefined && !hasAchievement(a.id)
  );

  if (next) {
    const previous = Math.max(
      0,
      ...ACHIEVEMENTS
        .filter(a => a.goal !== undefined && a.goal < next.goal)
        .map(a => a.goal)
    );

    const progress = Math.min(
      100,
      Math.max(
        0,
        ((state.totalEarned - previous) / (next.goal - previous)) * 100
      )
    );

    if (ui.progressFill) {
      ui.progressFill.style.width = progress + "%";
    }

    if (ui.achievementProgress) {
      ui.achievementProgress.textContent =
        `${formatNumber(state.totalEarned)} / ${formatNumber(next.goal)} cookies`;
    }
  } else {
    if (ui.progressFill) ui.progressFill.style.width = "100%";

    if (ui.achievementProgress) {
      ui.achievementProgress.textContent =
        "All cookie milestones reached!";
    }
  }

  renderShop();
  renderAchievements();
  renderPrestige();
}

// ========================================
// GAME LOOP AND STARTUP
// ========================================

function gameLoop() {
  const now = Date.now();
  const elapsed = Math.min((now - lastTick) / 1000, 1);

  lastTick = now;

  const produced = cookiesPerSecond() * elapsed;

  if (produced > 0 && Number.isFinite(produced)) {
    state.cookies += produced;
    state.runEarned += produced;
    state.totalEarned += produced;
    checkAchievements();
  }

  if (now - lastRender >= 200) {
    render();
    lastRender = now;
  }

  if (now - lastSave >= 5000) {
    saveGame();
  }
}

ui.cookieButton.addEventListener("click", clickCookie);
ui.prestigeButton.addEventListener("click", ascend);
$("saveButton").addEventListener("click", saveGame);
$("resetButton").addEventListener("click", resetGame);

loadGame();
syncSettings();
render();

lastTick = Date.now();

setInterval(gameLoop, 100);
window.addEventListener("beforeunload", saveGame);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    saveGame();
  } else {
    lastTick = Date.now();
    render();
  }
});
