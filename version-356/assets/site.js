(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');

    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
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

    function moveSlide(step) {
        showSlide(current + step);
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }

        stopHero();
        timer = window.setInterval(function () {
            moveSlide(1);
        }, 5600);
    }

    function stopHero() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    if (slides.length) {
        showSlide(0);
        startHero();

        if (prev) {
            prev.addEventListener('click', function () {
                moveSlide(-1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                moveSlide(1);
                startHero();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startHero();
            });
        });
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var activeFilter = 'all';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
        var query = normalize(searchInputs.length ? searchInputs[0].value : '');
        var visible = 0;

        cards.forEach(function (card) {
            var meta = normalize(card.getAttribute('data-meta') + ' ' + card.getAttribute('data-title'));
            var type = card.getAttribute('data-type') || '';
            var category = card.getAttribute('data-category') || '';
            var matchText = !query || meta.indexOf(query) !== -1;
            var matchFilter = activeFilter === 'all' || activeFilter === type || activeFilter === category;
            var show = matchText && matchFilter;

            card.classList.toggle('is-filter-hidden', !show);

            if (show) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    searchInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            searchInputs.forEach(function (other) {
                if (other !== input) {
                    other.value = input.value;
                }
            });
            applyFilter();
        });
    });

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-filter') || 'all';
            filterButtons.forEach(function (other) {
                other.classList.toggle('is-active', other === button);
            });
            applyFilter();
        });
    });

    var heroSearch = document.querySelector('[data-hero-search]');
    var heroButton = document.querySelector('[data-hero-search-button]');

    function runHeroSearch() {
        if (!heroSearch) {
            return;
        }

        var target = document.querySelector('[data-search-input]');
        if (target) {
            target.value = heroSearch.value;
            searchInputs.forEach(function (input) {
                input.value = heroSearch.value;
            });
            applyFilter();
            var section = document.getElementById('hot');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    if (heroSearch) {
        heroSearch.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                runHeroSearch();
            }
        });
    }

    if (heroButton) {
        heroButton.addEventListener('click', runHeroSearch);
    }
})();
