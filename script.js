/**
 * script.js — Lógica Principal de Interactividad
 * Módulo: Desarrollo Web
 *
 * Este archivo controla:
 * 1. Canvas de fondo — Animación de puntos cayendo
 * 2. Cursor personalizado — Espada que sigue al mouse
 * 3. Navbar — Cambio de estilo al hacer scroll
 * 4. Menú móvil — Toggle del hamburger menu
 * 5. Navegación activa — Resaltar sección actual
 * 6. Contadores animados — Estadísticas del hero
 * 7. Barras de progreso — Tecnologías (IntersectionObserver)
 * 8. Animaciones on-scroll — Elementos que aparecen al llegar
 * 9. Año dinámico en el footer
 */

/* ================================================
   INICIALIZACIÓN
   Se ejecuta cuando el DOM está completamente cargado.
   Evita errores de "elemento no encontrado".
================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* Llama a todas las funciones de inicialización */
  initCanvas();           // Fondo con puntos cayendo
  initCursor();           // Cursor espada personalizado
  initNavbar();           // Cambio de navbar al scroll
  initMobileMenu();       // Menú hamburguesa
  initActiveNav();        // Navegación activa por sección
  initCounters();         // Contadores numéricos animados
  initProgressBars();     // Barras de progreso de tecnologías
  initScrollAnimations(); // Animaciones de entrada al scroll
  initFooterYear();       // Año actual en el footer

});


