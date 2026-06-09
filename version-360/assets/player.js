(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (root) {
        var video = root.querySelector('video');
        var button = root.querySelector('[data-play-button]');
        var stream = video ? video.getAttribute('data-stream') : '';
        var hls = null;
        var ready = false;

        function attach() {
            if (!video || !stream || ready) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                ready = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                ready = true;
                return;
            }

            video.src = stream;
            ready = true;
        }

        function start() {
            attach();
            if (!video) {
                return;
            }

            root.classList.add('is-playing');
            var playResult = video.play();

            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {
                    root.classList.remove('is-playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('play', function () {
                root.classList.add('is-playing');
            });

            video.addEventListener('pause', function () {
                if (!video.ended) {
                    root.classList.remove('is-playing');
                }
            });

            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                } else {
                    video.pause();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    });
})();
