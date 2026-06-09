(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupPlayers();
    });

    function setupMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!expanded));
            panel.hidden = expanded;
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        start();
    }

    function setupSearch() {
        var input = document.getElementById('siteSearch');
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        if (!input && !buttons.length) {
            return;
        }

        var activeFilter = 'all';

        function queryFromUrl() {
            try {
                var params = new URLSearchParams(window.location.search);
                return params.get('q') || '';
            } catch (error) {
                return '';
            }
        }

        function matchCard(card, term) {
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.textContent
            ].join(' ').toLowerCase();
            var filterOk = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
            var termOk = !term || text.indexOf(term) !== -1;
            return filterOk && termOk;
        }

        function apply() {
            var term = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                card.classList.toggle('is-hidden', !matchCard(card, term));
            });
        }

        if (input) {
            var initial = queryFromUrl();
            if (initial) {
                input.value = initial;
            }
            input.addEventListener('input', apply);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                apply();
            });
        });
        apply();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (box) {
            var video = box.querySelector('video');
            var button = box.querySelector('[data-url]');
            if (!video || !button) {
                return;
            }
            var url = button.getAttribute('data-url');
            var started = false;

            function attach() {
                if (started) {
                    return;
                }
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    box.hls = hls;
                } else {
                    video.src = url;
                }
            }

            function play() {
                attach();
                button.classList.add('is-hidden');
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        button.classList.remove('is-hidden');
                    });
                }
            }

            button.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });
        });
    }
}());