/* ================================================
   1. CANVAS — Animación de Puntos Cayendo
   
   Crea partículas (puntos grises) que caen desde
   arriba de la pantalla. Cada punto tiene:
   - Posición aleatoria X
   - Velocidad de caída aleatoria
   - Tamaño aleatorio
   - Opacidad aleatoria
   
   Cuando un punto sale de la pantalla por abajo,
   reaparece en la parte superior (efecto lluvia).
================================================ */
function initCanvas() {
  /* Obtiene el elemento canvas del HTML */
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return; /* Sale si no existe el elemento */

  /* Obtiene el contexto 2D para dibujar */
  const ctx = canvas.getContext('2d');

  /* Ajusta el canvas al tamaño de la ventana */
  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();

  /* Escucha cambios de tamaño de ventana para reajustar */
  window.addEventListener('resize', resizeCanvas);

  /* ── Configuración de las partículas ── */
  const PARTICLE_COUNT = 120; /* Cantidad de puntos en pantalla */
  const particles = [];       /* Array donde se guardan todos los puntos */

  /**
   * Clase Particle — representa un punto individual
   * Cada punto conoce su posición, velocidad y apariencia.
   */
  class Particle {
    constructor() {
      this.reset(true); /* Inicializa en posición aleatoria */
    }

    /**
     * reset() — Reinicia la posición del punto
     * @param {boolean} initial - Si es true, posición Y también aleatoria
     *                            Si es false, empieza en la parte superior
     */
    reset(initial = false) {
      /* Posición horizontal aleatoria */
      this.x = Math.random() * canvas.width;

      /* Posición vertical: aleatoria al inicio, en la cima al reiniciar */
      this.y = initial
        ? Math.random() * canvas.height
        : -10;

      /* Tamaño del punto entre 1 y 3 píxeles */
      this.size = Math.random() * 2 + 0.5;

      /* Velocidad de caída entre 0.5 y 2.5 px/frame */
      this.speed = Math.random() * 2 + 0.4;

      /* Opacidad aleatoria entre 0.1 y 0.5 */
      this.opacity = Math.random() * 0.4 + 0.08;

      /* Color del punto — escala de grises */
      const gray = Math.floor(Math.random() * 100 + 100); /* 100-200 */
      this.color = `rgb(${gray}, ${gray}, ${gray})`;

      /* Leve movimiento horizontal oscilante */
      this.drift = (Math.random() - 0.5) * 0.3;
    }

    /**
     * update() — Actualiza la posición del punto cada frame
     */
    update() {
      this.y += this.speed;   /* Mueve hacia abajo */
      this.x += this.drift;   /* Leve oscilación horizontal */

      /* Si el punto sale de la pantalla por abajo, reinicia arriba */
      if (this.y > canvas.height + 10) {
        this.reset(false); /* Reinicia sin posición aleatoria en Y */
      }
    }

    /**
     * draw() — Dibuja el punto en el canvas
     */
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle   = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /* Crea todos los puntos iniciales */
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  /**
   * animate() — Bucle principal de animación del canvas
   * Se llama ~60 veces por segundo con requestAnimationFrame.
   */
  function animate() {
    /* Limpia el canvas con un gris muy oscuro semitransparente */
    /* El alpha < 1 crea un efecto de estela suave */
    ctx.fillStyle = 'rgba(17, 17, 17, 0.25)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* Actualiza y dibuja cada partícula */
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    /* Solicita el siguiente frame de animación */
    requestAnimationFrame(animate);
  }

  /* Inicia el bucle de animación */
  animate();
}


/* ================================================
   2. CURSOR PERSONALIZADO — Espada ⚔
   
   Sigue la posición del mouse y mueve los elementos
   .cursor-sword y .cursor-trail a esas coordenadas.
   La estela tiene un retraso de movimiento para dar
   efecto de arrastre suave.
================================================ */
function initCursor() {
  const cursor      = document.getElementById('cursor');      /* Espada */
  const cursorTrail = document.getElementById('cursorTrail'); /* Estela circular */

  if (!cursor || !cursorTrail) return;

  /* Posición actual y objetivo para interpolación suave */
  let mouseX = 0, mouseY = 0;
  let trailX  = 0, trailY  = 0;

  /**
   * mousemove — Captura la posición del mouse en tiempo real
   * Mueve la espada directamente a la posición del cursor.
   */
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    /* Mueve la espada inmediatamente al cursor */
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  /**
   * animateTrail() — Anima la estela con interpolación
   * La estela sigue al cursor pero con retraso (lerp),
   * creando un efecto de "arrastre" fluido.
   */
  function animateTrail() {
    /* Interpolación lineal: mueve 15% de la distancia por frame */
    trailX += (mouseX - trailX) * 0.15;
    trailY += (mouseY - trailY) * 0.15;

    /* Posiciona la estela */
    cursorTrail.style.left = trailX + 'px';
    cursorTrail.style.top  = trailY + 'px';

    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  /**
   * mousedown / mouseup — Efecto visual al hacer click
   * La espada rota al hacer click para simular un golpe.
   */
  document.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-4px, -4px) rotate(-90deg) scale(0.9)';
    cursorTrail.style.transform = 'translate(-50%, -50%) scale(1.5)';
    cursorTrail.style.opacity   = '0.8';
  });

  document.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-4px, -4px) rotate(-45deg)';
    cursorTrail.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorTrail.style.opacity   = '0.5';
  });

  /**
   * Cuando el mouse pasa sobre un elemento interactivo (links, buttons),
   * la estela se agranda para indicar que es clickeable.
   */
  const interactives = document.querySelectorAll('a, button, .card, .tech-item');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorTrail.style.width     = '40px';
      cursorTrail.style.height    = '40px';
      cursorTrail.style.borderColor = 'var(--gold-light)';
    });
    el.addEventListener('mouseleave', () => {
      cursorTrail.style.width     = '20px';
      cursorTrail.style.height    = '20px';
      cursorTrail.style.borderColor = 'var(--gold)';
    });
  });
}


/* ================================================
   3. NAVBAR — Cambio de estilo al hacer scroll
   
   Cuando el usuario baja más de 50px, añade la
   clase "scrolled" al navbar que cambia su
   transparencia, padding y sombra via CSS.
================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  /**
   * scroll — Se dispara cada vez que el usuario hace scroll.
   * Añade o quita la clase "scrolled" según la posición.
   */
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');     /* Navbar compacto */
    } else {
      navbar.classList.remove('scrolled'); /* Navbar original */
    }
  });
}


/* ================================================
   4. MENÚ MÓVIL — Toggle del Hamburger Menu
   
   Al hacer click en el botón de menú hamburguesa,
   añade/quita la clase "open" al menú de navegación
   que lo desliza desde la derecha (CSS position fixed).
================================================ */
function initMobileMenu() {
  const toggle   = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  if (!toggle || !navLinks) return;

  /**
   * click en el botón hamburguesa — Abre/cierra el menú
   */
  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');

    /* Cambia el aria-label del botón para accesibilidad */
    const isOpen = navLinks.classList.contains('open');
    toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });

  /**
   * click en un link del menú — Cierra el menú automáticamente
   * Útil en móvil para cerrar el panel al navegar.
   */
  navLinks.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });

  /**
   * click fuera del menú — Cierra si se hace click en el overlay
   */
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });
}


