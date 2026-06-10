(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeSlide = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeSlide);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(activeSlide + 1);
      }, 5200);
    }

    var grid = document.querySelector("[data-filter-grid]");
    var searchInput = document.querySelector("[data-movie-search]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var regionFilter = document.querySelector("[data-region-filter]");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var emptyState = document.querySelector("[data-empty-state]");

    if (grid) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
      var activeCategory = "all";
      var years = [];
      var regions = [];

      cards.forEach(function (card) {
        var year = card.getAttribute("data-year") || "";
        var region = card.getAttribute("data-region") || "";
        if (year && years.indexOf(year) === -1) {
          years.push(year);
        }
        if (region && regions.indexOf(region) === -1) {
          regions.push(region);
        }
      });

      years.sort(function (a, b) {
        return Number(b) - Number(a);
      });
      regions.sort();

      if (yearFilter) {
        years.forEach(function (year) {
          var option = document.createElement("option");
          option.value = year;
          option.textContent = year;
          yearFilter.appendChild(option);
        });
      }

      if (regionFilter) {
        regions.forEach(function (region) {
          var option = document.createElement("option");
          option.value = region;
          option.textContent = region;
          regionFilter.appendChild(option);
        });
      }

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && searchInput) {
        searchInput.value = query;
      }

      function applyFilters() {
        var text = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var selectedYear = yearFilter ? yearFilter.value : "all";
        var selectedRegion = regionFilter ? regionFilter.value : "all";
        var visible = 0;

        cards.forEach(function (card) {
          var search = (card.getAttribute("data-search") || "").toLowerCase();
          var siteCategory = card.getAttribute("data-site-category") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var cardRegion = card.getAttribute("data-region") || "";
          var matchText = !text || search.indexOf(text) !== -1;
          var matchCategory = activeCategory === "all" || siteCategory === activeCategory;
          var matchYear = selectedYear === "all" || cardYear === selectedYear;
          var matchRegion = selectedRegion === "all" || cardRegion === selectedRegion;
          var show = matchText && matchCategory && matchYear && matchRegion;
          card.style.display = show ? "" : "none";
          if (show) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle("is-visible", visible === 0);
        }
      }

      if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
      }
      if (yearFilter) {
        yearFilter.addEventListener("change", applyFilters);
      }
      if (regionFilter) {
        regionFilter.addEventListener("change", applyFilters);
      }
      filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeCategory = button.getAttribute("data-filter") || "all";
          filterButtons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          applyFilters();
        });
      });

      applyFilters();
    }
  });
})();
