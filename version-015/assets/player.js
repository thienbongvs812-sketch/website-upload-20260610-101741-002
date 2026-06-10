(function () {
    var video = document.getElementById('movie-player');
    var cover = document.querySelector('.player-cover');
    var sourceElement = document.getElementById('video-source');

    if (!video || !sourceElement) {
        return;
    }

    var videoUrl = '';

    try {
        videoUrl = JSON.parse(sourceElement.textContent || '""');
    } catch (error) {
        videoUrl = (sourceElement.textContent || '').trim();
    }

    var attached = false;
    var hlsInstance = null;

    function attachVideo() {
        if (attached || !videoUrl) {
            return;
        }

        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(videoUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = videoUrl;
        }
    }

    function beginPlayback() {
        attachVideo();

        if (cover) {
            cover.classList.add('is-hidden');
        }

        video.controls = true;

        var playTask = video.play();

        if (playTask && typeof playTask.catch === 'function') {
            playTask.catch(function () {
                video.controls = true;
            });
        }
    }

    if (cover) {
        cover.addEventListener('click', beginPlayback);
    }

    video.addEventListener('click', function () {
        if (!attached) {
            beginPlayback();
        }
    });

    video.addEventListener('play', attachVideo);

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
