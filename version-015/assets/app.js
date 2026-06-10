(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var expanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', String(!expanded));
            mobilePanel.hidden = expanded;
            menuButton.textContent = expanded ? '☰' : '×';
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
        var nextButton = hero.querySelector('[data-hero-next]');
        var prevButton = hero.querySelector('[data-hero-prev]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
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

            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle('is-active', thumbIndex === current);
            });
        }

        function restartTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restartTimer();
            });
        });

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('mouseenter', function () {
                showSlide(Number(thumb.getAttribute('data-hero-thumb')) || 0);
                restartTimer();
            });
        });

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                showSlide(current + 1);
                restartTimer();
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                showSlide(current - 1);
                restartTimer();
            });
        }

        showSlide(0);
        restartTimer();
    }

    var filterBar = document.querySelector('[data-filter-bar]');
    var grid = document.querySelector('[data-movie-grid]');

    if (filterBar && grid) {
        var input = filterBar.querySelector('[data-filter-input]');
        var typeSelect = filterBar.querySelector('[data-type-filter]');
        var sortSelect = filterBar.querySelector('[data-sort-filter]');
        var originalCards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

        function typeMatches(card, filterValue) {
            if (!filterValue) {
                return true;
            }

            return (card.getAttribute('data-type') || '').indexOf(filterValue) !== -1;
        }

        function textMatches(card, keyword) {
            if (!keyword) {
                return true;
            }

            var text = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-type') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-tags') || '',
                card.textContent || ''
            ].join(' ').toLowerCase();

            return text.indexOf(keyword) !== -1;
        }

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var typeValue = typeSelect ? typeSelect.value : '';
            var cards = originalCards.slice();

            if (sortSelect && sortSelect.value === 'year-asc') {
                cards.sort(function (a, b) {
                    return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
                });
            } else if (sortSelect && sortSelect.value === 'title') {
                cards.sort(function (a, b) {
                    return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
                });
            } else {
                cards.sort(function (a, b) {
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                });
            }

            cards.forEach(function (card) {
                var visible = textMatches(card, keyword) && typeMatches(card, typeValue);
                card.classList.toggle('is-hidden-by-filter', !visible);
                grid.appendChild(card);
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (typeSelect) {
            typeSelect.addEventListener('change', applyFilter);
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', applyFilter);
        }

        applyFilter();
    }
})();
