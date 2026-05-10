const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('visible'));
}

const nav = document.querySelector('.nav');

if (nav) {
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 50
      ? 'rgba(255,255,255,0.95)'
      : 'rgba(246,251,247,0.86)';
  }, { passive: true });
}

const scrollToTarget = (selector) => {
  const target = document.querySelector(selector);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
};

document.querySelectorAll('[data-scroll-target]').forEach((button) => {
  button.addEventListener('click', () => {
    scrollToTarget(button.dataset.scrollTarget);
  });
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const href = anchor.getAttribute('href');
    if (href && href.length > 1) {
      const target = document.querySelector(href);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

const accessModal = document.querySelector('#access-modal');
const accessForm = document.querySelector('#access-form');
const accessMessage = accessForm ? accessForm.querySelector('.access-message') : null;

const showAccessModal = () => {
  if (accessModal) {
    accessModal.classList.remove('hidden');
  }
  document.body.classList.add('modal-open');
  if (accessForm) {
    const firstInput = accessForm.querySelector('#access-name');
    if (firstInput) {
      firstInput.focus();
    }
  }
};

const hideAccessModal = () => {
  if (accessModal) {
    accessModal.classList.add('hidden');
  }
  document.body.classList.remove('modal-open');
};

const unlockPage = () => {
  hideAccessModal();
  localStorage.setItem('pageAccessGranted', 'true');
};

if (localStorage.getItem('pageAccessGranted') === 'true') {
  hideAccessModal();
} else {
  showAccessModal();
}

if (accessForm) {
  accessForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = accessForm.querySelector('#access-name').value.trim();
    const whatsapp = accessForm.querySelector('#access-whatsapp').value.trim();
    const email = accessForm.querySelector('#access-email').value.trim();

    if (!name || !whatsapp || !email) {
      if (accessMessage) {
        accessMessage.textContent = 'Preencha nome, telefone e e-mail para acessar a página.';
      }
      return;
    }

    unlockPage();
  });
}
