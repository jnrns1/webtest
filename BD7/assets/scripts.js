/* Mark JS as available — CSS uses html.js to scope animations
   so .reveal only hides itself when it's confident JS will fire. */
document.documentElement.classList.add('js');

/* Sticky nav state */
(function(){
  var nav = document.getElementById('nav');
  if (!nav) return;
  var onScroll = function(){
    if (window.scrollY > 8) nav.classList.add('is-stuck');
    else nav.classList.remove('is-stuck');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* Reveal on scroll */
(function(){
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  /* Safety net: anything not yet flagged visible after 2s gets shown anyway.
     Protects against preview iframes that don't fire IntersectionObserver. */
  var safety = setTimeout(function(){
    els.forEach(function(el){ el.classList.add('is-visible'); });
  }, 2000);

  if (typeof IntersectionObserver === 'undefined') {
    els.forEach(function(el){ el.classList.add('is-visible'); });
    clearTimeout(safety);
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  els.forEach(function(el){ io.observe(el); });
})();

/* Nav dropdowns — keyboard accessibility + mobile click-to-open
   (CSS :hover already handles desktop pointer interactions) */
(function(){
  var items = document.querySelectorAll('.nav__item');
  if (!items.length) return;

  var isCoarse = matchMedia('(hover: none), (max-width: 880px)').matches;

  items.forEach(function(item){
    var trigger = item.querySelector(':scope > a');
    var dd = item.querySelector(':scope > .nav__dropdown');
    if (!trigger || !dd) return;

    /* If the trigger is just an anchor placeholder ("#"), the click should
       open the dropdown rather than navigate. */
    var isPlaceholder = trigger.getAttribute('href') === '#';

    trigger.addEventListener('click', function(e){
      if (isCoarse || isPlaceholder) {
        e.preventDefault();
        items.forEach(function(o){ if (o !== item) o.classList.remove('is-open'); });
        item.classList.toggle('is-open');
      }
    });

    /* Keyboard: Enter/Space opens dropdown (when trigger is placeholder),
       Escape closes any open dropdown and refocuses the trigger. */
    trigger.addEventListener('keydown', function(e){
      if ((e.key === 'Enter' || e.key === ' ') && isPlaceholder) {
        e.preventDefault();
        item.classList.toggle('is-open');
        if (item.classList.contains('is-open')) {
          var first = dd.querySelector('a');
          if (first) first.focus();
        }
      }
    });

    dd.addEventListener('keydown', function(e){
      if (e.key === 'Escape') {
        item.classList.remove('is-open');
        trigger.focus();
      }
    });
  });

  /* Click outside any dropdown closes them all */
  document.addEventListener('click', function(e){
    if (!e.target.closest('.nav__item')) {
      items.forEach(function(o){ o.classList.remove('is-open'); });
    }
  });
})();

/* Mobile hamburger toggle */
(function(){
  var btn = document.querySelector('.nav__menu');
  var links = document.querySelector('.nav__links');
  if (!btn || !links) return;
  btn.addEventListener('click', function(){
    var open = links.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();

/* Stat count-up */
(function(){
  var prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stats = document.querySelectorAll('.stat .v[data-count], .feature__chip [data-count]');
  if (prefersReduced || !stats.length) return;

  function animate(el){
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.querySelector('small');
    var suffixHTML = suffix ? suffix.outerHTML : '';
    var start = performance.now(); var dur = 1200;
    function tick(t){
      var p = Math.min(1, (t - start)/dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = Math.round(target * eased);
      el.innerHTML = v + suffixHTML;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (typeof IntersectionObserver === 'undefined') {
    stats.forEach(animate); return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  stats.forEach(function(el){ io.observe(el); });
})();
