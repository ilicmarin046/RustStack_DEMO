document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ script.js loaded");

  const caseGrid = document.getElementById("case-grid");
  const caseModal = document.getElementById("case-modal");
  const caseRoller = document.getElementById("case-roller");
  const closeCase = document.getElementById("closeCase");
  const resultText = document.getElementById("resultText");

  if (!caseGrid) {
    console.error("❌ Missing #case-grid element in HTML!");
    return;
  }

  // 🔹 Učitaj iteme s Vercel API endpointa
  fetch("/api/items")
    .then(res => {
      console.log("📦 API status:", res.status);
      if (!res.ok) throw new Error("Failed to load items from API");
      return res.json();
    })
    .then(items => {
      console.log("✅ Items loaded:", items);

      // Napravi jedan case
      const div = document.createElement("div");
      div.classList.add("case-card");
      div.innerHTML = `
        <img src="images/case1.png" alt="RustStack Case" />
        <h4>RustStack Case</h4>
        <button class="open-case-btn">Open</button>
      `;
      caseGrid.appendChild(div);

      // Kad klikneš "Open"
      div.querySelector(".open-case-btn").addEventListener("click", () => {
        caseRoller.innerHTML = "";
        caseModal.classList.remove("hidden");
        resultText.textContent = "";

        const spinCount = 40;

        for (let i = 0; i < spinCount; i++) {
          const randomItem = getRandomItem(items);
          const img = document.createElement("img");
          img.src = randomItem.image;
          img.classList.add("reel-item");
          img.onerror = () => (img.style.opacity = 0.3);
          caseRoller.appendChild(img);
        }

        // Završni item
        const finalItem = getRandomItem(items);
        setTimeout(() => {
          resultText.textContent = `You won: ${finalItem.skin} ${finalItem.item} ($${finalItem.price.toFixed(
            2
          )})`;
        }, 3000);
      });
    })
    .catch(err => {
      console.error("❌ Error fetching items:", err);
      caseGrid.innerHTML = `<p style="color:red;">Error loading items from API</p>`;
    });

  // Zatvori modal
  closeCase.addEventListener("click", () => {
    caseModal.classList.add("hidden");
    caseRoller.style.transform = "translateX(0)";
  });
});

// 🎲 Funkcija za vjerojatnost itema
function getRandomItem(items) {
  const random = Math.random() * 100;
  let cumulative = 0;

  for (const item of items) {
    cumulative += item.chance;
    if (random <= cumulative) return item;
  }

  return items[items.length - 1];
}
