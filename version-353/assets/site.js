(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuToggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");

    if (menuToggle && nav) {
      menuToggle.addEventListener("click", function () {
        var opened = nav.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", opened ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    Array.prototype.slice.call(document.querySelectorAll(".site-search")).forEach(function (form) {
      var input = form.querySelector("input[type='search']");
      var area = document.querySelector(".searchable-area");

      if (!input || !area) {
        return;
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        filterCards(input.value, area);
      });

      input.addEventListener("input", function () {
        filterCards(input.value, area);
      });
    });

    function filterCards(value, area) {
      var keyword = String(value || "").trim().toLowerCase();
      var items = Array.prototype.slice.call(area.querySelectorAll(".searchable-card, .category-directory-card"));

      items.forEach(function (item) {
        var text = item.textContent.toLowerCase();
        var title = String(item.getAttribute("data-title") || "").toLowerCase();
        var genre = String(item.getAttribute("data-genre") || "").toLowerCase();
        var year = String(item.getAttribute("data-year") || "").toLowerCase();
        var matched = !keyword || text.indexOf(keyword) !== -1 || title.indexOf(keyword) !== -1 || genre.indexOf(keyword) !== -1 || year.indexOf(keyword) !== -1;
        item.classList.toggle("is-hidden", !matched);
      });
    }
  });
})();
