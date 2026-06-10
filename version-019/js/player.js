(function () {
    window.startMoviePlayer = function (source) {
        var shell = document.querySelector('.player-shell');
        if (!shell) {
            return;
        }

        var video = shell.querySelector('video');
        var cover = shell.querySelector('.player-cover');
        var hls = null;
        var attached = false;

        function playVideo() {
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {});
            }
        }

        function attachSource() {
            if (attached) {
                return;
            }
            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
            } else {
                video.src = source;
            }
        }

        function start() {
            attachSource();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            video.controls = true;
            playVideo();
        }

        if (cover) {
            cover.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.paused || video.ended) {
                start();
            }
        });

        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
})();