/* ================================================
   5. NAVEGACIÓN ACTIVA — Resaltar sección visible
   
   Usa IntersectionObserver para detectar qué sección
   es la más visible en la pantalla y marca el
   link de navegación correspondiente como "active".
================================================ */
function initActiveNav() {
  const navItems  = document.querySelectorAll('.nav-item[data-section]');
  const sections  = document.querySelectorAll('section[id]');

  if (!navItems.length || !sections.length) return;

  /**
   * IntersectionObserver — Observa cuándo cada sección
   * entra o sale del área visible del viewport.
   * threshold: 0.3 significa que al menos el 30% de la
   * sección debe ser visible para considerarla "activa".
   */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        /* Quita la clase activa de todos los items */
        navItems.forEach(item => item.classList.remove('active'));

        /* Añade la clase activa al item que corresponde a la sección */
        const activeLink = document.querySelector(
          `.nav-item[data-section="${entry.target.id}"]`
        );
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, {
    threshold: 0.3,      /* 30% de la sección debe ser visible */
    rootMargin: '-80px 0px -20% 0px' /* Descuenta el navbar de 80px */
  });

  /* Registra cada sección con el observer */
  sections.forEach(section => observer.observe(section));
}


/* ================================================
   6. CONTADORES ANIMADOS — Estadísticas del Hero
   
   Anima los números de las estadísticas del hero
   desde 0 hasta su valor objetivo (data-target).
   Usa easing para que la animación desacelere al final.
================================================ */
function initCounters() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (!statNumbers.length) return;

  /**
   * animateCounter() — Anima un contador individual
   * @param {HTMLElement} el      - Elemento que muestra el número
   * @param {number}      target  - Valor final del contador
   * @param {number}      duration- Duración en ms de la animación
   */
  function animateCounter(el, target, duration = 1500) {
    const startTime = performance.now(); /* Tiempo de inicio */
    const startValue = 0;               /* Siempre empieza desde 0 */

    /**
     * step() — Frame de la animación del contador
     * Calcula el progreso (0-1) y aplica easing cuadrático.
     */
    function step(currentTime) {
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1); /* Clampea a [0,1] */

      /* Easing easeOutQuad: desacelera al final */
      const eased = 1 - (1 - progress) * (1 - progress);

      /* Valor actual interpolado */
      const current = Math.floor(startValue + (target - startValue) * eased);
      el.textContent = current;

      /* Continúa hasta que la animación termine */
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target; /* Asegura el valor exacto al final */
      }
    }

    requestAnimationFrame(step);
  }

  /**
   * IntersectionObserver para los contadores.
   * La animación solo se dispara cuando el usuario
   * puede ver las estadísticas en pantalla.
   */
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-target'));
        animateCounter(entry.target, target);
        counterObserver.unobserve(entry.target); /* Solo anima una vez */
      }
    });
  }, { threshold: 0.5 }); /* El 50% del elemento debe estar visible */

  /* Registra cada número con el observer */
  statNumbers.forEach(el => counterObserver.observe(el));
}


/* ================================================
   7. BARRAS DE PROGRESO — Tecnologías
   
   Anima las barras de progreso de la sección de
   tecnologías cuando el usuario las ve en pantalla.
   El ancho final viene del atributo data-width del HTML.
================================================ */
function initProgressBars() {
  const bars = document.querySelectorAll('.tech-fill[data-width]');
  if (!bars.length) return;

  /**
   * IntersectionObserver para las barras de progreso.
   * Cuando la barra es visible, setea su ancho animado.
   */
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        /* Pequeño delay para que la animación se sienta más natural */
        setTimeout(() => {
          const width = entry.target.getAttribute('data-width');
          entry.target.style.width = width + '%'; /* CSS transition se encarga de animar */
        }, 200);

        barObserver.unobserve(entry.target); /* Solo anima una vez */
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => barObserver.observe(bar));
}


