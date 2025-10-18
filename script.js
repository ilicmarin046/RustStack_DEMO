document.addEventListener("DOMContentLoaded", function() {

  // Navigation active links
  const navLinks = document.querySelectorAll(".nav-buttons a");
  navLinks.forEach(link => {
    link.addEventListener("click", function(e) {
      navLinks.forEach(l => l.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Open case modal logic
  const openButtons = document.querySelectorAll(".open-case");
  const modal = document.getElementById("case-modal");
  const closeBtn = document.getElementById("close-modal");
  const skinImg = document.getElementById("random-skin");

  const skins = [
    "images/skin1.png",
    "images/skin2.png",
    "images/skin3.png"
  ];

  openButtons.forEach(btn => {
    btn.addEventListener("click", function(e){
      e.preventDefault();
      modal.classList.remove("hidden");

      // Animation: random skins
      let i = 0;
      const animInterval = setInterval(() => {
        const randomSkin = skins[Math.floor(Math.random()*skins.length)];
        skinImg.src = randomSkin;
        i++;
        if(i>10){ // finish animation
          clearInterval(animInterval);
          const finalSkin = skins[Math.floor(Math.random()*skins.length)];
          skinImg.src = finalSkin;
        }
      }, 100);
    });
  });

  closeBtn.addEventListener("click", function(){
    modal.classList.add("hidden");
  });

});