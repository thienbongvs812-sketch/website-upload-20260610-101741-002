(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('#mobileNav');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
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
    }

    function schedule() {
        if (timer) {
            window.clearInterval(timer);
        }
        if (slides.length > 1) {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
            schedule();
        });
    });

    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(current - 1);
            schedule();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            schedule();
        });
    }

    showSlide(0);
    schedule();

    document.querySelectorAll('[data-site-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (input && input.value.trim()) {
                form.action = './search.html';
            } else if (input) {
                event.preventDefault();
                input.focus();
            }
        });
    });

    var searchInput = document.querySelector('[data-search-input]');
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-list .movie-card'));

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var filters = {};

        filterSelects.forEach(function (select) {
            var name = select.getAttribute('data-filter-select');
            filters[name] = select.value;
        });

        cards.forEach(function (card) {
            var text = card.getAttribute('data-search') || '';
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchYear = !filters.year || card.getAttribute('data-year') === filters.year;
            var matchType = !filters.type || card.getAttribute('data-type') === filters.type;
            card.hidden = !(matchQuery && matchYear && matchType);
        });
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            searchInput.value = q;
        }
        searchInput.addEventListener('input', applyFilters);
    }

    filterSelects.forEach(function (select) {
        select.addEventListener('change', applyFilters);
    });

    applyFilters();
})();
