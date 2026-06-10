(function () {
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get('q') || '').trim();
    var input = document.getElementById('searchInput');
    var title = document.getElementById('searchTitle');
    var desc = document.getElementById('searchDesc');
    var results = document.getElementById('searchResults');
    var movies = window.SEARCH_MOVIES || [];

    if (input) {
        input.value = keyword;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function movieCard(movie) {
        var tagHtml = (movie.tags || []).slice(0, 4).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card movie-card-compact">',
            '<a class="poster-link" href="./' + escapeHtml(movie.file) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
            '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.opacity=\'0\';">',
            '<span class="poster-play">▶</span>',
            '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<h3><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
            '<div class="tag-row">' + tagHtml + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    if (keyword && results) {
        var lower = keyword.toLowerCase();
        var matched = movies.filter(function (movie) {
            return [movie.title, movie.oneLine, movie.summary, movie.year, movie.region, movie.type, (movie.tags || []).join(' ')]
                .join(' ')
                .toLowerCase()
                .indexOf(lower) !== -1;
        }).slice(0, 120);

        if (title) {
            title.textContent = '“' + keyword + '”相关影片';
        }

        if (desc) {
            desc.textContent = matched.length ? '已匹配到相关条目，可点击进入影片详情页。' : '暂未匹配到相关条目，可尝试更换关键词。';
        }

        results.innerHTML = matched.length ? matched.map(movieCard).join('') : '';
    }
})();
