(function () {
  "use strict";

  function text(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMobileNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var activeIndex = 0;
    var timer = null;

    function activate(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(activeIndex + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function initFilters() {
    Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var typeSelect = scope.querySelector("[data-filter-type]");
      var regionSelect = scope.querySelector("[data-filter-region]");
      var yearSelect = scope.querySelector("[data-filter-year]");
      var reset = scope.querySelector("[data-filter-reset]");
      var list = document.querySelector("[data-card-list]");
      var empty = document.querySelector("[data-empty-state]");
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]")) : [];

      if (!cards.length) {
        return;
      }

      var params = new URLSearchParams(window.location.search);
      var queryValue = params.get("q");
      if (queryValue && input) {
        input.value = queryValue;
      }

      function update() {
        var query = text(input && input.value);
        var typeValue = text(typeSelect && typeSelect.value);
        var regionValue = text(regionSelect && regionSelect.value);
        var yearValue = text(yearSelect && yearSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = text(card.getAttribute("data-search"));
          var cardType = text(card.getAttribute("data-type"));
          var cardRegion = text(card.getAttribute("data-region"));
          var cardYear = text(card.getAttribute("data-year"));
          var matched = true;

          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }
          if (typeValue && cardType !== typeValue) {
            matched = false;
          }
          if (regionValue && cardRegion !== regionValue) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }

          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, typeSelect, regionSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", update);
          control.addEventListener("change", update);
        }
      });

      if (reset) {
        reset.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (typeSelect) {
            typeSelect.value = "";
          }
          if (regionSelect) {
            regionSelect.value = "";
          }
          if (yearSelect) {
            yearSelect.value = "";
          }
          update();
        });
      }

      update();
    });
  }

  window.initMoviePlayer = function (videoId, source, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hls = null;
    var attached = false;

    if (!video || !source) {
      return;
    }

    function attach() {
      if (attached) {
        return Promise.resolve();
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          window.setTimeout(resolve, 1200);
        });
      }

      video.src = source;
      return Promise.resolve();
    }

    function play() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      attach().then(function () {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      });
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initHero();
    initFilters();
  });
})();
