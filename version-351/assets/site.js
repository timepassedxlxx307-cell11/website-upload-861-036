(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    var keyword = document.querySelector('[data-filter="keyword"]');
    var year = document.querySelector('[data-filter="year"]');
    var type = document.querySelector('[data-filter="type"]');
    var region = document.querySelector('[data-filter="region"]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-item'));
    var empty = document.querySelector('.no-results');

    function matchValue(value, target) {
      return !value || target.indexOf(value) !== -1;
    }

    function filterCards() {
      if (!cards.length || !keyword) {
        return;
      }

      var q = keyword.value.trim().toLowerCase();
      var y = year ? year.value : '';
      var t = type ? type.value : '';
      var r = region ? region.value : '';
      var shown = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-category') || ''
        ].join(' ').toLowerCase();
        var ok = matchValue(q, text)
          && matchValue(y, card.getAttribute('data-year') || '')
          && matchValue(t, card.getAttribute('data-type') || '')
          && matchValue(r, card.getAttribute('data-region') || '');
        card.style.display = ok ? '' : 'none';
        if (ok) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    [keyword, year, type, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });
  });
}());
