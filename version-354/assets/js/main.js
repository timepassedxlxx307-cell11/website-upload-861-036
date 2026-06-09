(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-button]');
  var mobileNav = qs('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  qsa('[data-hero-slider]').forEach(function (slider) {
    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  });

  qsa('[data-filter-page]').forEach(function (panel) {
    var section = panel.parentElement;
    var input = qs('[data-filter-input]', panel);
    var selects = qsa('[data-filter-select]', panel);
    var grid = qs('[data-filter-grid]', section);
    var empty = qs('[data-empty-state]', section);

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var filters = {};

      selects.forEach(function (select) {
        filters[select.getAttribute('data-filter-select')] = select.value;
      });

      var visible = 0;
      qsa('.movie-card', grid).forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();

        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !filters.year || (card.getAttribute('data-year') || '').indexOf(filters.year) !== -1;
        var matchType = !filters.type || (card.getAttribute('data-type') || '').indexOf(filters.type) !== -1;
        var matchRegion = !filters.region || (card.getAttribute('data-region') || '').indexOf(filters.region) !== -1;
        var show = matchKeyword && matchYear && matchType && matchRegion;

        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilter);
    });
  });

  qsa('[data-player]').forEach(function (player) {
    var button = qs('[data-play-button]', player);
    var video = qs('video', player);
    var source = player.getAttribute('data-video-src');
    var hlsInstance = null;

    function startVideo() {
      if (!video || !source) {
        return;
      }

      if (button) {
        button.classList.add('is-hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.getAttribute('src')) {
          video.setAttribute('src', source);
        }
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.play().catch(function () {});
        }
        return;
      }

      if (!video.getAttribute('src')) {
        video.setAttribute('src', source);
      }
      video.play().catch(function () {});
    }

    if (button) {
      button.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }
  });

  qsa('[data-search-page]').forEach(function (page) {
    var form = qs('form', page);
    var input = qs('[data-search-input]', page);
    var results = qs('[data-search-results]', page);
    var title = qs('[data-search-title]', page);
    var empty = qs('[data-search-empty]', page);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function makeCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '">' +
        '<a class="movie-cover" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="cover-badge">' + escapeHtml(movie.type) + '</span>' +
        '</a>' +
        '<div class="movie-body">' +
          '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
          '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p>' + escapeHtml(movie.oneLine || movie.genre || '') + '</p>' +
          '<div class="movie-tags">' + tags + '</div>' +
        '</div>' +
      '</article>';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function performSearch(query) {
      var data = window.MOVIE_DATA || [];
      var keyword = query.trim().toLowerCase();

      if (!keyword) {
        if (title) {
          title.textContent = '推荐影片';
        }
        if (empty) {
          empty.classList.remove('show');
        }
        return;
      }

      var matches = data.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine,
          movie.category
        ].join(' ').toLowerCase();
        return haystack.indexOf(keyword) !== -1;
      }).slice(0, 120);

      if (title) {
        title.textContent = '搜索结果';
      }
      if (results) {
        results.innerHTML = matches.map(makeCard).join('');
      }
      if (empty) {
        empty.classList.toggle('show', matches.length === 0);
      }
    }

    if (input) {
      input.value = initialQuery;
    }

    performSearch(initialQuery);

    if (form && input) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input.value.trim();
        var newUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
        window.history.replaceState(null, '', newUrl);
        performSearch(query);
      });

      input.addEventListener('input', function () {
        performSearch(input.value);
      });
    }
  });
})();
