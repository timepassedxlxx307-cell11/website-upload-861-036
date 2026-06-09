document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var menu = document.querySelector("[data-nav-menu]");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
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

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  }

  document.querySelectorAll("[data-local-filter]").forEach(function (filterBox) {
    var input = filterBox.querySelector("[data-local-search]");
    var clear = filterBox.querySelector("[data-clear-filter]");
    var scope = filterBox.closest("main");
    var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll("[data-card]")) : [];

    function applyFilter() {
      var value = (input && input.value ? input.value : "").trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
        card.classList.toggle("is-filtered-out", value && haystack.indexOf(value) === -1);
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    if (clear) {
      clear.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        applyFilter();
      });
    }
  });

  var results = document.getElementById("search-results");
  if (results && Array.isArray(window.SEARCH_ITEMS)) {
    var keyword = document.getElementById("global-search");
    var region = document.getElementById("region-filter");
    var type = document.getElementById("type-filter");
    var reset = document.getElementById("search-reset");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (keyword) {
      keyword.value = initial;
    }

    function createCard(item) {
      var tags = item.tags.slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return "<article class=\"movie-card\">" +
        "<a class=\"movie-poster\" href=\"./" + item.url + "\" aria-label=\"观看" + escapeHtml(item.title) + "\">" +
        "<img src=\"./" + item.cover + ".jpg\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
        "<span class=\"poster-badge\">" + escapeHtml(item.year) + "</span>" +
        "</a>" +
        "<div class=\"movie-info\">" +
        "<h2><a href=\"./" + item.url + "\">" + escapeHtml(item.title) + "</a></h2>" +
        "<p class=\"movie-meta\">" + escapeHtml(item.region) + " · " + escapeHtml(item.type) + "</p>" +
        "<p class=\"movie-desc\">" + escapeHtml(item.oneLine) + "</p>" +
        "<div class=\"tag-row\">" + tags + "</div>" +
        "</div>" +
        "</article>";
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>\"]/g, function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;"
        }[char];
      });
    }

    function applySearch() {
      var q = keyword ? keyword.value.trim().toLowerCase() : "";
      var r = region ? region.value : "";
      var t = type ? type.value : "";
      var items = window.SEARCH_ITEMS.filter(function (item) {
        var text = (item.title + " " + item.region + " " + item.type + " " + item.year + " " + item.genre + " " + item.tags.join(" ")).toLowerCase();
        var okKeyword = !q || text.indexOf(q) !== -1;
        var okRegion = !r || item.region.indexOf(r) !== -1;
        var okType = !t || item.type.indexOf(t) !== -1 || item.genre.indexOf(t) !== -1;
        return okKeyword && okRegion && okType;
      }).slice(0, 120);

      if (!items.length) {
        results.innerHTML = "<div class=\"search-empty\">没有找到匹配影片</div>";
        return;
      }
      results.innerHTML = items.map(createCard).join("");
    }

    [keyword, region, type].forEach(function (field) {
      if (field) {
        field.addEventListener("input", applySearch);
        field.addEventListener("change", applySearch);
      }
    });

    if (reset) {
      reset.addEventListener("click", function () {
        if (keyword) {
          keyword.value = "";
        }
        if (region) {
          region.value = "";
        }
        if (type) {
          type.value = "";
        }
        applySearch();
      });
    }

    applySearch();
  }
});
