
"use strict";

// ==========================================
// COOKIE CLICKER - GAME SETTINGS
// ==========================================

const SAVE_KEY = "cookieClickerModernSave_v1";
const SAVE_VERSION = 1;
const PRESTIGE_REQUIREMENT = 1_000_000;
const PRESTIGE_BONUS_PER_STAR = 0.10;

const BUILDINGS = [
  {
    id: "cursor",
    name: "Cursor",
    icon: "🖱️",
    description: "An extra hand to click for you.",
    baseCost: 15,
    cps: 0.1
  },
  {
    id: "grandma",
    name: "Grandma",
    icon: "👵",
    description: "A loving grandma who bakes cookies.",
    baseCost: 100,
    cps: 1
  },
  {
    id: "farm",
    name: "Cookie Farm",
    icon: "🌱",
    description: "Grow an entire field of cookie dough.",
    baseCost: 1100,
    cps: 8
  },
  {
    id: "mine",
    name: "Cookie Mine",
    icon: "⛏️",
    description: "Mine delicious cookie deposits.",
    baseCost: 12000,
    cps: 47
  },
  {
    id: "factory",
    name: "Factory",
    icon: "🏭",
    description: "Mass-produce cookies around the clock.",
    baseCost: 130000,
    cps: 260
  },
  {
    id: "bank",
    name: "Cookie Bank",
    icon: "🏦",
    description: "Put your cookie empire to work.",
    baseCost: 1_400_000,
    cps: 1400
  }
];

const ACHIEVEMENTS = [
  {
    id: "first",
    name: "First Crumb",
    icon: "🍪",
    description: "Bake your first cookie.",
    goal: 1
  },
  {
    id: "hundred",
    name: "Getting Started",
    icon: "✨",
    description: "Bake 100 lifetime cookies.",
    goal: 100
  },
  {
    id: "thousand",
    name: "Cookie Collector",
    icon: "🧺",
    description: "Bake 1,000 lifetime cookies.",
    goal: 1000
  },
  {
    id: "tenThousand",
    name: "Cookie Enthusiast",
    icon: "💜",
    description: "Bake 10,000 lifetime cookies.",
    goal: 10000
  },
  {
    id: "hundredThousand",
    name: "Cookie Tycoon",
    icon: "💰",
    description: "Bake 100,000 lifetime cookies.",
    goal: 100000
  },
  {
    id: "million",
    name: "Millionaire Baker",
    icon: "👑",
    description: "Bake 1 million lifetime cookies.",
    goal: 1000000
  },
  {
    id: "tenMillion",
    name: "Cookie Legend",
    icon: "🌟",
    description: "Bake 10 million lifetime cookies.",
    goal: 10000000
  },
  {
    id: "builder",
    name: "Big Business",
    icon: "🏗️",
    description: "Own 25 buildings at once.",
    buildingGoal: 25
  }
];

// ==========================================
// GAME STATE
// ==========================================

function createInitialState() {
  const buildings = {};

  for (const building of BUILDINGS) {
    buildings[building.id] = 0;
  }

  return {
    cookies: 0,
    runEarned: 0,
    totalEarned: 0,
    totalClicks: 0,
    buildings,
    achievements: [],
    prestige: 0
  };
}

let state = createInitialState();
let lastTick = Date.now();
let lastRender = 0;
let lastSave = 0;
let toastTimeout = null;

// ==========================================
// DOM HELPERS
// ==========================================

const $ = (id) => document.getElementById(id);

const ui = {
  cookieCount: $("cookieCount"),
  clickPower: $("clickPower"),
  cps: $("cps"),
  buildingCount: $("buildingCount"),
  lifetimeCookies: $("lifetimeCookies"),
  prestigeLevel: $("prestigeLevel"),
  shopCount: $("shopCount"),
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
  toast: $("toast")
};

// ==========================================
// NUMBER FORMATTING
// ==========================================

function formatNumber(number) {
  if (!Number.isFinite(number)) return "∞";

  if (number < 1000) {
    return number.toLocaleString("en-US", {
      maximumFractionDigits: number < 10 ? 1 : 0
    });
  }

  const suffixes = [
    "", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No"
  ];

  const tier = Math.floor(Math.log10(number) / 3);

  if (tier >= suffixes.length) {
    return number.toExponential(2);
  }

  const scaled = number / Math.pow(1000, tier);

  return scaled.toLocaleString("en-US", {
    maximumFractionDigits: 2
  }) + suffixes[tier];
}

function formatPrice(number) {
  return formatNumber(Math.ceil(number));
}

// ==========================================
// GAME CALCULATIONS
// ==========================================

function getBuildingCount() {
  return BUILDINGS.reduce(
    (sum, building) => sum + state.buildings[building.id],
    0
  );
}

