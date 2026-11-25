// One player interface over two sources: a YouTube embed (public videos, streamed from YouTube)
// or a local file (plays from the user's own computer). Nothing is ever uploaded or re-hosted.
window.AmpixaPlayer = (function () {
  let ytReady = null;
  function loadYT() {
    if (ytReady) return ytReady;
    ytReady = new Promise((res) => {
      if (window.YT && window.YT.Player) return res();
      window.onYouTubeIframeAPIReady = res;
      const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s);
    });
    return ytReady;
  }
  function ytId(text) {
    const m = String(text).match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || String(text).match(/^([\w-]{11})$/);
    return m ? m[1] : null;
  }

  // host: element to render into. Returns a promise of {time, seek, play, pause, paused, rate, duration, onTime, destroy}
  function youtube(host, id, opts = {}) {
    host.innerHTML = '<div class="yt-box"><div></div></div>';
    const el = host.querySelector('.yt-box > div');
    return loadYT().then(() => new Promise((res) => {
      let timer = null, cb = null;
      const p = new YT.Player(el, {
        videoId: id, width: '100%', height: '100%',
        playerVars: { start: Math.floor(opts.start || 0), rel: 0, modestbranding: 1, playsinline: 1, mute: opts.mute ? 1 : 0 },
        events: {
          onReady: () => {
            const api = {
              kind: 'youtube', id,
              time: () => p.getCurrentTime() || 0,
              seek: (t) => p.seekTo(Math.max(0, t), true),
              play: () => p.playVideo(), pause: () => p.pauseVideo(),
              paused: () => p.getPlayerState() !== YT.PlayerState.PLAYING,
              rate: (r) => p.setPlaybackRate(r),
              duration: () => p.getDuration() || 0,
              onTime: (f) => { cb = f; },
              destroy: () => { clearInterval(timer); try { p.destroy(); } catch (e) {} },
            };
            timer = setInterval(() => {
              const t = api.time();
              if (opts.end != null && t >= opts.end) { if (opts.loop) api.seek(opts.start || 0); else api.pause(); }
              cb && cb(t);
            }, 100);
            if (opts.autoplay) api.play();
            res(api);
          },
        },
      });
    }));
  }

  function local(host, file, opts = {}) {
    host.innerHTML = '<video controls playsinline></video>';
    const v = host.querySelector('video'); v.src = URL.createObjectURL(file);
    if (opts.loop) v.loop = true; if (opts.mute) v.muted = true;
    let cb = null;
    v.addEventListener('timeupdate', () => cb && cb(v.currentTime));
    const api = {
      kind: 'local', id: file.name + '_' + file.size, el: v,
      time: () => v.currentTime, seek: (t) => { v.currentTime = Math.max(0, t); },
      play: () => v.play().catch(() => {}), pause: () => v.pause(), paused: () => v.paused,
      rate: (r) => { v.playbackRate = r; }, duration: () => v.duration || 0,
      onTime: (f) => { cb = f; }, destroy: () => { URL.revokeObjectURL(v.src); },
    };
    if (opts.autoplay) api.play();
    return Promise.resolve(api);
  }
  return { youtube, local, ytId };
})();
