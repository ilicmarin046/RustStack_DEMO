let coins = 500;
const resultEl = document.getElementById("result");
const caseBox = document.getElementById("case-box");
const coinsEl = document.getElementById("coins");
const openBtn = document.getElementById("openBtn");

function openCase() {
  if (coins < 50) {
    resultEl.textContent = " Not enough coins!";
    resultEl.style.color = "#ff4d4d";
    return;
  }

  coins -= 50;
  coinsEl.textContent = coins;
  resultEl.textContent = "";
  caseBox.style.transform = "rotate(15deg)";

  openBtn.disabled = true;
  openBtn.textContent = "Opening...";

  setTimeout(() => {
    caseBox.style.transform = "rotate(-15deg)";
  }, 200);

  setTimeout(() => {
    caseBox.style.transform = "rotate(0deg)";

    const rand = Math.random();
    let result, color;

    if (rand < 0.05) {
      result = " Legendary Skin!";
      color = "#ff9900";
      coins += 300;
    } else if (rand < 0.2) {
      result = " Rare Skin!";
      color = "#33ccff";
      coins += 100;
    } else {
      result = "Common Skin ";
      color = "#bbb";
    }

    coinsEl.textContent = coins;
    resultEl.textContent = result;
    resultEl.style.color = color;

    openBtn.disabled = false;
    openBtn.textContent = "Open Case (50 coins)";
  }, 1500);

}
