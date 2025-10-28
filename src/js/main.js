// Pequenos utilitários do cliente
document.addEventListener("DOMContentLoaded", function () {
  // Feedback tátil para os cartões (se suportado)
  try {
    const linkCards = document.querySelectorAll("a");
    linkCards.forEach(function (a) {
      a.addEventListener("click", function () {
        try {
          if (navigator.vibrate) navigator.vibrate(10);
        } catch (e) {}
      });
    });
  } catch (e) {
    // não crítico
  }
});