function getClickPower() {
  return 1 * (1 + state.prestige * PRESTIGE_BONUS_PER_STAR);
}

function getBaseCps() {
  return BUILDINGS.reduce(
    (sum, building) =>
      sum + state.buildings[building.id] * building.cps,
    0
  );
}

function getCps() {
  return getBaseCps() * (
    1 + state.prestige * PRESTIGE_BONUS_PER_STAR
  );
}

function getBuildingCost(building) {
  const owned = state.buildings[building.id];
  return Math.ceil(building.baseCost * Math.pow(1.15, owned));
}

function getPotentialPrestige() {
  return Math.floor(
    Math.sqrt(state.totalEarned / PRESTIGE_REQUIREMENT)
  );
}

function getAvailableStars() {
  return Math.max(0, getPotentialPrestige() - state.prestige);
}

// ==========================================
// NOTIFICATIONS
// ==========================================

function showToast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.add("visible");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    ui.toast.classList.remove("visible");
  }, 2600);
}

function setSaveStatus(message, color) {
  ui.saveStatus.textContent = "● " + message;
  ui.saveStatus.style.color = color;
}

// ==========================================
// CLICKING THE COOKIE
// ==========================================

function clickCookie(event) {
  const amount = getClickPower();

  state.cookies += amount;
  state.runEarned += amount;
  state.totalEarned += amount;
  state.totalClicks++;

  showFloatingNumber(amount, event);
  ui.cookieButton.classList.remove("clicked");

  // Restart the animation when the cookie is clicked.
  void ui.cookieButton.offsetWidth;
  ui.cookieButton.classList.add("clicked");

  checkAchievements();
  render();
}

function showFloatingNumber(amount, event) {
  const floating = document.createElement("span");
  floating.className = "float-number";
  floating.textContent = "+" + formatNumber(amount);

  const layerRect = ui.floatingLayer.getBoundingClientRect();

  let x;
  let y;

  if (
    event &&
    Number.isFinite(event.clientX) &&
    event.clientX !== 0
  ) {
    x = event.clientX - layerRect.left;
    y = event.clientY - layerRect.top;
  } else {
    x = layerRect.width / 2;
    y = layerRect.height / 2;
  }

  floating.style.left = `${x}px`;
  floating.style.top = `${y}px`;

  ui.floatingLayer.appendChild(floating);

  setTimeout(() => floating.remove(), 950);
}

// ==========================================
// BUYING BUILDINGS
// ==========================================

function buyBuilding(id) {
  const building = BUILDINGS.find((item) => item.id === id);

  if (!building) return;

  const cost = getBuildingCost(building);

  if (state.cookies < cost) {
    showToast("You need more cookies!");
    return;
  }

  state.cookies -= cost;
  state.buildings[id]++;

  showToast(`${building.name} purchased!`);

  checkAchievements();
  render();
  saveGame();
}

function renderShop() {
  ui.shopList.innerHTML = "";

  for (const building of BUILDINGS) {
    const owned = state.buildings[building.id];
    const cost = getBuildingCost(building);
    const affordable = state.cookies >= cost;

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
      `${building.description} +${formatNumber(building.cps)} cookies/sec`;

    const ownedLabel = document.createElement("div");
    ownedLabel.className = "building-owned";
    ownedLabel.textContent = `Owned: ${owned}`;

    info.append(name, description, ownedLabel);

    const buyButton = document.createElement("button");
    buyButton.className = "buy-button";
    buyButton.disabled = !affordable;
    buyButton.type = "button";
    buyButton.setAttribute(
      "aria-label",
      `Buy ${building.name} for ${formatPrice(cost)} cookies`
    );

    const buyLabel = document.createElement("strong");
    buyLabel.textContent = "BUY";

    const priceLabel = document.createElement("span");
    priceLabel.textContent = "🍪 " + formatPrice(cost);

    buyButton.append(buyLabel, priceLabel);
    buyButton.addEventListener("click", () => buyBuilding(building.id));

    card.append(icon, info, buyButton);
    ui.shopList.appendChild(card);
  }
}

// ==========================================
// ACHIEVEMENTS
// ==========================================

function hasAchievement(id) {
  return state.achievements.includes(id);
}

function checkAchievements() {
  let unlockedAny = false;

  for (const achievement of ACHIEVEMENTS) {
    if (hasAchievement(achievement.id)) continue;

    let unlocked = false;

    if (achievement.goal !== undefined) {
      unlocked = state.totalEarned >= achievement.goal;
    }

    if (achievement.buildingGoal !== undefined) {
      unlocked = getBuildingCount() >= achievement.buildingGoal;
    }

    if (unlocked) {
      state.achievements.push(achievement.id);
      showToast("Achievement unlocked: " + achievement.name);
      unlockedAny = true;
    }
  }

  if (unlockedAny) saveGame();
}

