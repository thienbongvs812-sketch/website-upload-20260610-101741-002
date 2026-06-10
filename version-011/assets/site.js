function setupMobileMenu() {
  var button = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (!button || !panel) {
    return;
  }

  button.addEventListener('click', function () {
    panel.classList.toggle('is-open');
  });
}

function setupHero() {
  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  function show(index) {
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

  function start() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      show(index);
      window.clearInterval(timer);
      timer = null;
      start();
    });
  });

  show(0);
  start();
}

function setupMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var overlay = document.getElementById(options.overlayId);
  var hlsInstance = null;
  var hasLoaded = false;

  if (!video || !options.streamUrl) {
    return;
  }

  function loadStream() {
    if (hasLoaded) {
      return;
    }

    hasLoaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = options.streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(options.streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = options.streamUrl;
  }

  function play() {
    loadStream();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var playback = video.play();
    if (playback && typeof playback.catch === 'function') {
      playback.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

function setupLibraryFilter() {
  var form = document.querySelector('[data-library-filter]');
  var grid = document.querySelector('[data-library-grid]');

  if (!form || !grid) {
    return;
  }

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var keyword = (form.elements.keyword.value || '').trim().toLowerCase();
    var category = form.elements.category.value;

    cards.forEach(function (card) {
      var title = (card.getAttribute('data-title') || '').toLowerCase();
      var cardCategory = card.getAttribute('data-category') || '';
      var text = card.textContent.toLowerCase();
      var matchKeyword = !keyword || title.indexOf(keyword) !== -1 || text.indexOf(keyword) !== -1;
      var matchCategory = !category || cardCategory === category;
      card.hidden = !(matchKeyword && matchCategory);
    });
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createResultCard(item) {
  var article = document.createElement('article');
  var title = escapeHtml(item.title);
  var year = escapeHtml(item.year);
  var image = escapeHtml(item.image);
  var url = escapeHtml(item.url);
  var category = escapeHtml(item.category);
  var type = escapeHtml(item.type);
  var summary = escapeHtml(item.summary);
  var region = escapeHtml(item.region);

  article.className = 'movie-card';
  article.innerHTML = [
    '<a class="poster-wrap" href="' + url + '" aria-label="观看' + title + '">',
    '  <img src="' + image + '" alt="' + title + '" loading="lazy">',
    '  <span class="poster-badge">' + year + '</span>',
    '</a>',
    '<div class="movie-card-body">',
    '  <div class="tag-row"><span>' + category + '</span><span>' + type + '</span></div>',
    '  <h2><a href="' + url + '">' + title + '</a></h2>',
    '  <p>' + summary + '</p>',
    '  <div class="meta-line"><span>' + region + '</span><span>' + year + '</span></div>',
    '</div>'
  ].join('');
  return article;
}

function setupSearchPage() {
  var results = document.querySelector('[data-search-results]');
  var title = document.querySelector('[data-search-title]');
  var summary = document.querySelector('[data-search-summary]');
  var input = document.querySelector('.search-page-form input[name="q"]');

  if (!results || !window.MEDIA_ITEMS) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();

  if (input) {
    input.value = query;
  }

  if (!query) {
    return;
  }

  var lower = query.toLowerCase();
  var matched = window.MEDIA_ITEMS.filter(function (item) {
    return [item.title, item.summary, item.region, item.type, item.category, item.tags].join(' ').toLowerCase().indexOf(lower) !== -1;
  }).slice(0, 80);

  if (title) {
    title.textContent = '“' + query + '”的搜索结果';
  }

  if (summary) {
    summary.textContent = matched.length ? '以下影片可直接进入详情页观看。' : '没有找到匹配内容。';
  }

  results.innerHTML = '';

  if (!matched.length) {
    var empty = document.createElement('div');
    empty.className = 'empty-results';
    empty.textContent = '没有找到匹配内容';
    results.appendChild(empty);
    return;
  }

  matched.forEach(function (item) {
    results.appendChild(createResultCard(item));
  });
}

document.addEventListener('DOMContentLoaded', function () {
  setupMobileMenu();
  setupHero();
  setupLibraryFilter();
  setupSearchPage();
});
