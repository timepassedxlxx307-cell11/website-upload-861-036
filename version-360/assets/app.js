(function () {
    var nav = document.querySelector('[data-mobile-nav]');
    var toggle = document.querySelector('[data-menu-toggle]');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
        var scope = document.querySelector('[data-filter-scope]') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var input = document.querySelector('[data-local-filter]');
        var yearSelect = document.querySelector('[data-year-filter]');
        var typeSelect = document.querySelector('[data-type-filter]');
        var query = normalize(input && input.value);
        var year = normalize(yearSelect && yearSelect.value);
        var type = normalize(typeSelect && typeSelect.value);

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre')
            ].join(' '));
            var cardYear = normalize(card.getAttribute('data-year'));
            var cardType = normalize(card.getAttribute('data-type'));
            var matched = true;

            if (query && haystack.indexOf(query) === -1) {
                matched = false;
            }

            if (year && cardYear !== year) {
                matched = false;
            }

            if (type && cardType.indexOf(type) === -1) {
                matched = false;
            }

            card.classList.toggle('is-hidden', !matched);
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-local-filter], [data-year-filter], [data-type-filter]')).forEach(function (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
    });

    var searchInput = document.getElementById('globalSearch');
    var searchPanel = document.getElementById('searchPanel');

    function renderSearchResults(items) {
        if (!searchPanel) {
            return;
        }

        if (!items.length) {
            searchPanel.innerHTML = '<div class="search-result"><div></div><div><strong>暂无相关影片</strong><span>换个关键词试试</span></div></div>';
            searchPanel.classList.add('active');
            return;
        }

        searchPanel.innerHTML = items.slice(0, 10).map(function (item) {
            return [
                '<a class="search-result" href="./' + item.url + '">',
                '<span class="search-thumb"><img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy"></span>',
                '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.type + ' · ' + item.genre + '</span></span>',
                '</a>'
            ].join('');
        }).join('');
        searchPanel.classList.add('active');
    }

    if (searchInput && searchPanel) {
        searchInput.addEventListener('input', function () {
            var query = normalize(searchInput.value);
            var data = window.SEARCH_MOVIES || [];

            if (!query) {
                searchPanel.classList.remove('active');
                searchPanel.innerHTML = '';
                return;
            }

            var results = data.filter(function (item) {
                return normalize(item.title + ' ' + item.year + ' ' + item.type + ' ' + item.genre + ' ' + item.region + ' ' + item.category).indexOf(query) !== -1;
            });

            renderSearchResults(results);
        });

        document.addEventListener('click', function (event) {
            if (!searchPanel.contains(event.target) && event.target !== searchInput) {
                searchPanel.classList.remove('active');
            }
        });
    }
})();