function renderAchievements() {
  ui.achievementList.innerHTML = "";

  let unlockedCount = 0;

  for (const achievement of ACHIEVEMENTS) {
    const unlocked = hasAchievement(achievement.id);

    if (unlocked) unlockedCount++;

    const card = document.createElement("div");
    card.className =
      "achievement-item" + (unlocked ? " unlocked" : "");

    const icon = document.createElement("div");
    icon.className = "achievement-icon";
    icon.textContent = achievement.icon;

    const info = document.createElement("div");
    info.className = "achievement-info";

    const name = document.createElement("div");
    name.className = "achievement-name";
    name.textContent = achievement.name;

    const description = document.createElement("div");
    description.className = "achievement-description";
    description.textContent = achievement.description;

    info.append(name, description);
    card.append(icon, info);

    if (unlocked) {
      const check = document.createElement("span");
      check.className = "achievement-check";
      check.textContent = "✓";
      check.setAttribute("aria-label", "Unlocked");
      card.appendChild(check);
    }

    ui.achievementList.appendChild(card);
  }

  ui.achievementCount.textContent =
    `${unlockedCount} / ${ACHIEVEMENTS.length}`;
}

// ==========================================
// PRESTIGE / ASCENSION
// ==========================================

function renderPrestige() {
  const available = getAvailableStars();
  const bonus = state.prestige * PRESTIGE_BONUS_PER_STAR * 100;
  const nextTarget =
    Math.pow(state.prestige + 1, 2) * PRESTIGE_REQUIREMENT;

  ui.availableStars.textContent = formatNumber(available);
  ui.prestigeLevel.textContent = formatNumber(state.prestige);
  ui.prestigeBonus.textContent = "+" + formatNumber(bonus) + "%";

  ui.prestigeButton.disabled = available < 1;

  if (available > 0) {
    ui.prestigeNote.textContent =
      `Ascend now for ${formatNumber(available)} star(s). ` +
      "Your current cookies and buildings will be reset.";
    ui.prestigeButton.textContent =
      `Ascend for ${formatNumber(available)} star(s)`;
  } else {
    const remaining = Math.max(0, nextTarget - state.totalEarned);

    ui.prestigeNote.textContent =
      `Bake ${formatNumber(remaining)} more lifetime cookies ` +
      "to reach your next prestige milestone.";
    ui.prestigeButton.textContent = "Ascend to a new era";
  }
}

function ascend() {
  const available = getAvailableStars();

  if (available < 1) {
    showToast("You need more lifetime cookies to ascend.");
    return;
  }

  const confirmed = window.confirm(
    `Ascend and earn ${available} prestige star(s)?\n\n` +
    "Your current cookies and buildings will be reset. " +
    "Lifetime cookies, achievements, and existing prestige bonuses remain."
  );

  if (!confirmed) return;

  state.prestige += available;
  state.cookies = 0;
  state.runEarned = 0;
  state.buildings = {};

  for (const building of BUILDINGS) {
    state.buildings[building.id] = 0;
  }

  // Lifetime cookies and achievements intentionally persist.
  lastTick = Date.now();

  checkAchievements();
  render();
  saveGame();

  showToast("A new era begins! Your bakery is stronger.");
}

// ==========================================
// SAVING AND LOADING
// ==========================================

