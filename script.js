document.addEventListener("DOMContentLoaded", () => {

  /* -------------------------
     Config + DOM handles
     ------------------------- */
  const CASE_GRID = document.getElementById("case-grid");
  const MODAL = document.getElementById("modal");
  const REEL = document.getElementById("reel");
  const SPIN_BTN = document.getElementById("spinBtn");
  const STOP_BTN = document.getElementById("stopBtn");
  const CLOSE_BTN = document.getElementById("closeBtn");
  const RESULT_TEXT = document.getElementById("resultText");

  let skins = [];
  let isSpinning = false;

  /* -------------------------
     Helpers
     ------------------------- */
  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (m) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]);
    });
  }

  function getItemWidth() {
    const first = REEL.querySelector(".reel-item");
    if (first) {
      const w = first.getBoundingClientRect().width;
      const gap = 12; // CSS gap
      return Math.round(w + gap);
    }
    return 172;
  }

  /* -------------------------
     Load skins from backend (Steam API)
     ------------------------- */
  async function loadSkins() {
    try {
      const steamUser = JSON.parse(localStorage.getItem('ruststack_user'));
      if(steamUser && steamUser.steamID){
        const res = await fetch(`/api/user/${steamUser.steamID}/inventory`);
        const data = await res.json();
        if(!Array.isArray(data) || data.length===0) throw new Error("No skins returned");
        skins = data;
      } else {
        // fallback: local skins.json
        const res = await fetch('skins.json');
        skins = await res.json();
      }
      buildCaseGrid();
    } catch(err){
      console.error(err);
      if(CASE_GRID) CASE_GRID.innerHTML = "<div style='color:#f66'>Failed to load skins. Make sure you are logged in via Steam.</div>";
    }
  }

  /* Create case cards */
  function buildCaseGrid() {
    if (!CASE_GRID) return;
    const cases = [
      { id: "basic", name: "Basic Case", price: 1 },
      { id: "premium", name: "Premium Case", price: 5 }
    ];
    CASE_GRID.innerHTML = "";
    cases.forEach(c => {
      const card = document.createElement("div");
      card.className = "case-card";
      card.innerHTML = `
        <img src="images/case1.png" alt="${escapeHtml(c.name)}">
        <h3>${escapeHtml(c.name)}</h3>
        <div style="margin-bottom:8px;color:var(--gold-dim)">Price: ${c.price} coins</div>
        <button class="btn open" data-case="${c.id}">Open</button>
      `;
      CASE_GRID.appendChild(card);
    });

    document.querySelectorAll(".case-card .open").forEach(btn => {
      btn.addEventListener("click", (e) => openCase(e.currentTarget.dataset.case));
    });
  }

  /* -------------------------
     Reel preparation & modal
     ------------------------- */
  function prepareReel() {
    REEL.style.transition = "none";
    REEL.style.transform = "translateX(0)";
    REEL.innerHTML = "";

    const REPEAT = 60; // number of reel items
    for (let i = 0; i < REPEAT; i++) {
      const s = skins[Math.floor(Math.random() * skins.length)];
      const div = document.createElement("div");
      div.className = "reel-item";
      div.innerHTML = `
        <img loading="lazy" src="${s.image}" alt="${escapeHtml(s.name)}" onerror="this.style.opacity=.2">
        <div class="name">${escapeHtml(s.name)}</div>
        <div class="rarity">${escapeHtml(s.rarity)}</div>
      `;
      REEL.appendChild(div);
    }
  }

  function openCase(caseId) {
    RESULT_TEXT.textContent = "";
    prepareReel();
    MODAL.classList.add("open");
    SPIN_BTN.disabled = false;
    STOP_BTN.disabled = true;
  }

  function spin() {
    if (isSpinning) return;
    isSpinning = true;
    RESULT_TEXT.textContent = "Spinning...";
    SPIN_BTN.disabled = true;
    STOP_BTN.disabled = false;

    const winner = skins[Math.floor(Math.random() * skins.length)];

    const ITEM_W = getItemWidth();
    const visibleWidth = document.getElementById("slotWindow").clientWidth;
    const centerOffset = Math.floor(visibleWidth / 2 - ITEM_W / 2);

    const totalItems = 80;
    const newItems = [];
    for (let i = 0; i < totalItems - 1; i++) newItems.push(skins[Math.floor(Math.random() * skins.length)]);
    newItems.push(winner);

    REEL.innerHTML = "";
    newItems.forEach(it => {
      const div = document.createElement("div");
      div.className = "reel-item";
      div.innerHTML = `
        <img loading="lazy" src="${it.image}" alt="${escapeHtml(it.name)}" onerror="this.style.opacity=.2">
        <div class="name">${escapeHtml(it.name)}</div>
        <div class="rarity">${escapeHtml(it.rarity)}</div>
      `;
      REEL.appendChild(div);
    });

    const winnerIndex = newItems.length - 1;
    const targetX = - (winnerIndex * ITEM_W) + centerOffset;
    const baseDuration = 2200;
    const extra = Math.min(3500, Math.abs(targetX)*0.35);
    const duration = baseDuration + extra;

    REEL.style.transition = `transform ${duration}ms cubic-bezier(.18,.98,.3,.99)`;
    requestAnimationFrame(()=>{REEL.style.transform = `translateX(${targetX}px)`;});

    setTimeout(()=>{
      isSpinning=false;
      STOP_BTN.disabled=true;
      SPIN_BTN.disabled=false;
      RESULT_TEXT.textContent = `You won: ${winner.name} (${winner.rarity})`;
      highlightWinner(winnerIndex);
    }, duration+80);
  }

  function stopEarly(){ if(isSpinning){ REEL.style.transitionDuration="700ms"; STOP_BTN.disabled=true; } }
  function highlightWinner(index){
    Array.from(REEL.children).forEach((it,i)=>{
      it.style.boxShadow=""; it.style.border="1px solid rgba(255,215,0,0.04)";
      if(i===index){ it.style.boxShadow="0 8px 30px rgba(255,215,0,0.45)"; it.style.border="1px solid rgba(255,215,0,0.6)"; }
    });
  }
  function closeModal(){ if(!isSpinning){ MODAL.classList.remove("open"); REEL.innerHTML=""; RESULT_TEXT.textContent=""; } }

  SPIN_BTN && SPIN_BTN.addEventListener("click", spin);
  STOP_BTN && STOP_BTN.addEventListener("click", stopEarly);
  CLOSE_BTN && CLOSE_BTN.addEventListener("click", closeModal);
  MODAL && MODAL.addEventListener("click",(e)=>{if(e.target===MODAL)closeModal();});
  if(CASE_GRID) loadSkins();

  /* -------------------------
     AUTH / STEAM LOGIN
     ------------------------- */
  (function authBlock(){
    const signInBtn = document.getElementById('signInBtn');
    const authModal = document.getElementById('auth-modal');
    const authClose = document.getElementById('authClose');
    const steamBtn = document.getElementById('steamBtn');
    const emailForm = document.getElementById('emailForm');
    const authMessage = document.getElementById('auth-message');

    function setLoggedIn(user){ localStorage.setItem('ruststack_user',JSON.stringify(user)); renderAuthUI(); }
    function setLoggedOut(){ localStorage.removeItem('ruststack_user'); renderAuthUI(); }
    function getUser(){ try{return JSON.parse(localStorage.getItem('ruststack_user'));}catch(e){return null;} }

    function renderAuthUI(){
      const user = getUser();
      const container = document.querySelector('.auth-area');
      if(!container) return;
      container.innerHTML='';
      if(user){
        const badge=document.createElement('div');
        badge.className='user-badge'; badge.style.display='flex'; badge.style.alignItems='center'; badge.style.gap='10px';
        const avatar=document.createElement('div');
        avatar.style.width='34px'; avatar.style.height='34px'; avatar.style.borderRadius='8px'; avatar.style.background='linear-gradient(90deg,#2a2a2a,#111)';
        avatar.style.display='flex'; avatar.style.alignItems='center'; avatar.style.justifyContent='center';
        avatar.style.color='var(--gold)'; avatar.style.fontWeight='700'; avatar.textContent=(user.name||'U').charAt(0).toUpperCase();
        const name=document.createElement('div'); name.style.color='var(--gold)'; name.style.fontWeight='700'; name.textContent=user.name||user.email||'User';
        const logoutBtn=document.createElement('button'); logoutBtn.className='auth-btn'; logoutBtn.textContent='Sign out';
        logoutBtn.addEventListener('click',()=>setLoggedOut());
        badge.appendChild(avatar); badge.appendChild(name); container.appendChild(badge); container.appendChild(logoutBtn);
      } else {
        const btn=document.createElement('button'); btn.id='signInBtn'; btn.className='auth-btn'; btn.textContent='Sign in';
        btn.addEventListener('click',openModal); container.appendChild(btn);
      }
    }

    function openModal(){ if(!authModal) return; authMessage && (authMessage.textContent=''); authModal.classList.remove('hidden'); authModal.setAttribute('aria-hidden','false'); }
    function closeModal(){ if(!authModal) return; authModal.classList.add('hidden'); authModal.setAttribute('aria-hidden','true'); }

    if(signInBtn) signInBtn.addEventListener('click',openModal);
    if(authClose) authClose.addEventListener('click',closeModal);
    if(authModal) authModal.addEventListener('click',(e)=>{if(e.target===authModal)closeModal();});

    // email form simulated
    if(emailForm){
      emailForm.addEventListener('submit',(e)=>{
        e.preventDefault();
        const email=(document.getElementById('emailInput')||{}).value||'';
        const pwd=(document.getElementById('passwordInput')||{}).value||'';
        if(!email.includes('@')||pwd.length<4){ authMessage && (authMessage.textContent='Enter valid email'); return; }
        authMessage && (authMessage.textContent='Signing in…');
        setTimeout(()=>{ setLoggedIn({method:'email',name:email.split('@')[0],email}); authMessage && (authMessage.textContent='Signed in!'); setTimeout(closeModal,700); },700);
      });
    }

    // steam login
    if(steamBtn){
      steamBtn.addEventListener('click',(e)=>{
        e.preventDefault();
        window.location.href='/auth/steam';
      });
    }

    renderAuthUI();
    window._ruststack_auth={setLoggedIn,setLoggedOut,getUser};
  })();

});

