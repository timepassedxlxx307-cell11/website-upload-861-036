const SELECTORS = {
  navToggle: '[data-nav-toggle]',
  nav: '[data-nav]',
  hero: '[data-hero]',
  catalog: '[data-catalog]',
  catalogCard: '[data-movie-card]',
  player: '[data-player]'
};

function initNavigation() {
  const button = document.querySelector(SELECTORS.navToggle);
  const nav = document.querySelector(SELECTORS.nav);

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(isOpen));
  });
}

function initHeroCarousel() {
  const hero = document.querySelector(SELECTORS.hero);

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));

  if (slides.length <= 1) {
    return;
  }

  let activeIndex = 0;
  let timer = null;

  function showSlide(nextIndex) {
    activeIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === activeIndex);
      slide.setAttribute('aria-hidden', String(index !== activeIndex));
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === activeIndex);
      dot.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
    });
  }

  function start() {
    stop();
    timer = window.setInterval(() => showSlide(activeIndex + 1), 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      start();
    });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);

  showSlide(0);
  start();
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || '';
}

function initCatalogFiltering() {
  const catalog = document.querySelector(SELECTORS.catalog);

  if (!catalog) {
    return;
  }

  const cards = Array.from(catalog.querySelectorAll(SELECTORS.catalogCard));
  const searchInput = document.querySelector('[data-filter-search]');
  const categorySelect = document.querySelector('[data-filter-category]');
  const typeSelect = document.querySelector('[data-filter-type]');
  const yearSelect = document.querySelector('[data-filter-year]');
  const resultCount = document.querySelector('[data-result-count]');
  const emptyState = document.querySelector('[data-empty-state]');

  const queryFromUrl = getQueryParam('q');
  const categoryFromUrl = getQueryParam('category');

  if (searchInput && queryFromUrl) {
    searchInput.value = queryFromUrl;
  }

  if (categorySelect && categoryFromUrl) {
    categorySelect.value = categoryFromUrl;
  }

  function update() {
    const q = normalizeText(searchInput ? searchInput.value : '');
    const category = categorySelect ? categorySelect.value : 'all';
    const type = typeSelect ? typeSelect.value : 'all';
    const year = yearSelect ? yearSelect.value : 'all';
    let visible = 0;

    cards.forEach((card) => {
      const text = normalizeText(card.dataset.searchText);
      const matchQuery = !q || text.includes(q);
      const matchCategory = category === 'all' || card.dataset.category === category;
      const matchType = type === 'all' || card.dataset.type === type;
      const matchYear = year === 'all' || card.dataset.year === year;
      const shouldShow = matchQuery && matchCategory && matchType && matchYear;

      card.hidden = !shouldShow;

      if (shouldShow) {
        visible += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = `当前显示 ${visible} 部影片`;
    }

    if (emptyState) {
      emptyState.style.display = visible === 0 ? 'block' : 'none';
    }
  }

  [searchInput, categorySelect, typeSelect, yearSelect]
    .filter(Boolean)
    .forEach((control) => control.addEventListener('input', update));

  update();
}

async function attachHlsSource(video, source, status) {
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    await video.play();
    return;
  }

  const hlsModule = await import('./hls.js');
  const Hls = hlsModule.H;

  if (!Hls || !Hls.isSupported()) {
    throw new Error('当前浏览器不支持 HLS 播放');
  }

  const hls = new Hls({
    enableWorker: true,
    lowLatencyMode: true,
    backBufferLength: 90
  });

  hls.loadSource(source);
  hls.attachMedia(video);

  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    video.play().catch((error) => {
      if (status) {
        status.textContent = `浏览器阻止了自动播放，请再次点击播放：${error.message}`;
      }
    });
  });

  hls.on(Hls.Events.ERROR, (event, data) => {
    if (status && data && data.details) {
      status.textContent = `播放提示：${data.details}`;
    }

    if (data && data.fatal) {
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else {
        hls.destroy();
      }
    }
  });
}

function initPlayers() {
  const players = document.querySelectorAll(SELECTORS.player);

  players.forEach((player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play]');
    const status = player.querySelector('[data-player-status]');

    if (!video || !button) {
      return;
    }

    let hasStarted = false;

    button.addEventListener('click', async () => {
      const source = video.dataset.src;

      if (!source) {
        if (status) {
          status.textContent = '未找到播放源。';
        }
        return;
      }

      try {
        button.hidden = true;
        video.controls = true;

        if (status) {
          status.textContent = '正在加载高清播放源，请稍候。';
        }

        if (!hasStarted) {
          hasStarted = true;
          await attachHlsSource(video, source, status);
        } else {
          await video.play();
        }

        if (status) {
          status.textContent = '播放源已绑定，可使用播放器控制栏调整进度、音量和全屏。';
        }
      } catch (error) {
        hasStarted = false;
        button.hidden = false;
        video.controls = false;

        if (status) {
          status.textContent = `播放器加载失败：${error.message}`;
        }
      }
    });
  });
}

function initSearchIndexEnhancements() {
  const globalSearchForms = document.querySelectorAll('.site-search');

  globalSearchForms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      const input = form.querySelector('input[name="q"]');

      if (!input || input.value.trim()) {
        return;
      }

      event.preventDefault();
      window.location.href = form.getAttribute('action') || 'movies.html';
    });
  });
}

function boot() {
  initNavigation();
  initHeroCarousel();
  initCatalogFiltering();
  initPlayers();
  initSearchIndexEnhancements();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