function saveGame() {
  try {
    const saveData = {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      state
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    lastSave = Date.now();
    setSaveStatus("Saved", "var(--green)");
  } catch (error) {
    console.error("Could not save game:", error);
    setSaveStatus("Save failed", "var(--red)");
    showToast("Could not save. Check your browser storage settings.");
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);

    if (!raw) return;

    const saveData = JSON.parse(raw);

    if (
      !saveData ||
      saveData.version !== SAVE_VERSION ||
      !saveData.state
    ) {
      showToast("Save file not recognized. Starting a new game.");
      return;
    }

    const loaded = saveData.state;
    const initial = createInitialState();

    // Validate numeric values before accepting a save.
    const numericFields = [
      "cookies",
      "runEarned",
      "totalEarned",
      "totalClicks",
      "prestige"
    ];

    for (const key of numericFields) {
      if (
        typeof loaded[key] !== "number" ||
        !Number.isFinite(loaded[key]) ||
        loaded[key] < 0
      ) {
        showToast("Save data was invalid. Starting a new game.");
        return;
      }
    }

    state = {
      ...initial,
      cookies: loaded.cookies,
      runEarned: loaded.runEarned,
      totalEarned: loaded.totalEarned,
      totalClicks: loaded.totalClicks,
      prestige: Math.floor(loaded.prestige),
      buildings: { ...initial.buildings },
      achievements: Array.isArray(loaded.achievements)
        ? loaded.achievements.filter((id) =>
            ACHIEVEMENTS.some((a) => a.id === id)
          )
        : []
    };

    for (const building of BUILDINGS) {
      const count = loaded.buildings?.[building.id];

      if (
        typeof count === "number" &&
        Number.isFinite(count) &&
        count >= 0
      ) {
        state.buildings[building.id] = Math.floor(count);
      }
    }

    // Repair achievements in case a save happened before an unlock.
    checkAchievements();

    // Offline production: up to 8 hours while the page was closed.
    if (typeof saveData.savedAt === "number") {
      const elapsedSeconds = Math.min(
        Math.max(0, (Date.now() - saveData.savedAt) / 1000),
        8 * 60 * 60
      );

      const offlineCookies = getCps() * elapsedSeconds;

      if (offlineCookies > 0 && Number.isFinite(offlineCookies)) {
        state.cookies += offlineCookies;
        state.runEarned += offlineCookies;
        state.totalEarned += offlineCookies;

        showToast(
          `Welcome back! You earned ${formatNumber(offlineCookies)} cookies offline.`
        );
      }
    }
  } catch (error) {
    console.error("Could not load game:", error);
    showToast("Could not load your save. Starting a new game.");
    state = createInitialState();
  }
}

// ==========================================
// MAIN DISPLAY
// ==========================================

function render() {
  ui.cookieCount.textContent = formatNumber(state.cookies);
  ui.clickPower.textContent = formatNumber(getClickPower());
  ui.cps.textContent = formatNumber(getCps());
  ui.buildingCount.textContent = formatNumber(getBuildingCount());
  ui.lifetimeCookies.textContent = formatNumber(state.totalEarned);
  ui.shopCount.textContent = `${BUILDINGS.length} items`;

  const nextGoal = ACHIEVEMENTS.find((achievement) =>
    achievement.goal !== undefined &&
    !hasAchievement(achievement.id)
  );

  if (nextGoal) {
    const previousGoal = [...ACHIEVEMENTS]
      .filter((achievement) =>
        achievement.goal !== undefined &&
        achievement.goal < nextGoal.goal
      )
      .reduce((max, achievement) => Math.max(max, achievement.goal), 0);

    const progress = Math.min(
      100,
      Math.max(
        0,
        ((state.totalEarned - previousGoal) /
          (nextGoal.goal - previousGoal)) * 100
      )
    );

    ui.progressFill.style.width = progress + "%";
    ui.achievementProgress.textContent =
      `${formatNumber(state.totalEarned)} / ${formatNumber(nextGoal.goal)} cookies`;
  } else {
    ui.progressFill.style.width = "100%";
    ui.achievementProgress.textContent = "All cookie milestones reached!";
  }

  renderShop();
  renderAchievements();
  renderPrestige();
}

// ==========================================
// GAME LOOP
// ==========================================

function gameLoop() {
  const now = Date.now();
  const elapsed = Math.min((now - lastTick) / 1000, 1);
  lastTick = now;

  const produced = getCps() * elapsed;

  if (produced > 0 && Number.isFinite(produced)) {
    state.cookies += produced;
    state.runEarned += produced;
    state.totalEarned += produced;
    checkAchievements();
  }

  // Refresh the interface a few times per second.
  if (now - lastRender >= 200) {
    render();
    lastRender = now;
  }

  // Periodic autosave.
  if (now - lastSave >= 5000) {
    saveGame();
  }
}

// ==========================================
// RESETTING THE GAME
// ==========================================

function resetGame() {
  const confirmed = window.confirm(
    "Reset your entire game?\n\n" +
    "This deletes your cookies, buildings, achievements, and prestige. " +
    "This cannot be undone."
  );

  if (!confirmed) return;

  state = createInitialState();
  lastTick = Date.now();

  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (error) {
    console.error("Could not clear save:", error);
  }

  render();
  saveGame();
  showToast("Fresh bakery! Let's start clicking.");
}

// ==========================================
// START THE GAME
// ==========================================

ui.cookieButton.addEventListener("click", clickCookie);
ui.prestigeButton.addEventListener("click", ascend);
$("saveButton").addEventListener("click", saveGame);
$("resetButton").addEventListener("click", resetGame);

loadGame();
render();
lastTick = Date.now();

setInterval(gameLoop, 100);
window.addEventListener("beforeunload", saveGame);

// Save when the player returns to the tab.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    saveGame();
  } else {
    lastTick = Date.now();
    render();
  }
});
