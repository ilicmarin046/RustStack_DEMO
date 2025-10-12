const lootbox = document.getElementById('lootbox');
const openBtn = document.getElementById('openBtn');
const dropResult = document.getElementById('dropResult');
const coinsDisplay = document.getElementById('coins');

let coins = 500;

function updateCoins(amount) {
  coins += amount;
  coinsDisplay.textContent = coins;
}

openBtn.addEventListener('click', () => {
  if(coins < 50) {
    dropResult.textContent = "😞 Not enough coins!";
    return;
  }
  if (lootbox.classList.contains('open')) return;

  updateCoins(-50);
  dropResult.textContent = '';
  lootbox.classList.add('open');

  setTimeout(() => {
    const rewards = [
      { name: 'Golden Facemask', coins: 500 },
      { name: 'Silver Mask', coins: 300 },
      { name: 'Bronze Helmet', coins: 100 },
      { name: 'Rusty Shovel', coins: 50 },
      { name: 'Nothing', coins: 0 }
    ];

    const reward = rewards[Math.floor(Math.random() * rewards.length)];

    if (reward.coins > 0) {
      dropResult.innerHTML = `🎉 You won <strong>${reward.name}</strong>! (+${reward.coins} coins)`;
      updateCoins(reward.coins);
    } else {
      dropResult.textContent = '😭 Sorry, no reward this time!';
    }

    setTimeout(() => {
      lootbox.classList.remove('open');
    }, 3500);
  }, 1200);
});
