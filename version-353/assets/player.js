(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".player-start");

      if (!video || !button) {
        return;
      }

      var hlsUrl = video.getAttribute("data-hls");
      var attached = false;
      var hlsPlayer = null;

      function attachSource() {
        if (attached || !hlsUrl) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = hlsUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsPlayer = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsPlayer.loadSource(hlsUrl);
          hlsPlayer.attachMedia(video);
        } else {
          video.src = hlsUrl;
        }

        attached = true;
      }

      function startPlayback() {
        attachSource();
        button.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
        var result = video.play();

        if (result && typeof result.catch === "function") {
          result.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      }

      button.addEventListener("click", startPlayback);
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsPlayer) {
          hlsPlayer.destroy();
          hlsPlayer = null;
        }
      });
    });
  });
})();
