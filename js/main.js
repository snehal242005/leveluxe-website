(function () {
  'use strict';

  /* ── Navbar scroll ── */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const tick = () => navbar.classList.toggle('scrolled', window.scrollY > 80);
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  /* ── Active nav link ── */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-drawer a').forEach(a => {
    const h = a.getAttribute('href');
    a.classList.toggle('active', h === page || (page === '' && h === 'index.html'));
  });

  /* ── Hamburger ── */
  const ham = document.querySelector('.hamburger');
  const drawer = document.querySelector('.nav-drawer');
  if (ham && drawer) {
    ham.addEventListener('click', () => {
      const open = drawer.classList.toggle('open');
      ham.classList.toggle('open', open);
      ham.setAttribute('aria-expanded', open);
    });
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        drawer.classList.remove('open');
        ham.classList.remove('open');
        ham.setAttribute('aria-expanded', false);
      });
    });
    document.addEventListener('click', e => {
      if (!navbar.contains(e.target) && !drawer.contains(e.target)) {
        drawer.classList.remove('open');
        ham.classList.remove('open');
        ham.setAttribute('aria-expanded', false);
      }
    });
  }

  /* ── Scroll reveal ── */
  const revEls = document.querySelectorAll('.reveal');
  if (revEls.length) {
    const ro = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          setTimeout(() => en.target.classList.add('visible'), +en.target.dataset.delay || 0);
          ro.unobserve(en.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

    revEls.forEach((el, i) => {
      if (!el.dataset.delay) {
        const sibs = Array.from(el.parentElement?.querySelectorAll('.reveal') || []);
        el.dataset.delay = sibs.indexOf(el) * 80;
      }
      ro.observe(el);
    });
  }

  /* ── Smooth scroll anchors ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }); }
    });
  });

  /* ── Course level tabs ── */
  document.querySelectorAll('.course-detail-tabs').forEach(group => {
    const tabs = group.querySelectorAll('.level-tab');
    const block = group.closest('.course-block') || group.parentElement;
    const panels = block?.querySelectorAll('.level-panel') || [];
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        block?.querySelector(`.level-panel[data-level="${tab.dataset.level}"]`)?.classList.add('active');
      });
    });
  });

  /* ── Schedule pill filters ── */
  const schedTable = document.getElementById('schedule-table');
  if (schedTable) {
    const rows = Array.from(schedTable.querySelectorAll('tbody tr[data-course]'));
    let activeCourse = '', activeBranch = '';

    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const type = pill.dataset.type;
        const val  = pill.dataset.value;

        if (type === 'all') {
          activeCourse = ''; activeBranch = '';
          document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
        } else {
          document.querySelectorAll(`.filter-pill[data-type="${type}"]`).forEach(p => p.classList.remove('active'));
          document.querySelector('.filter-pill[data-type="all"]')?.classList.remove('active');
          pill.classList.add('active');
          if (type === 'course') activeCourse = val;
          if (type === 'branch') activeBranch = val;
        }

        let any = false;
        rows.forEach(row => {
          const m = (!activeCourse || row.dataset.course === activeCourse) &&
                    (!activeBranch || row.dataset.branch === activeBranch);
          row.classList.toggle('hidden-row', !m);
          if (m) any = true;
        });
        const nr = document.getElementById('no-results');
        if (nr) nr.style.display = any ? 'none' : 'table-row';
      });
    });

    /* colour spots badges */
    schedTable.querySelectorAll('[data-spots]').forEach(el => {
      const n = parseInt(el.dataset.spots);
      el.className = n <= 2 ? 'spots-full' : 'spots-ok';
      el.textContent = n <= 2 ? `${n} — Almost Full` : `${n} Spots Left`;
    });
  }

  /* ── Course Know More expand panels ── */
  const knowBtns = document.querySelectorAll('[data-knowmore]');
  if (knowBtns.length) {
    let openPanel = null, openBtn = null;
    knowBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = document.getElementById(btn.dataset.knowmore);
        if (!panel) return;
        const isOpen = panel.classList.contains('open');
        if (openPanel && openPanel !== panel) {
          openPanel.classList.remove('open');
          openPanel.setAttribute('aria-hidden', 'true');
          if (openBtn) { openBtn.textContent = 'Know More'; openBtn.classList.remove('open'); openBtn.setAttribute('aria-expanded', 'false'); }
        }
        if (!isOpen) {
          panel.classList.add('open');
          panel.setAttribute('aria-hidden', 'false');
          btn.textContent = 'Close ✕';
          btn.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
          openPanel = panel; openBtn = btn;
          setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
        } else {
          panel.classList.remove('open');
          panel.setAttribute('aria-hidden', 'true');
          btn.textContent = 'Know More';
          btn.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
          openPanel = null; openBtn = null;
        }
      });
    });
  }

  /* ── Enroll form ── */
  const form = document.getElementById('enroll-form');
  if (form) {
    const success = document.getElementById('form-success');
    const validate = inp => {
      const v = inp.value.trim();
      let err = '';
      if (inp.required && !v) err = 'This field is required.';
      else if (inp.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) err = 'Enter a valid email.';
      else if (inp.type === 'tel'   && v && !/^[+]?[\d\s\-]{7,15}$/.test(v))       err = 'Enter a valid phone number.';
      inp.classList.toggle('error', !!err);
      let el = inp.nextElementSibling;
      if (err) {
        if (!el || !el.classList.contains('field-error')) { el = Object.assign(document.createElement('span'), { className: 'field-error' }); inp.insertAdjacentElement('afterend', el); }
        el.textContent = err;
      } else if (el?.classList.contains('field-error')) el.remove();
      return !err;
    };
    form.querySelectorAll('.form-control').forEach(inp => {
      inp.addEventListener('blur', () => validate(inp));
      inp.addEventListener('input', () => { if (inp.classList.contains('error')) validate(inp); });
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll('.form-control').forEach(inp => { if (!validate(inp)) ok = false; });
      if (ok) { form.style.display = 'none'; success?.classList.add('show'); success?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });
  }
})();
