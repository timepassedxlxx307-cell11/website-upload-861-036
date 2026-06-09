import { H as Hls } from "./hls.js";

export function startMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var button = document.getElementById(options.buttonId);
  var ready = false;
  var hls = null;

  if (!video || !button || !options.m3u8) {
    return;
  }

  function prepare() {
    if (ready) {
      return Promise.resolve();
    }

    ready = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = options.m3u8;
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(options.m3u8);
      hls.attachMedia(video);
      return new Promise(function (resolve) {
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        window.setTimeout(resolve, 900);
      });
    }

    video.src = options.m3u8;
    return Promise.resolve();
  }

  function play() {
    button.classList.add("is-hidden");
    video.controls = true;
    prepare().then(function () {
      var started = video.play();
      if (started && typeof started.catch === "function") {
        started.catch(function () {});
      }
    });
  }

  button.addEventListener("click", play);
  video.addEventListener("click", function () {
    if (!ready || video.paused) {
      play();
    }
  });
  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
  });
}
