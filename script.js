// script.js - loads skins.json, builds UI, and runs slot-machine spin
document.addEventListener("DOMContentLoaded", () => {

  const SKINS_JSON = "skins.json";       // path to skins list
  const IMAGES_PATH = "";                // if you keep images in images/ (already in JSON)
  const CASE_GRID = document.getElementById("case-grid");
  const MODAL = document.getElementById("modal");
  const REEL = document.getElementById("reel");
  const SPIN_BTN = document.getElementById("spinBtn");
  const STOP_BTN = document.getElementById("stopBtn");
  const CLOSE_BTN = document.getElementById("closeBtn");
  const RESULT_TEXT = document.getElementById("resultText");

  let skins = [];        // loaded from JSON
  let currentCase = null; // case meta (we will use just simple cases)
  let isSpinning = false;
  let animationId = null;

  // --- 1) load skins.json ---
  async function loadSkins() {
    try {
      const res = await fetch(SKINS_JSON, {cache: "no-store"});
      if (!res.ok) throw new Error("Failed to load skins.json");
      skins = await res.json();
      if (!Array.isArray(skins) || skins.length === 0) {
        throw new Error("skins.json is empty or invalid");
      }
      buildCaseGrid();
    } catch (err) {
      console.error(err);
      CASE_GRID.innerHTML = "<div style='color:#f66'>Failed to load skins.json — check console</div>";
    }
  }

  // --- 2) build some example "cases" (you can make real case definitions later) ---
  function buildCaseGrid() {
    // For simplicity, create two example cases: "Basic Case" and "Premium Case"
    const cases = [
      { id: "basic", name: "Basic Case", price: 1, allowedRarities: null },
      { id: "premium", name: "Premium Case", price: 5, allowedRarities: null }
    ];

    CASE_GRID.innerHTML = "";
    cases.forEach(c => {
      const card = document.createElement("div");
      card.className = "case-card";
      card.innerHTML = `
        <img src="images/case1.png" alt="${c.name}">
        <h3>${c.name}</h3>
        <div style="margin-bottom:8px;color:var(--gold-dim)">Price: ${c.price} coins</div>
        <button class="btn open" data-case="${c.id}">Open</button>
      `;
      CASE_GRID.appendChild(card);
    });

    // attach click handlers
    document.querySelectorAll(".case-card .open").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const caseId = e.currentTarget.dataset.case;
        openCase(caseId);
      });
    });
  }

  // --- 3) openCase: show modal and prepare reel ---
  function openCase(caseId) {
    currentCase = caseId;
    RESULT_TEXT.textContent = "";
    prepareReel();
    MODAL.classList.add("open");
    SPIN_BTN.disabled = false;
    STOP_BTN.disabled = true;
  }

  // --- prepareReel: fill the reel with random picks and reserve final item later ---
  function prepareReel() {
    REEL.style.transition = "none";
    REEL.style.transform = "translateX(0)";
    REEL.innerHTML = "";

    // To create a long-looking reel, we append many random items.
    // We'll create an array of N items, then later place the winning skin near the end.
    const VISIBLE_COUNT = 7;      // how many items fit in view (approx)
    const REPEAT = 40;            // number of items to generate (adjust for length)
    const items = [];

    // Randomly pick items for the reel
    for (let i = 0; i < REPEAT; i++) {
      const s = skins[Math.floor(Math.random() * skins.length)];
      items.push(s);
    }

    // Convert to DOM
    items.forEach(it => {
      const div = document.createElement("div");
      div.className = "reel-item";
      div.innerHTML = `
        <img loading="lazy" src="${it.image}" alt="${escapeHtml(it.name)}" onerror="this.style.opacity=.2">
        <div class="name">${escapeHtml(it.name)}</div>
        <div class="rarity">${escapeHtml(it.rarity)}</div>
      `;
      REEL.appendChild(div);
    });

    // ensure there's enough width; each item has fixed width in CSS (160px + gap)
    // after DOM is ready, we can compute sizes when spinning.
  }

  // --- spin logic: chooses a winning skin, builds a new extended reel so we can animate to it ---
  function spin() {
    if (isSpinning) return;
    isSpinning = true;
    RESULT_TEXT.textContent = "Spinning...";
    SPIN_BTN.disabled = true;
    STOP_BTN.disabled = false;

    // choose winning skin
    const winner = skins[Math.floor(Math.random() * skins.length)];

    // Build a new reel sequence that ends with the winner in the center marker
    // We'll recreate the reel with random items and append the winner near the end.
    const ITEM_WIDTH = getComputedItemWidth(); // px (includes gap approximately)
    const visibleWidth = document.getElementById("slotWindow").clientWidth;
    const centerOffset = Math.floor(visibleWidth / 2 - ITEM_WIDTH / 2);

    // Build new list
    const totalItems = 70; // longer ensures nice animation for many skins
    const newItems = [];
    for (let i = 0; i < totalItems - 1; i++) {
      newItems.push(skins[Math.floor(Math.random() * skins.length)]);
    }
    // push the winner as last item
    newItems.push(winner);

    // Render new items
    REEL.innerHTML = "";
    newItems.forEach(it => {
      const div = document.createElement("div");
      div.className = "reel-item";
      div.innerHTML = `
        <img loading="lazy" src="${it.image}" alt="${escapeHtml(it.name)}" onerror="this.style.opacity=.2;">
        <div class="name">${escapeHtml(it.name)}</div>
        <div class="rarity">${escapeHtml(it.rarity)}</div>
      `;
      REEL.appendChild(div);
    });

    // compute distance to translate so that the winner ends centered under center-marker
    // index of winner = newItems.length - 1
    const winnerIndex = newItems.length - 1;
    // transformX = - (winnerIndex * ITEM_WIDTH) + centerOffset
    const targetX = - (winnerIndex * ITEM_WIDTH) + centerOffset;

    // set transition for smooth decelerating effect
    // We'll set duration based on distance
    const distance = Math.abs(targetX);
    const baseDuration = 2200; // ms minimum
    const extra = Math.min(3000, distance * 0.4); // scale with distance but cap
    const duration = baseDuration + extra;

    // force reflow then apply transition
    REEL.style.transition = `transform ${duration}ms cubic-bezier(.18,.98,.3,.99)`;
    // small timeout to ensure the browser registers the starting point
    requestAnimationFrame(() => {
      REEL.style.transform = `translateX(${targetX}px)`;
    });

    // after animation ends
    setTimeout(() => {
      isSpinning = false;
      STOP_BTN.disabled = true;
      SPIN_BTN.disabled = false;
      RESULT_TEXT.textContent = `You won: ${winner.name} (${winner.rarity}) — value: ${winner.value}`;
      // highlight winner visually
      highlightWinner(winnerIndex);
    }, duration + 60);
  }

  // optional stop early (not required but included)
  function stopEarly() {
    if (!isSpinning) return;
    // simply speed up to end: reduce transition duration and jump to final transform
    REEL.style.transitionDuration = "700ms";
    REEL.style.transitionTimingFunction = "cubic-bezier(.18,.98,.3,.99)";
    // find the current target transform (already set), no extra work here
    // disable stop button now to avoid multiple clicks
    STOP_BTN.disabled = true;
  }

  function closeModal() {
    if (isSpinning) return; // prevent closing while spinning
    MODAL.classList.remove("open");
    REEL.innerHTML = "";
    RESULT_TEXT.textContent = "";
  }

  // compute item width (approx) based on first child or CSS fallback 160 + gap 12
  function getComputedItemWidth() {
    const first = REEL.querySelector(".reel-item");
    if (first) {
      const style = window.getComputedStyle(first);
      const w = first.getBoundingClientRect().width;
      const gap = 12; // match CSS gap
      return Math.round(w + gap);
    }
    return 172; // fallback
  }

  // highlight winner: add glow to winner item
  function highlightWinner(index) {
    const items = Array.from(REEL.children);
    items.forEach((it, i) => {
      it.style.boxShadow = "";
      if (i === index) {
        it.style.boxShadow = "0 8px 30px rgba(255,215,0,0.45)";
        it.style.border = "1px solid rgba(255,215,0,0.6)";
      }
    });
  }

  // escape helper
  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (m) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); });
  }

  // Event handlers
  SPIN_BTN.addEventListener("click", spin);
  STOP_BTN.addEventListener("click", stopEarly);
  CLOSE_BTN.addEventListener("click", closeModal);

  // close on backdrop click (if not spinning)
  MODAL.addEventListener("click", (e) => {
    if (e.target === MODAL) closeModal();
  });

  // initial load
  loadSkins();

});