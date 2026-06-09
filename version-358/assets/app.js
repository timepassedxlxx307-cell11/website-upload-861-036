(function () {
  var body = document.body;
  var root = body ? body.getAttribute('data-root') || './' : './';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function openSearch(value) {
    var keyword = value.trim();
    if (keyword) {
      window.location.href = root + 'videos.html?q=' + encodeURIComponent(keyword);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupTopSearch() {
    var inputs = document.querySelectorAll('[data-site-search]');
    inputs.forEach(function (input) {
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          openSearch(input.value);
        }
      });
    });
  }

  function setupLibraryFilter() {
    var input = document.getElementById('movieSearch');
    var list = document.querySelector('[data-movie-list]');
    var empty = document.querySelector('[data-empty-state]');
    if (!input || !list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-search]'));
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var active = 'all';
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    input.value = q;

    function apply() {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var channel = card.getAttribute('data-channel') || '';
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchChannel = active === 'all' || channel === active;
        var show = matchKeyword && matchChannel;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('visible', visible === 0);
      }
    }

    input.addEventListener('input', apply);
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        active = button.getAttribute('data-filter') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });
    apply();
  }

  function setupPlayers() {
    var players = document.querySelectorAll('[data-player]');
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('[data-player-cover]');
      if (!video) {
        return;
      }

      var url = video.getAttribute('data-video');
      var loaded = false;
      var hlsInstance = null;

      function load() {
        if (loaded || !url) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        }
      }

      function play() {
        load();
        var request = video.play();
        if (request && typeof request.then === 'function') {
          request.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener('click', function () {
          cover.classList.add('hidden');
          play();
        });
      }

      video.addEventListener('click', function () {
        load();
      });

      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('hidden');
        }
      });

      video.addEventListener('loadedmetadata', function () {
        if (cover && !video.paused) {
          cover.classList.add('hidden');
        }
      });

      load();
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupTopSearch();
    setupLibraryFilter();
    setupPlayers();
  });
})();
