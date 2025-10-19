document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ script.js loaded");

  const caseGrid = document.getElementById("case-grid");
  const caseModal = document.getElementById("case-modal");
  const caseRoller = document.getElementById("case-roller");
  const closeCase = document.getElementById("closeCase");
  const resultText = document.getElementById("resultText");

  if (!caseGrid) {
    console.error("❌ Missing #case-grid in HTML!");
    return;
  }

  // Učitaj iteme
  fetch("items.json")
    .then(res => {
      console.log("📦 items.json status:", res.status);
      if (!res.ok) throw new Error("Failed to load items.json");
      return res.json();
    })
    .then(items => {
      console.log("✅ Items loaded:", items);

      // Kreiraj jedan case
      const div = document.createElement("div");
      div.classList.add("case-card");
      div.innerHTML = `
        <img src="images/case1.png" alt="RustStack Case">
        <h4>RustStack Case</h4>
        <button class="open-case-btn">Open</button>
      `;
      caseGrid.appendChild(div);

      // Klik na Open
      div.querySelector(".open-case-btn").addEventListener("click", () => {
        caseRoller.innerHTML = "";
        caseModal.classList.remove("hidden");
        resultText.textContent = "";

        // Vrtnja
        const spinCount = 40;
        for (let i = 0; i < spinCount; i++) {
          const randomItem = getRandomItem(items);
          const img = document.createElement("img");
          img.src = randomItem.image;
          img.classList.add("reel-item");
          img.onerror = () => img.style.opacity = .3;
          caseRoller.appendChild(img);
        }

        // Završni item
        const finalItem = getRandomItem(items);
        setTimeout(() => {
          resultText.textContent = `You won: ${finalItem.skin} ${finalItem.item} ($${finalItem.price.toFixed(2)})`;
        }, 3000);
      });
    })
    .catch(err => {
      console.error("❌ Greška kod učitavanja items.json:", err);
      caseGrid.innerHTML = `<p style="color:red;">Error loading items.json</p>`;
    });

  closeCase.addEventListener("click", () => {
    caseModal.classList.add("hidden");
    caseRoller.style.transform = "translateX(0)";
  });
});

// Funkcija za vjerojatnost
function getRandomItem(items) {
  const random = Math.random() * 100;
  let cumulative = 0;

  for (const item of items) {
    cumulative += item.chance;
    if (random <= cumulative) return item;
  }

  return items[items.length - 1];
}
