(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var nextButton = document.querySelector('[data-hero-next]');
  var prevButton = document.querySelector('[data-hero-prev]');
  var current = 0;
  var timer = null;

  function setSlide(index) {
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
    if (!slides.length) {
      return;
    }
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      setSlide(current + 1);
    }, 5200);
  }

  if (slides.length) {
    setSlide(0);
    schedule();
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        setSlide(current + 1);
        schedule();
      });
    }
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        setSlide(current - 1);
        schedule();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot'));
        setSlide(index);
        schedule();
      });
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  var searchBoxes = Array.prototype.slice.call(document.querySelectorAll('[data-search-box]'));
  searchBoxes.forEach(function (input) {
    var scopeId = input.getAttribute('data-search-scope');
    var scope = scopeId ? document.getElementById(scopeId) : document;
    var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]')) : [];

    input.addEventListener('input', function () {
      var keyword = normalize(input.value);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.textContent
        ].join(' '));
        card.classList.toggle('is-filtered', keyword && haystack.indexOf(keyword) === -1);
      });
    });
  });
}());
