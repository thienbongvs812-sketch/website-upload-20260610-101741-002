const FilmSite = (() => {
  function setupMobileMenu() {
    const button = document.querySelector("[data-mobile-toggle]");
    const panel = document.querySelector("[data-mobile-menu]");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", () => {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    const slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    const prev = slider.querySelector("[data-hero-prev]");
    const next = slider.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => show(index + 1), 5500);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    if (prev) {
      prev.addEventListener("click", () => {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        show(index + 1);
        start();
      });
    }

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    const form = document.querySelector("[data-filter-form]");
    const list = document.querySelector("[data-card-list]");

    if (!form || !list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll(".movie-card"));
    const params = new URLSearchParams(window.location.search);
    const q = form.elements.q;
    const category = form.elements.category;
    const year = form.elements.year;
    const sort = form.elements.sort;

    if (q && params.get("q")) {
      q.value = params.get("q");
    }

    if (category && params.get("category")) {
      category.value = params.get("category");
    }

    if (year && params.get("year")) {
      year.value = params.get("year");
    }

    if (sort && params.get("sort")) {
      sort.value = params.get("sort");
    }

    const apply = () => {
      const query = q ? q.value.trim().toLowerCase() : "";
      const categoryValue = category ? category.value : "";
      const yearValue = year ? year.value : "";
      let visible = [];

      cards.forEach((card) => {
        const haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.category,
          card.textContent
        ].join(" ").toLowerCase();

        const matchQuery = !query || haystack.includes(query);
        const matchCategory = !categoryValue || card.dataset.category === categoryValue;
        const matchYear = !yearValue || card.dataset.year === yearValue;
        const matched = matchQuery && matchCategory && matchYear;

        card.hidden = !matched;

        if (matched) {
          visible.push(card);
        }
      });

      if (sort && sort.value !== "default") {
        visible.sort((a, b) => {
          if (sort.value === "latest") {
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          }

          return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
        });

        visible.forEach((card) => list.appendChild(card));
      }
    };

    form.addEventListener("input", apply);
    form.addEventListener("change", apply);
    apply();
  }

  function initPlayer(videoId, coverId, stream) {
    const video = document.getElementById(videoId);
    const cover = document.getElementById(coverId);

    if (!video || !cover || !stream) {
      return;
    }

    let hls = null;
    let ready = false;
    let requested = false;

    const tryPlay = () => {
      const result = video.play();

      if (result && typeof result.catch === "function") {
        result.catch(() => {});
      }
    };

    const load = () => {
      if (ready) {
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.attachMedia(video);
        hls.on(window.Hls.Events.MEDIA_ATTACHED, () => {
          hls.loadSource(stream);
        });
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          if (requested) {
            tryPlay();
          }
        });
        hls.on(window.Hls.Events.ERROR, (event, data) => {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
        return;
      }

      video.src = stream;
      video.load();
    };

    const start = () => {
      requested = true;
      cover.classList.add("is-hidden");
      load();
      tryPlay();
    };

    cover.addEventListener("click", start);
    video.addEventListener("click", () => {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", () => cover.classList.add("is-hidden"));

    window.addEventListener("beforeunload", () => {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });

  return {
    initPlayer
  };
})();
