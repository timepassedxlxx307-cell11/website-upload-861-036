(function () {
  function text(value) {
    return (value || "").toString().toLowerCase();
  }

  function uniqueOptions(cards, key) {
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute(key) || "";
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    values.sort(function (a, b) {
      return a.localeCompare(b, "zh-CN");
    });
    return values;
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  function initFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var searchInput = document.querySelector("[data-search-input]");
    var regionSelect = document.querySelector("[data-filter-region]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var categorySelect = document.querySelector("[data-filter-category]");
    var empty = document.querySelector("[data-empty-state]");
    if (!cards.length) {
      return;
    }
    fillSelect(regionSelect, uniqueOptions(cards, "data-region"));
    fillSelect(typeSelect, uniqueOptions(cards, "data-type"));
    fillSelect(yearSelect, uniqueOptions(cards, "data-year").reverse());

    function apply() {
      var query = text(searchInput && searchInput.value);
      var region = regionSelect ? regionSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var category = categorySelect ? categorySelect.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].map(text).join(" ");
        var matched = true;
        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (region && card.getAttribute("data-region") !== region) {
          matched = false;
        }
        if (type && card.getAttribute("data-type") !== type) {
          matched = false;
        }
        if (year && card.getAttribute("data-year") !== year) {
          matched = false;
        }
        if (category && card.getAttribute("data-category") !== category) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }
    [searchInput, regionSelect, typeSelect, yearSelect, categorySelect].forEach(function (item) {
      if (item) {
        item.addEventListener("input", apply);
        item.addEventListener("change", apply);
      }
    });
  }

  window.initMoviePlayer = function (videoSource) {
    var box = document.querySelector(".player-box");
    var video = document.querySelector(".player-box video");
    var layer = document.querySelector(".play-layer");
    if (!box || !video || !videoSource) {
      return;
    }
    var hlsInstance = null;
    var loaded = false;

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoSource;
      } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(videoSource);
        hlsInstance.attachMedia(video);
      } else {
        video.src = videoSource;
      }
    }

    function play() {
      load();
      box.classList.add("playing");
      var started = video.play();
      if (started && typeof started.catch === "function") {
        started.catch(function () {});
      }
    }

    if (layer) {
      layer.addEventListener("click", play);
    }
    video.addEventListener("click", play);
    video.addEventListener("play", function () {
      box.classList.add("playing");
    });
    video.addEventListener("ended", function () {
      box.classList.remove("playing");
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