document.addEventListener("DOMContentLoaded", () => {
  const authModal = document.getElementById("auth-modal");
  const signInBtn = document.getElementById("signInBtn");
  const authClose = document.getElementById("authClose");

  if (signInBtn) {
    signInBtn.addEventListener("click", () => {
      authModal.classList.remove("hidden");
    });
  }

  if (authClose) {
    authClose.addEventListener("click", () => {
      authModal.classList.add("hidden");
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const caseGrid = document.getElementById("case-grid");
  const caseModal = document.getElementById("case-modal");
  const caseRoller = document.getElementById("case-roller");
  const closeCase = document.getElementById("closeCase");
  const resultText = document.getElementById("resultText");

  fetch("items.json")
    .then(res => res.json())
    .then(items => {
      // Kreiraj case karticu (1 case za test)
      const div = document.createElement("div");
      div.classList.add("case-card");
      div.innerHTML = `
        <img src="images/case1.png" alt="RustStack Case">
        <h4>RustStack Case</h4>
        <button class="open-case-btn">Open</button>
      `;
      caseGrid.appendChild(div);

      div.querySelector(".open-case-btn").addEventListener("click", () => {
        caseRoller.innerHTML = '';
        caseModal.classList.remove("hidden");
        resultText.textContent = '';

        // Generiraj “vrtnju”
        const spinCount = 40;
        const reelItems = [];

        for (let i = 0; i < spinCount; i++) {
          const randomItem = getRandomItem(items);
          reelItems.push(randomItem);
          const img = document.createElement("img");
          img.src = randomItem.image;
          img.classList.add("reel-item");
          caseRoller.appendChild(img);
        }

        // Animacija vrtnje
        caseRoller.style.transition = 'transform 3s cubic-bezier(0.33, 1, 0.68, 1)';
        caseRoller.style.transform = `translateX(-${(spinCount - 1) * 100}px)`;

        // Odredi konačni item
        const finalItem = getRandomItem(items);

        setTimeout(() => {
          resultText.textContent = `You won: ${finalItem.skin} ${finalItem.item} ($${finalItem.price.toFixed(2)})`;
        }, 3100);
      });
    });

  closeCase.addEventListener("click", () => {
    caseModal.classList.add("hidden");
    caseRoller.style.transform = 'translateX(0px)';
  });
});

// Funkcija za biranje itema po šansi
function getRandomItem(items) {
  const random = Math.random() * 100;
  let cumulative = 0;

  for (const item of items) {
    cumulative += item.chance;
    if (random <= cumulative) return item;
  }

  return items[items.length - 1];
}
