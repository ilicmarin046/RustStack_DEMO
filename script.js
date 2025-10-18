document.addEventListener("DOMContentLoaded", function() {
  // Hero gumb
  const heroButton = document.querySelector(".hero .btn");
  heroButton.addEventListener("click", function() {
    alert("Hvala što ste kliknuli na 'Slušaj odmah'!");
  });

  // Navigacijski gumbi aktivni efekt
  const navLinks = document.querySelectorAll(".nav-buttons a");
  navLinks.forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Album gumbi
  const albumButtons = document.querySelectorAll(".album-card .btn");
  albumButtons.forEach(btn => {
    btn.addEventListener("click", function() {
      alert("Hvala što ste kliknuli na 'Kupite'!");
    });
  });
});