/* ================================================
   8. ANIMACIONES ON-SCROLL — Entradas al hacer scroll
   
   Aplica animaciones de entrada a elementos clave
   cuando el usuario los hace visibles en pantalla.
   Esto crea el efecto de "los elementos aparecen
   al bajar por la página".
================================================ */
function initScrollAnimations() {
  /**
   * Elementos que se animarán al entrar en el viewport.
   * Selector: tarjetas, items de tech, secciones de timeline, etc.
   */
  const animatables = document.querySelectorAll(
    '.card, .tech-item, .timeline-item, .tool-category, .resource-card, .section-header'
  );

  if (!animatables.length) return;

  /* Estilo inicial: invisible y desplazado hacia abajo */
  animatables.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });

  /**
   * IntersectionObserver para los elementos animables.
   * Cuando el elemento es visible, lo hace aparecer
   * con una transición suave.
   */
  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        /* Calcula el delay según el índice del elemento en su grid */
        const siblings  = Array.from(entry.target.parentElement.children);
        const index     = siblings.indexOf(entry.target);
        const delay     = Math.min(index * 80, 400); /* Máximo 400ms de delay */

        setTimeout(() => {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
        }, delay);

        animObserver.unobserve(entry.target); /* Solo una vez */
      }
    });
  }, { threshold: 0.1 }); /* Solo el 10% del elemento debe ser visible */

  animatables.forEach(el => animObserver.observe(el));
}


/* ================================================
   9. AÑO DINÁMICO EN EL FOOTER
   
   Inserta el año actual en el elemento #year del
   footer. Así no hay que actualizar el HTML cada año.
================================================ */
function initFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}


/* ================================================
   BONUS: EFECTO PARALLAX SUTIL EN EL HERO
   
   El contenido del hero se desplaza ligeramente
   más lento que el scroll para dar profundidad visual.
================================================ */
window.addEventListener('scroll', () => {
  const heroContent = document.querySelector('.hero-content');
  if (!heroContent) return;

  const scrolled = window.scrollY;
  /* Solo aplica el parallax cuando está en la zona del hero */
  if (scrolled < window.innerHeight) {
    heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
    heroContent.style.opacity   = 1 - (scrolled / window.innerHeight) * 1.5;
  }
});


/* ================================================
   10. FORMULARIO DE CONTACTO
   
   Intercepta el submit del formulario para evitar
   el comportamiento nativo del navegador.
   Muestra un mensaje de éxito animado.
   En producción, aquí se conectaría con fetch()
   a un endpoint de backend o servicio de email.
================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const form       = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');
  const submitBtn  = document.getElementById('submitBtn');

  if (!form) return;

  /**
   * submit — Captura el envío del formulario
   * Previene el reload de la página y simula el envío.
   */
  form.addEventListener('submit', (e) => {
    e.preventDefault(); /* Evita que la página se recargue */

    /* Cambia el texto del botón a "Enviando..." */
    submitBtn.disabled  = true;
    submitBtn.innerHTML = '<span class="btn-text">Enviando... ⏳</span>';

    /**
     * Simula un delay de red de 1.2 segundos.
     * En producción: reemplazar por fetch() a la API.
     */
    setTimeout(() => {
      /* Muestra el mensaje de éxito */
      successMsg.style.display = 'block';

      /* Resetea el formulario a sus valores vacíos */
      form.reset();

      /* Restaura el botón a su estado original */
      submitBtn.disabled  = false;
      submitBtn.innerHTML = '<span class="btn-text">Enviar Mensaje ⚔</span>';

      /* Oculta el mensaje de éxito después de 5 segundos */
      setTimeout(() => {
        successMsg.style.display = 'none';
      }, 5000);
    }, 1200);
  });
});


/* ================================================
   BONUS: EFECTO DE TIPEO EN EL BADGE DEL HERO
   
   Simula el efecto de que el texto del badge se
   está escribiendo en tiempo real (cursor parpadeante).
================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const badge = document.querySelector('.hero-badge');
  if (!badge) return;

  const originalText = badge.textContent.trim();
  badge.textContent  = '';

  let i = 0;
  /* Agrega un carácter cada 60ms hasta completar el texto */
  const typeInterval = setInterval(() => {
    badge.textContent = originalText.slice(0, i + 1);
    i++;
    if (i >= originalText.length) {
      clearInterval(typeInterval); /* Para cuando el texto esté completo */
    }
  }, 60);
});