/* ==========================================================================
   Dr. Gandhi Dental Clinic - Development Replica Animation & Interaction Engine
   ========================================================================== */

(function () {
  "use strict";

  // 1. Preloader Fadeout
  function hidePreloader() {
    const preloader = document.getElementById("preloader");
    if (preloader && !preloader.classList.contains("loaded")) {
      preloader.classList.add("loaded");
    }
  }

  window.addEventListener("load", () => {
    setTimeout(hidePreloader, 350);
  });
  // Fallback safety timeout
  setTimeout(hidePreloader, 2200);

  // 2. Sticky Header Behavior (hide on initial scroll, slide-in glass header after 500px)
  const headerSticky = document.querySelector(".header-sticky");
  const mainHeader = document.getElementById("navbar");

  function handleStickyHeader() {
    if (!headerSticky || !mainHeader) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const headerHeight = mainHeader.offsetHeight || 75;

    if (scrollTop > 520) {
      headerSticky.classList.remove("hide");
      headerSticky.classList.add("active");
    } else if (scrollTop > headerHeight + 100) {
      headerSticky.classList.remove("active");
      headerSticky.classList.add("hide");
    } else {
      headerSticky.classList.remove("active", "hide");
    }
  }

  window.addEventListener("scroll", handleStickyHeader, { passive: true });
  handleStickyHeader();

  // 3. Mobile Navigation Drawer
  const navToggle = document.getElementById("navbarToggle");
  const mobileMenu = document.getElementById("responsiveMenu");

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      const icon = navToggle.querySelector("i");
      if (icon) {
        icon.className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
      }
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        const icon = navToggle.querySelector("i");
        if (icon) icon.className = "fa-solid fa-bars";
      });
    });
  }

  // 4. GSAP + ScrollTrigger Animations
  function initGsapAnimations() {
    if (typeof gsap === "undefined") {
      // Fallback if GSAP CDN unavailable
      document.querySelectorAll(".reveal").forEach((el) => {
        el.style.visibility = "visible";
      });
      return;
    }

    if (typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    // 4a. Text Split Character-by-Character Reveal (.text-anime-style-2)
    document.querySelectorAll(".text-anime-style-2").forEach((heading) => {
      const chars = [];

      function processNode(node, parent) {
        if (node.nodeType === Node.TEXT_NODE) {
          const tokens = node.textContent.split(/(\s+)/);
          tokens.forEach((token) => {
            if (!token) return;
            if (/^\s+$/.test(token)) {
              parent.appendChild(document.createTextNode(" "));
            } else {
              const wordSpan = document.createElement("span");
              wordSpan.className = "split-word";
              for (const ch of token) {
                const charSpan = document.createElement("span");
                charSpan.className = "split-char";
                charSpan.textContent = ch;
                wordSpan.appendChild(charSpan);
                chars.push(charSpan);
              }
              parent.appendChild(wordSpan);
            }
          });
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const clone = document.createElement(node.tagName);
          Array.from(node.attributes).forEach((attr) =>
            clone.setAttribute(attr.name, attr.value)
          );
          Array.from(node.childNodes).forEach((child) =>
            processNode(child, clone)
          );
          parent.appendChild(clone);
        }
      }

      const fragment = document.createDocumentFragment();
      Array.from(heading.childNodes).forEach((child) =>
        processNode(child, fragment)
      );
      heading.innerHTML = "";
      heading.appendChild(fragment);

      if (chars.length > 0) {
        gsap.from(chars, {
          duration: 0.9,
          delay: 0.08,
          x: 20,
          autoAlpha: 0,
          stagger: 0.025,
          ease: "power2.out",
          scrollTrigger: {
            trigger: heading,
            start: "top 88%",
            once: true,
          },
        });
      }
    });

    // 4b. Image Curtain Reveal (.image-anime.reveal)
    document.querySelectorAll(".image-anime.reveal").forEach((container) => {
      const image = container.querySelector("img");
      if (!image) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 85%",
          once: true,
        },
      });

      tl.set(container, { autoAlpha: 1 });
      tl.from(container, {
        xPercent: -100,
        duration: 1,
        ease: "power2.out",
      });
      tl.from(
        image,
        {
          xPercent: 100,
          scale: 1.15,
          duration: 1,
          ease: "power2.out",
        },
        "<"
      );
    });

    // 4c. Custom Magic Cursor (.cb-cursor)
    const cursor = document.querySelector(".cb-cursor");
    if (cursor && window.matchMedia("(hover: hover)").matches) {
      const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      const setX = gsap.quickTo(cursor, "x", { duration: 0.45, ease: "expo.out" });
      const setY = gsap.quickTo(cursor, "y", { duration: 0.45, ease: "expo.out" });

      window.addEventListener("mousemove", (e) => {
        pos.x = e.clientX;
        pos.y = e.clientY;
        cursor.classList.add("-visible");
        setX(pos.x);
        setY(pos.y);
      });

      document.addEventListener("mouseleave", () => {
        cursor.classList.remove("-visible");
      });

      document.addEventListener("mousedown", () => cursor.classList.add("-active"));
      document.addEventListener("mouseup", () => cursor.classList.remove("-active"));

      const interactiveSelector = "a, button, .service-item, .team-member-item, .blog-card";
      document.querySelectorAll(interactiveSelector).forEach((el) => {
        el.addEventListener("mouseenter", () => cursor.classList.add("-pointer"));
        el.addEventListener("mouseleave", () => cursor.classList.remove("-pointer"));
      });
    }
  }

  // 5. WOW Staggered Scroll Reveals (.wow-item)
  function initWowReveals() {
    const items = document.querySelectorAll(".wow-item");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("animated"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseFloat(el.dataset.delay || "0") * 1000;
            setTimeout(() => {
              el.classList.add("animated");
            }, delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach((el) => observer.observe(el));
  }

  // 6. Animated Counters (.counter)
  function initCounters() {
    const counters = document.querySelectorAll(".counter");
    if (!counters.length) return;

    function animateCounter(el) {
      const target = parseInt(el.dataset.target || "0", 10);
      const duration = 2200;
      const startTime = performance.now();

      function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
        const current = Math.round(eased * target);
        el.textContent = current.toLocaleString("en-US");
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = target.toLocaleString("en-US");
        }
      }

      requestAnimationFrame(update);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );

    counters.forEach((el) => observer.observe(el));
  }

  // 7. Parallax Banner (.visit-clinic.parallaxie)
  function initParallax() {
    const parallaxEl = document.querySelector(".visit-clinic.parallaxie");
    if (!parallaxEl) return;

    function updateParallax() {
      if (window.innerWidth <= 991) {
        parallaxEl.style.backgroundPosition = "center center";
        return;
      }
      const rect = parallaxEl.getBoundingClientRect();
      const speed = 0.32;
      const offset = (rect.top - window.innerHeight / 2) * speed;
      parallaxEl.style.backgroundPosition = `center calc(50% + ${offset.toFixed(1)}px)`;
    }

    window.addEventListener("scroll", updateParallax, { passive: true });
    window.addEventListener("resize", updateParallax, { passive: true });
    updateParallax();
  }

  // 8. Virtual Clinic 360 Tour Modal
  function initVideoModal() {
    const openBtn = document.getElementById("openTourBtn");
    const modal = document.getElementById("videoModal");
    const closeBtn = document.getElementById("closeTourBtn");
    const iframe = document.getElementById("tourIframe");
    const tourUrl = "https://drgandhidental.smartwalk.io/";

    if (!openBtn || !modal || !closeBtn || !iframe) return;

    function openModal(e) {
      e.preventDefault();
      iframe.src = tourUrl;
      modal.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      modal.classList.remove("open");
      document.body.style.overflow = "";
      setTimeout(() => {
        iframe.src = "";
      }, 300);
    }

    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });
  }

  // 9. Floating WhatsApp Widget
  function initWhatsAppWidget() {
    const toggleBtn = document.getElementById("waToggleBtn");
    const popup = document.getElementById("waPopup");
    const closeBtn = document.getElementById("waCloseBtn");

    if (!toggleBtn || !popup || !closeBtn) return;

    toggleBtn.addEventListener("click", () => {
      popup.classList.toggle("open");
    });

    closeBtn.addEventListener("click", () => {
      popup.classList.remove("open");
    });
  }

  // 10. Testimonials Slider (treatments.html)
  function initTestimonialsSlider() {
    const slides = document.querySelectorAll(".testimonial-slide");
    const prevBtn = document.getElementById("testimonialPrev");
    const nextBtn = document.getElementById("testimonialNext");
    if (!slides.length) return;

    let current = 0;

    function showSlide(index) {
      slides[current].classList.remove("active");
      current = (index + slides.length) % slides.length;
      slides[current].classList.add("active");
    }

    if (prevBtn) prevBtn.addEventListener("click", () => showSlide(current - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => showSlide(current + 1));

    setInterval(() => showSlide(current + 1), 6500);
  }

  // 11. Buttery Smooth Scroll (Lenis + GSAP ScrollTrigger sync + Progress Bar + Back-to-Top)
  function initSmoothScroll() {
    // Inject top scroll progress bar
    const progressBar = document.createElement("div");
    progressBar.className = "scroll-progress-bar";
    progressBar.setAttribute("aria-hidden", "true");
    document.body.appendChild(progressBar);

    // Inject Back-to-Top button
    const topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "scroll-top-btn";
    topBtn.setAttribute("aria-label", "Back to top");
    topBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    document.body.appendChild(topBtn);

    let lenis = null;

    if (typeof Lenis !== "undefined") {
      lenis = new Lenis({
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
      });

      if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => {
          lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
      } else {
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }
    }

    function updateScrollUI() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      progressBar.style.width = pct.toFixed(2) + "%";

      if (scrollTop > 420) {
        topBtn.classList.add("visible");
      } else {
        topBtn.classList.remove("visible");
      }
    }

    if (lenis) {
      lenis.on("scroll", updateScrollUI);
    } else {
      window.addEventListener("scroll", updateScrollUI, { passive: true });
    }
    updateScrollUI();

    topBtn.addEventListener("click", () => {
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.4 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    // Smooth scroll for same-page hash links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(target, { offset: -75, duration: 1.2 });
          } else {
            target.scrollIntoView({ behavior: "smooth" });
          }
        }
      });
    });
  }

  // Initialize Everything on DOM Ready
  document.addEventListener("DOMContentLoaded", () => {
    initSmoothScroll();
    initGsapAnimations();
    initWowReveals();
    initCounters();
    initParallax();
    initVideoModal();
    initWhatsAppWidget();
    initTestimonialsSlider();
  });
})();
