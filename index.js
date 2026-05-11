(() => {
  const doc = document;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const accessKey = 'sitimiPageAccessGranted';

  const select = (selector, scope = doc) => scope.querySelector(selector);
  const selectAll = (selector, scope = doc) => Array.from(scope.querySelectorAll(selector));

  const storage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        return false;
      }
      return true;
    },
  };

  const scrollToSelector = (selector) => {
    if (!selector || selector === '#') return false;

    try {
      const target = select(selector);
      if (!target) return false;

      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });

      return true;
    } catch {
      return false;
    }
  };

  const initRevealAnimations = () => {
    const revealElements = selectAll('.reveal');
    if (!revealElements.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealElements.forEach((element) => element.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add('visible');
          currentObserver.unobserve(entry.target);
        });
      },
      {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.12,
      },
    );

    revealElements.forEach((element) => observer.observe(element));
  };

  const initHeaderState = () => {
    const header = select('[data-header]');
    if (!header) return;

    let ticking = false;

    const updateHeader = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
      ticking = false;
    };

    updateHeader();

    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;

        ticking = true;
        window.requestAnimationFrame(updateHeader);
      },
      { passive: true },
    );
  };

  const initNavigation = () => {
    const toggle = select('[data-nav-toggle]');
    const menu = select('[data-nav-menu]');

    const closeMenu = () => {
      if (!toggle || !menu) return;

      toggle.classList.remove('is-open');
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
      doc.body.classList.remove('menu-open');
    };

    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';

        toggle.classList.toggle('is-open', !isOpen);
        menu.classList.toggle('is-open', !isOpen);
        toggle.setAttribute('aria-expanded', String(!isOpen));
        toggle.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
        doc.body.classList.toggle('menu-open', !isOpen);
      });

      doc.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth > 920) closeMenu();
      });
    }

    doc.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-scroll-target], a[href^="#"]');
      if (!trigger) return;

      const selector = trigger.dataset.scrollTarget || trigger.getAttribute('href');
      const didScroll = scrollToSelector(selector);

      if (didScroll) {
        event.preventDefault();
        closeMenu();
      }
    });
  };

  const initAccessModal = () => {
    const modal = select('[data-access-modal]');
    const form = select('[data-access-form]');
    const message = select('[data-access-message]', form || doc);

    if (!modal || !form) return;

    const setMessage = (text, isError = false) => {
      if (!message) return;

      message.textContent = text;
      message.classList.toggle('is-error', isError);
    };

    const hideModal = () => {
      modal.classList.add('is-hidden');
      modal.setAttribute('aria-hidden', 'true');
      doc.body.classList.remove('modal-open');
    };

    const showModal = () => {
      modal.classList.remove('is-hidden');
      modal.removeAttribute('aria-hidden');
      doc.body.classList.add('modal-open');

      window.requestAnimationFrame(() => {
        select('#access-name', form)?.focus();
      });
    };

    if (storage.get(accessKey) === 'true' || storage.get('pageAccessGranted') === 'true') {
      hideModal();
    } else {
      showModal();
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        setMessage('Preencha nome, telefone e e-mail para acessar a página.', true);
        form.reportValidity();
        return;
      }

      storage.set(accessKey, 'true');
      storage.set('pageAccessGranted', 'true');
      setMessage('');
      hideModal();
    });
  };

  initRevealAnimations();
  initHeaderState();
  initNavigation();
  initAccessModal();
})();
