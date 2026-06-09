(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var video = document.getElementById('movie-player');
    var button = document.getElementById('player-cover');
    var hls = null;

    if (!video || !button) {
      return;
    }

    function start() {
      var streamUrl = video.getAttribute('data-play');

      if (!streamUrl) {
        return;
      }

      button.classList.add('is-hidden');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.getAttribute('src')) {
          video.setAttribute('src', streamUrl);
        }
        playVideo();
      } else if (window.Hls && window.Hls.isSupported()) {
        if (!hls) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        } else {
          playVideo();
        }
      } else {
        if (!video.getAttribute('src')) {
          video.setAttribute('src', streamUrl);
        }
        playVideo();
      }
    }

    function playVideo() {
      var playback = video.play();
      if (playback && playback.catch) {
        playback.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  });
}());
