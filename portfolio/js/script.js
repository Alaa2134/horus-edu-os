/* ============================================================
   Alaa Saber — Portfolio interactions
   ============================================================ */
(function () {
  'use strict';

  const html = document.documentElement;
  const STORAGE_KEY = 'as-lang';

  /* ---------- Language toggle ---------- */
  const langToggle = document.getElementById('langToggle');
  const langLabel = langToggle.querySelector('.lang-toggle__current');

  function applyLang(lang) {
    const isAr = lang === 'ar';
    html.lang = lang;
    html.dir = isAr ? 'rtl' : 'ltr';
    langLabel.textContent = isAr ? 'EN' : 'ع';

    document.querySelectorAll('[data-ar]').forEach((el) => {
      const val = el.getAttribute(isAr ? 'data-ar' : 'data-en');
      if (val !== null) el.textContent = val;
    });
    document.querySelectorAll('[data-ar-ph]').forEach((el) => {
      const val = el.getAttribute(isAr ? 'data-ar-ph' : 'data-en-ph');
      if (val !== null) el.setAttribute('placeholder', val);
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  langToggle.addEventListener('click', () => {
    applyLang(html.lang === 'ar' ? 'en' : 'ar');
  });

  let saved = 'ar';
  try { saved = localStorage.getItem(STORAGE_KEY) || 'ar'; } catch (e) {}
  applyLang(saved);

  /* ---------- Navbar scroll + mobile menu ---------- */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
    document.getElementById('toTop').classList.toggle('show', window.scrollY > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  navLinks.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    })
  );

  /* ---------- Avatar fallback if photo missing ---------- */
  const img = document.getElementById('profileImg');
  const avatar = img.closest('.avatar');
  img.addEventListener('error', () => avatar.classList.add('no-img'));
  if (img.complete && img.naturalWidth === 0) avatar.classList.add('no-img');

  /* ---------- Card cursor glow ---------- */
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(
    '.section__head, .about, .card, .skill-group, .contact__intro, .contact__form, .hero__text, .hero__visual'
  );
  revealEls.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Contact form (Formspree-ready) ---------- */
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  const submitBtn = document.getElementById('submitBtn');

  const t = (ar, en) => (html.lang === 'ar' ? ar : en);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const action = form.getAttribute('action') || '';

    // If Formspree endpoint not configured yet, fall back to mailto.
    if (action.includes('your-id')) {
      const name = encodeURIComponent(form.name.value);
      const msg = encodeURIComponent(form.message.value + '\n\n— ' + form.name.value + ' (' + form.email.value + ')');
      window.location.href = `mailto:alaa00saber@gmail.com?subject=${name}&body=${msg}`;
      return;
    }

    submitBtn.disabled = true;
    const original = submitBtn.textContent;
    submitBtn.textContent = t('جاري الإرسال...', 'Sending...');
    note.hidden = true;

    try {
      const res = await fetch(action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        note.textContent = t('تم إرسال رسالتك بنجاح! ✅', 'Your message was sent! ✅');
        note.className = 'form-note ok';
        form.reset();
      } else {
        throw new Error('send failed');
      }
    } catch (err) {
      note.textContent = t('حصل خطأ، جرّب تاني أو ابعتلي إيميل مباشرة.', 'Something went wrong, try again or email me directly.');
      note.className = 'form-note err';
    } finally {
      note.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = original;
    }
  });
})();
