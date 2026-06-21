// Proyecto Final - Tienda de tecnologia
// Hecho por el grupo para el curso de desarrollo web
// Nota: hay algunas cosas que se podrian mejorar pero funciona bien

// búsqueda

function getAllProducts() {
  const products = [];
  document.querySelectorAll('.product-card').forEach(card => {
     products.push({
      id: card.dataset.id || '',
      name: card.dataset.name || card.querySelector('.product-name')?.textContent || '',
      brand: card.dataset.brand || card.querySelector('.product-brand')?.textContent || '',
      price: card.dataset.price || card.querySelector('.product-price')?.textContent?.replace('S/', '').trim() || '',
      cat: card.closest('.section[data-category]')?.dataset.category || '',
      img: card.querySelector('img')?.src || '',
      el: card
    });
  });
  return products;
}

// busca productos por nombre, marca o categoria
function filterProducts(q) {
  const ql = q.toLowerCase();
  return getAllProducts().filter(p =>
    p.name.toLowerCase().includes(ql) ||
    p.brand.toLowerCase().includes(ql) ||
    p.cat.toLowerCase().includes(ql)
  );
}

function highlightMatch(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<span class="search-result-highlight">$1</span>');
}

// mostrar/ocultar barra de busqueda en movil
function toggleMobileSearch() {
  const bar = document.getElementById('mobileSearchBar');
  if (!bar) return;
  bar.classList.toggle('open');
  if (bar.classList.contains('open')) {
    setTimeout(() => document.getElementById('mobileSearchInput')?.focus(), 80);
  }
}

function mobileLiveSearch(query) {
  const dd = document.getElementById('mobileSearchDropdown');
  if (!dd) return;
  const q = query.trim();
  if (!q) { dd.classList.remove('show'); return; }
  const matches = filterProducts(q).slice(0, 8);
  if (!matches.length) {
    dd.innerHTML = `<div class="search-no-results">No se encontraron productos para "<strong>${q}</strong>"</div>`;
  } else {
    dd.innerHTML = matches.map(p => {
      const catCfg = CATEGORY_CONFIG[p.cat] || { imageUrl: '', icon: '📦' };
      const iconHtml = catCfg.imageUrl
        ? `<img src="${catCfg.imageUrl}" class="search-result-img" onerror="this.style.display='none'">`
        : `<span class="search-result-icon">${catCfg.icon}</span>`;
      return `<div class="search-result-item" onclick="doSearch('${p.name.replace(/'/g, "\\'")}');toggleMobileSearch()">
        <div class="search-result-icon-wrap">${iconHtml}</div>
        <div class="search-result-info">
          <div class="search-result-name">${highlightMatch(p.name, q)}</div>
          <div class="search-result-meta">${p.brand} · ${p.cat}</div>
        </div>
        <div class="search-result-price">S/ ${p.price}</div>
      </div>`;
    }).join('');
  }
  dd.classList.add('show');
}

// abrir/cerrar menu lateral
function toggleMobileDrawer() {
  const drawer = document.getElementById('mobileNavDrawer');
  const overlay = document.getElementById('mobileNavOverlay');
  const btn = document.getElementById('mobileMenuBtn');
  if (!drawer) return;
  const isOpen = drawer.classList.toggle('open');
  overlay?.classList.toggle('open', isOpen);
  if (btn) {
    btn.querySelector('.icon-menu').style.display = isOpen ? 'none' : '';
    btn.querySelector('.icon-close').style.display = isOpen ? '' : 'none';
  }
}

function liveSearch(query) {
  const dd = document.getElementById('searchDropdown');
  if (!dd) return;

  const q = query.trim();
  if (!q) {
    dd.classList.remove('show');
    return;
  }

  const matches = filterProducts(q).slice(0, 8);

  if (!matches.length) {
    dd.innerHTML = `<div class="search-no-results">No se encontraron productos para "<strong>${q}</strong>"</div>`;
  } else {
    dd.innerHTML = matches.map(p => `
      <div class="search-result-item" onclick="doSearch('${p.name.replace(/'/g, "\\'")}')">
        <img src="${p.img}" class="search-result-img">
        <div class="search-result-info">
          <div class="search-result-name">${highlightMatch(p.name, q)}</div>
          <div class="search-result-meta">${p.brand} · ${p.cat}</div>
        </div>
        <div class="search-result-price">S/ ${p.price}</div>
      </div>
    `).join('');
  }

  dd.classList.add('show');
}
// doSearch

// TODO: agregar paginación después
function doSearch(query) {
  const q = query.trim();
  if (!q) return;
  const dd = document.getElementById('searchDropdown');
  if (dd) dd.classList.remove('show');

  const matches = filterProducts(q);
  const all = getAllProducts();

  if (!matches.length) {
    showToast(`Sin resultados para "${q}"`);
    return;
  }

  // Hacer scroll a la sección del primer resultado
  const firstSection = matches[0].el.closest('.section[data-category]');
  if (firstSection) {
    firstSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Resaltar coincidencias y atenuar el resto (se limpia a los 2.8 s)
  document.querySelectorAll('.product-card').forEach(c => c.classList.remove('search-match', 'search-dim'));
  all.forEach(p => {
    const isMatch = matches.includes(p);
    p.el.classList.add(isMatch ? 'search-match' : 'search-dim');
  });
  setTimeout(() => {
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('search-match', 'search-dim'));
  }, 2800);

  showToast(`${matches.length} resultado${matches.length !== 1 ? 's' : ''} para "${q}"`);
}

function jumpToProduct(id, cardEl) {
  const dd = document.getElementById('searchDropdown');
  if (dd) dd.classList.remove('show');
  if (!cardEl) {
    cardEl = document.querySelector(`.product-card[data-id="${id}"]`);
  }
  if (!cardEl) return;
  cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  cardEl.classList.add('search-match');
  setTimeout(() => cardEl.classList.remove('search-match'), 2000);
}

// Cerrar dropdown de búsqueda al hacer clic fuera
document.addEventListener('click', e => {
  if (!e.target.closest('.nav-search')) {
    const dd = document.getElementById('searchDropdown');
    if (dd) dd.classList.remove('show');
  }
});

//  MEGA MENÚ (Categorías)

// mega menu de categorias
function toggleMega() {
  const wrap = document.getElementById('megaWrap');
  const overlay = document.getElementById('megaOverlay');
  const btn = document.getElementById('catBtn');
  if (!wrap) return;
  const isOpen = wrap.classList.toggle('open');
  if (overlay) overlay.classList.toggle('open', isOpen);
  if (btn) btn.classList.toggle('open', isOpen);
}

// Cerrar el mega-menú con la tecla Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const wrap = document.getElementById('megaWrap');
    const overlay = document.getElementById('megaOverlay');
    const btn = document.getElementById('catBtn');
    if (wrap) wrap.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    if (btn) btn.classList.remove('open');
  }
});

// ═══════════════════════════════════════════
//  HERO CAROUSEL — v2 Espectacular
// ═══════════════════════════════════════════

const SLIDE_COUNT = document.querySelectorAll('.hero-slide').length;
let currentSlide = 0;
let carouselTimer;
let progressTimer;
let progressStart;
const AUTO_INTERVAL = 5500; // ms

// Colores neon por slide para los dots activos
const SLIDE_COLORS = ['#00c853','#a855f7','#ff6d00','#0099ff'];

// ── Construir dots nuevos ──
function buildDots() {
  const dotsEl = document.getElementById('hsDots');
  if (!dotsEl) return;
  dotsEl.innerHTML = '';
  for (let i = 0; i < SLIDE_COUNT; i++) {
    const btn = document.createElement('button');
    btn.className = 'hs-dot-new' + (i === 0 ? ' active' : '');
    btn.setAttribute('aria-label', `Slide ${i + 1}`);
    btn.onclick = () => goSlide(i);
    dotsEl.appendChild(btn);
  }
}

// ── Actualizar barra de progreso animada ──
function startProgress() {
  const bar = document.getElementById('hsProgressBar');
  if (!bar) return;
  bar.style.transition = 'none';
  bar.style.width = `${(currentSlide + 1) / SLIDE_COUNT * 100}%`;
  // pequeño delay para que vea la actualización instantánea
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      bar.style.transition = `width ${AUTO_INTERVAL}ms linear`;
      bar.style.width = `${(currentSlide + 2) / SLIDE_COUNT * 100}%`;
    });
  });
  // color según slide
  bar.style.background = SLIDE_COLORS[currentSlide];
  bar.style.boxShadow = `0 0 8px ${SLIDE_COLORS[currentSlide]}`;
}

// ── Actualizar contador ──
function updateCounter() {
  const el = document.getElementById('hsCounter');
  if (el) el.textContent = `${currentSlide + 1} / ${SLIDE_COUNT}`;
}

// ── Activar clase slide-active para animaciones de entrada ──
function activateSlide(idx) {
  document.querySelectorAll('.hero-slide').forEach((s, i) => {
    s.classList.toggle('slide-active', i === idx);
  });
}

// ── Cambiar slide principal ──
function goSlide(n) {
  currentSlide = (n + SLIDE_COUNT) % SLIDE_COUNT;
  const slides = document.getElementById('heroSlides');
  if (slides) slides.style.transform = `translateX(-${currentSlide * 100}%)`;

  // Dots
  document.querySelectorAll('.hs-dot-new').forEach((d, i) => {
    d.classList.toggle('active', i === currentSlide);
    if (i === currentSlide) {
      d.style.background = SLIDE_COLORS[currentSlide];
      d.style.boxShadow = `0 0 8px ${SLIDE_COLORS[currentSlide]}, 0 0 18px ${SLIDE_COLORS[currentSlide]}66`;
    } else {
      d.style.background = '';
      d.style.boxShadow = '';
    }
  });

  updateCounter();
  activateSlide(currentSlide);
  resetCarouselTimer();
  startProgress();
}

function heroSlide(dir) { goSlide(currentSlide + dir); }
function prevSlide()    { goSlide(currentSlide - 1); }
function nextSlide()    { goSlide(currentSlide + 1); }

function resetCarouselTimer() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(() => goSlide(currentSlide + 1), AUTO_INTERVAL);
}

// ── Inicializar ──
buildDots();
resetCarouselTimer();
activateSlide(0);
startProgress();
updateCounter();

// Video en slide 0
document.addEventListener('DOMContentLoaded', () => {
  const vid = document.getElementById('heroVideo');
  if (vid) {
    vid.addEventListener('play',  () => clearInterval(carouselTimer));
    vid.addEventListener('ended', () => { resetCarouselTimer(); goSlide(currentSlide + 1); });
    vid.addEventListener('pause', () => { if (currentSlide === 0) resetCarouselTimer(); });
  }
});

// ── Swipe táctil ──
const heroCarousel = document.getElementById('heroCarousel');
if (heroCarousel) {
  let touchStartX = 0;
  heroCarousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, {passive:true});
  heroCarousel.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) heroSlide(diff > 0 ? 1 : -1);
  });
}

window.addEventListener('resize',            () => goSlide(currentSlide));
window.addEventListener('orientationchange', () => setTimeout(() => goSlide(currentSlide), 300));

// ── PARTÍCULAS DE FONDO ──
(function initParticles() {
  const canvas = document.getElementById('heroParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const COLORS = ['#00c853','#a855f7','#ff6d00','#0099ff'];
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = heroCarousel.offsetWidth;
    H = canvas.height = heroCarousel.offsetHeight;
  }

  function Particle() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.r = Math.random() * 1.8 + .4;
    this.vx = (Math.random() - .5) * .4;
    this.vy = (Math.random() - .5) * .4;
    this.alpha = Math.random() * .5 + .1;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.life = 0;
    this.maxLife = Math.random() * 300 + 200;
  }

  function initP() {
    particles = [];
    for (let i = 0; i < 90; i++) particles.push(new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p, i) => {
      p.life++;
      if (p.life > p.maxLife) { particles[i] = new Particle(); return; }
      const fade = p.life < 30 ? p.life/30 : p.life > p.maxLife-30 ? (p.maxLife-p.life)/30 : 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha * fade;
      ctx.fill();
      ctx.globalAlpha = 1;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    });
    requestAnimationFrame(draw);
  }

  resize();
  initP();
  draw();
  window.addEventListener('resize', () => { resize(); initP(); });
})();

// Tiempo inicial: 1 h 03 m 09 s; al llegar a 0 reinicia desde 1 hora
let totalSecs = 1 * 3600 + 3 * 60 + 9;

setInterval(() => {
  if (totalSecs <= 0) { totalSecs = 3600; return; }
  totalSecs--;
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  const th = document.getElementById('t-h');
  const tm = document.getElementById('t-m');
  const ts = document.getElementById('t-s');
  if (th) th.textContent = String(h).padStart(2, '0');
  if (tm) tm.textContent = String(m).padStart(2, '0');
  if (ts) ts.textContent = String(s).padStart(2, '0');
}, 1000);

// toast

let toastTimer; // guarda el timeout para poder cancelarlo si llega otro toast antes

// mostrar notificacion flotante
function showToast(msg) {
  const t = document.getElementById('toast');
  const tm = document.getElementById('toast-msg');
  if (!t || !tm) return;
  tm.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}

// páginasSPA simple

// navegar entre paginas
function showPage(name) {
  // Ocultar todas las páginas
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });

  // Mostrar la página solicitada
  const pg = document.getElementById(name + '-page');
  if (pg) { pg.classList.add('active'); pg.style.display = 'block'; }

  // Marcar botón de navegación activo
  document.querySelectorAll('.btn-nav').forEach(b => b.classList.remove('active'));
  const navBtn = document.querySelector(`.btn-nav[data-page="${name}"]`);
  if (navBtn) navBtn.classList.add('active');

  // Cerrar mega-menú
  const megaWrap = document.getElementById('megaWrap');
  const megaOverlay = document.getElementById('megaOverlay');
  const catBtn = document.getElementById('catBtn');
  if (megaWrap) megaWrap.classList.remove('open');
  if (megaOverlay) megaOverlay.classList.remove('open');
  if (catBtn) catBtn.classList.remove('open');

  // Cerrar carrito
  const cartPanel = document.getElementById('cartPanel');
  if (cartPanel) cartPanel.classList.remove('open');

  // Cerrar drawer y search móvil
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  const mobileOverlay = document.getElementById('mobileNavOverlay');
  const mobileSearchBar = document.getElementById('mobileSearchBar');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  if (mobileDrawer) mobileDrawer.classList.remove('open');
  if (mobileOverlay) mobileOverlay.classList.remove('open');
  if (mobileSearchBar) mobileSearchBar.classList.remove('open');
  if (mobileMenuBtn) {
    mobileMenuBtn.querySelector('.icon-menu').style.display = '';
    mobileMenuBtn.querySelector('.icon-close').style.display = 'none';
  }

  // Inicializar página si requiere datos
  if (name === 'tiendas') setTimeout(renderTiendas, 50);
  if (name === 'pedidos') renderPedidos();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// carrito

// Cargar carrito guardado en localStorage (persiste entre sesiones)
let cart = JSON.parse(localStorage.getItem('pf_cart') || '[]');
console.log('carrito cargado:', cart);

function saveCart() { localStorage.setItem('pf_cart', JSON.stringify(cart)); }

// agregar al carrito
function addToCartFromCard(p) {
  const existing = cart.find(x => x.id == p.id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...p, qty: 1, emoji: '📦' });
  }
  saveCart();
  updateCartCount();
  renderCart();
  showAddedModal(p);
}

function showAddedModal(p) {
  const overlay = document.getElementById('addedModal');
  if (!overlay) return;

  // Imagen del producto (o emoji de fallback)
  const imgEl = document.getElementById('addedProductImg');
  imgEl.innerHTML = p.img ? `<img src="${p.img}" alt="${p.name}">` : '📦';

  // Marca e ID
  document.getElementById('addedProductMeta').textContent =
    (p.brand ? p.brand + ' | ' : '') + 'ID ' + p.id;

  // Nombre
  document.getElementById('addedProductName').textContent = p.name;

  // Precios: busca precio anterior y badge en el card del DOM
  const card = document.querySelector(`.product-card[data-id="${p.id}"]`);
  const oldPriceEl = card?.querySelector('.product-price-old');
  const badgeEl = card?.querySelector('.badge');
  let html = '';
  if (badgeEl) html += `<span class="added-discount-badge">${badgeEl.textContent}</span>`;
  if (oldPriceEl) html += `<span class="added-price-old">${oldPriceEl.textContent}</span>`;
  html += `<span class="added-price-current">S/ ${p.price}</span>`;
  document.getElementById('addedProductPricing').innerHTML = html;

  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

// closeAddedModal

function closeAddedModal(e) {
  if (e && e.target !== document.getElementById('addedModal')) return;
  const overlay = document.getElementById('addedModal');
  if (overlay) overlay.classList.remove('show');
  document.body.style.overflow = '';
}

// changeQty

function changeQty(id, delta) {
  const item = cart.find(x => x.id == id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(x => x.id != id);
  saveCart();
  updateCartCount();
  renderCart();
}

// removeFromCart

function removeFromCart(id) {
  cart = cart.filter(x => x.id != id);
  saveCart();
  updateCartCount();
  renderCart();
}

// renderCart

function renderCart() {
  const el = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  if (!el) return;

  if (!cart.length) {
    el.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon">🛒</div><p>Tu carrito está vacío</p><p style="font-size:12px;opacity:.6">Agrega productos para continuar</p></div>';
    if (footer) footer.style.display = 'none';
    return;
  }

  let subtotal = 0;
  el.innerHTML = cart.map(item => {
    const p = parseFloat(String(item.price).replace(',', ''));
    subtotal += p * item.qty;
    return `
      <div class="cart-item">
        <div class="cart-item-img">${item.img ? `<img src="${item.img}" alt="">` : item.emoji || '📦'}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">S/ ${item.price}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="changeQty('${item.id}',-1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty('${item.id}',1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">🗑️</button>
      </div>
    `;
  }).join('');

  if (footer) footer.style.display = 'block';
  const sub = document.getElementById('cart-subtotal');
  const tot = document.getElementById('cart-total');
  if (sub) sub.textContent = 'S/ ' + subtotal.toFixed(2);
  if (tot) tot.textContent = 'S/ ' + subtotal.toFixed(2);
}

// updateCartCount

function updateCartCount() {
  const count = cart.reduce((s, x) => s + x.qty, 0);
  const el = document.getElementById('cart-count');
  if (el) el.textContent = count;
}

function toggleCart() {
  document.getElementById('cartPanel').classList.toggle('open');
  renderCart();
}

// checkout

function checkout() {
  if (!getCurrentUser()) {
    toggleCart();
    openModal('login');
    showToast('Inicia sesión para continuar con tu compra');
    return;
  }
  saveOrder();
  showToast(' ¡Pedido realizado con éxito!');
  cart = [];
  saveCart();
  updateCartCount();
  renderCart();
  setTimeout(() => { toggleCart(); showPage('pedidos'); }, 1200);
}

// pedidos

function getOrders() {
  const user = getCurrentUser();
  if (!user) return [];
  return JSON.parse(localStorage.getItem('pf_orders_' + user.email) || '[]');
}

function saveOrders(orders) {
  const user = getCurrentUser();
  if (!user) return;
  localStorage.setItem('pf_orders_' + user.email, JSON.stringify(orders));
}

// saveOrder

function saveOrder() {
  if (!cart.length) return;
  const orders = getOrders();
  const subtotal = cart.reduce((s, item) =>
    s + parseFloat(String(item.price).replace(',', '')) * item.qty, 0);

  const newOrder = {
    id: 'PF-' + Date.now(),
    date: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }),
    status: 'procesando',
    items: cart.map(i => ({ ...i })),
    total: subtotal.toFixed(2)
  };
  orders.unshift(newOrder);
  saveOrders(orders);
}

// renderPedidos

function renderPedidos() {
  const user = getCurrentUser();
  const content = document.getElementById('pedidos-content');
  if (!content) return;

  // Sin sesión: mostrar prompt
  if (!user) {
    content.innerHTML = `
      <div class="pedidos-login-prompt">
        <div class="lock-icon">🔒</div>
        <h3>Inicia sesión para ver tus pedidos</h3>
        <p>Accede a tu cuenta para consultar el estado de tus compras y su historial completo.</p>
        <button class="btn-primary" style="display:inline-block;width:auto;padding:12px 32px;" onclick="openModal('login')">Iniciar Sesión</button>
      </div>`;
    return;
  }

  const orders = getOrders();
  // Sin pedidos: mostrar estado vacío
  if (!orders.length) {
    content.innerHTML = `
      <div class="pedidos-empty">
        <div class="empty-icon">📦</div>
        <h3>No tienes pedidos aún</h3>
        <p>Cuando realices una compra, aquí podrás ver el estado de tus pedidos.</p>
        <button class="btn-primary" style="display:inline-block;width:auto;padding:12px 32px;" onclick="showPage('home')">Explorar Productos</button>
      </div>`;
    return;
  }

  // Mapa de etiquetas de estado para mostrar en español
  const statusLabel = {
    procesando: 'Procesando',
    enviado: 'Enviado',
    entregado: 'Entregado',
    cancelado: 'Cancelado'
  };

  content.innerHTML = orders.map(order => `
    <div class="pedido-card">
      <div class="pedido-header">
        <div>
          <div class="pedido-num">Pedido ${order.id}</div>
          <div class="pedido-date">${order.date}</div>
        </div>
        <span class="pedido-status ${order.status}">${statusLabel[order.status] || order.status}</span>
      </div>
      <div class="pedido-items">
        ${order.items.map(item => `
          <div class="pedido-item">
            <div class="pedido-item-img">${item.emoji || '📦'}</div>
            <div class="pedido-item-info">
              <div class="pedido-item-name">${item.name}</div>
              <div class="pedido-item-meta">Cantidad: ${item.qty}</div>
            </div>
            <div class="pedido-item-price">S/ ${item.price}</div>
          </div>
        `).join('')}
      </div>
      <div class="pedido-footer">
        <div>
          <div class="pedido-total-label">Total del pedido</div>
          <div class="pedido-total-val">S/ ${order.total}</div>
        </div>
        <div class="pedido-actions">
          <button class="pedido-btn" onclick="showToast(' Detalle del pedido ${order.id}')">Ver Detalle</button>
          ${order.status === 'procesando'
      ? `<button class="pedido-btn danger" style="color:var(--red);border-color:var(--red);" onclick="cancelOrder('${order.id}')">Cancelar</button>`
      : ''}
          ${order.status === 'entregado'
      ? `<button class="pedido-btn primary" onclick="reorder('${order.id}')">Recomprar</button>`
      : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// cancelOrder

function cancelOrder(id) {
  const orders = getOrders();
  const order = orders.find(o => o.id === id);
  if (order && order.status === 'procesando') {
    order.status = 'cancelado';
    saveOrders(orders);
    renderPedidos();
    showToast('Pedido ' + id + ' cancelado');
  }
}

// reorder

function reorder(id) {
  const orders = getOrders();
  const order = orders.find(o => o.id === id);
  if (!order) return;
  order.items.forEach(item => addToCartFromCard(item));
  toggleCart();
  showToast('✓ Productos agregados al carrito');
}

// autenticación/ demo
// Nota: los datos se guardan en localStorage del navegador.
// En producción esto debe reemplazarse por un backend real con hashing.

function getUsers() { return JSON.parse(localStorage.getItem('pf_users') || '[]'); }

function saveUsers(u) { localStorage.setItem('pf_users', JSON.stringify(u)); }

function getCurrentUser() { return JSON.parse(localStorage.getItem('pf_session') || 'null'); }

function setCurrentUser(u) { localStorage.setItem('pf_session', JSON.stringify(u)); }

// openModal

function openModal(tab) {
  document.getElementById('authModal').classList.add('show');
  switchTab(tab || 'login');
  document.body.style.overflow = 'hidden';
  // Limpiar campos al abrir
  ['login-email', 'login-pass', 'reg-name', 'reg-email', 'reg-pass'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function closeModal() {
  document.getElementById('authModal').classList.remove('show');
  document.body.style.overflow = '';
  const le = document.getElementById('login-error');
  const re = document.getElementById('reg-error');
  if (le) le.textContent = '';
  if (re) re.textContent = '';
}

// switchTab

function switchTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  document.getElementById('form-login').classList.toggle('active', tab === 'login');
  document.getElementById('form-register').classList.toggle('active', tab === 'register');
}

// doLogin

function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;
  const err = document.getElementById('login-error');
  if (!email || !pass) { err.textContent = 'Completa todos los campos.'; return; }
  const user = getUsers().find(u => u.email === email && u.password === pass);
  if (!user) { err.textContent = 'Correo o contraseña incorrectos.'; return; }
  setCurrentUser(user);
  updateNavAuth();
  closeModal();
  showToast(`¡Bienvenido de vuelta, ${user.name}! 👋`);
  // Refrescar Mis Pedidos si la página está visible
  if (document.getElementById('pedidos-page').classList.contains('active')) renderPedidos();
}

// doRegister

function doRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const err = document.getElementById('reg-error');
  if (!name || !email || !pass) { err.textContent = 'Completa todos los campos.'; return; }
  if (pass.length < 6) { err.textContent = 'La contraseña debe tener al menos 6 caracteres.'; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'Ingresa un correo válido.'; return; }
  const users = getUsers();
  if (users.find(u => u.email === email)) { err.textContent = 'Ese correo ya está registrado.'; return; }
  const newUser = { name, email, password: pass, created: Date.now() };
  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);
  updateNavAuth();
  closeModal();
  showToast(`¡Cuenta creada! Bienvenido, ${name} 🎉`);
}

// doLogout

function doLogout() {
  localStorage.removeItem('pf_session');
  updateNavAuth();
  toggleUserMenu(false);
  showToast('Sesión cerrada correctamente');
  if (document.getElementById('pedidos-page').classList.contains('active')) renderPedidos();
}

// updateNavAuth

function updateNavAuth() {
  const user = getCurrentUser();
  const guestEl = document.getElementById('nav-guest');
  const userEl = document.getElementById('nav-user');
  if (guestEl) guestEl.style.display = user ? 'none' : 'flex';
  if (userEl) userEl.style.display = user ? 'block' : 'none';
  if (user) {
    const nameEl = document.getElementById('greeting-name');
    if (nameEl) nameEl.textContent = `Hola, ${user.name.split(' ')[0]}`;
  }
}

// toggleUserMenu

function toggleUserMenu(force) {
  const dd = document.getElementById('userDropdown');
  if (!dd) return;
  if (force === false) dd.classList.remove('show');
  else dd.classList.toggle('show');
}

// Cerrar dropdown de usuario al hacer clic fuera
document.addEventListener('click', e => {
  if (!e.target.closest('.user-menu-wrap')) {
    const dd = document.getElementById('userDropdown');
    if (dd) dd.classList.remove('show');
  }
});

// Cerrar modal de auth al hacer clic en el backdrop
const authModal = document.getElementById('authModal');
if (authModal) {
  authModal.addEventListener('click', e => { if (e.target === authModal) closeModal(); });
}

// Enviar formularios con la tecla Enter
document.getElementById('login-pass')?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
document.getElementById('reg-pass')?.addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); });

//  BOTONES "AGREGAR AL CARRO"

// Delegación de eventos en todos los botones .add-cart-btn.

document.querySelectorAll('.add-cart-btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.stopPropagation(); // evitar que el click suba y active el scroll-spy
    const card = this.closest('.product-card');
    if (!card) return;
    addToCartFromCard({
      id: card.dataset.id || Math.floor(Math.random() * 99999),
      name: card.dataset.name || 'Producto',
      price: card.dataset.price || '0.00',
      brand: card.dataset.brand || '',
      img: card.querySelector('img')?.src || ''
    });
  });
});

//  CAROUSELS DE PRODUCTOS

// scrollCarousel

function scrollCarousel(btn, dir) {
  const wrap = btn.closest('.carousel-wrap');
  if (!wrap) return;
  const track = wrap.querySelector('.products-track');
  const cardW = track.querySelector('.product-card')?.offsetWidth || 200;
  track.scrollBy({ left: dir * (cardW + 14) * 2, behavior: 'smooth' });
}

// tiendas

// storeData — array con las 17 tiendas TiendaTech.

const storeData = [
  { id: 1, name: 'Plaza San Miguel', addr: 'TiendaTech Plaza San Miguel, Avenida de la Marina, San Miguel, Perú', region: 'Provincia de Lima', type: 'lima', lat: -12.0775, lng: -77.0919 },
  { id: 2, name: 'Jockey Plaza', addr: 'TiendaTech Jockey Plaza, Avenida Javier Prado Este, Santiago de Surco, Perú', region: 'Provincia de Lima', type: 'lima', lat: -12.0867, lng: -76.9975 },
  { id: 3, name: 'Megaplaza Independencia', addr: 'TiendaTech Megaplaza, Avenida Alfredo Mendiola, Independencia, Perú', region: 'Provincia de Lima', type: 'lima', lat: -11.9927, lng: -77.0628 },
  { id: 4, name: 'Plaza Norte', addr: 'TiendaTech Plaza Norte, Av. Tomás Valle con Av. Universitaria, Los Olivos, Perú', region: 'Provincia de Lima', type: 'lima', lat: -11.9993, lng: -77.0618 },
  { id: 5, name: 'Open Plaza Angamos', addr: 'TiendaTech Open Plaza, Av. Angamos Este, Surquillo, Perú', region: 'Provincia de Lima', type: 'lima', lat: -12.1114, lng: -77.0097 },
  { id: 6, name: 'Real Plaza Salaverry', addr: 'TiendaTech Real Plaza, Av. Salaverry, Jesús María, Perú', region: 'Provincia de Lima', type: 'lima', lat: -12.0836, lng: -77.0460 },
  { id: 7, name: 'Mall del Sur', addr: 'TiendaTech Mall del Sur, Av. Los Héroes, San Juan de Miraflores, Perú', region: 'Provincia de Lima', type: 'lima', lat: -12.1697, lng: -76.9639 },
  { id: 8, name: 'Minka', addr: 'TiendaTech Minka, Av. Argentina, Callao, Perú', region: 'Provincia de Lima', type: 'lima', lat: -12.0506, lng: -77.1086 },
  { id: 9, name: 'Real Plaza Puruchuco', addr: 'TiendaTech Real Plaza Puruchuco, Ate, Perú', region: 'Provincia de Lima', type: 'lima', lat: -12.0236, lng: -76.8967 },
  { id: 10, name: 'Agustino Plaza', addr: 'TiendaTech Agustino Plaza, El Agustino, Perú', region: 'Provincia de Lima', type: 'lima', lat: -12.0417, lng: -76.9847 },
  { id: 11, name: 'La Rambla Brasil', addr: 'TiendaTech La Rambla Brasil, Jesús María, Perú', region: 'Provincia de Lima', type: 'lima', lat: -12.0725, lng: -77.0575 },
  { id: 12, name: 'Real Plaza Trujillo', addr: 'TiendaTech Real Plaza, Av. César Vallejo, Trujillo, Perú', region: 'Provincia de La Libertad', type: 'provincia', lat: -8.1060, lng: -79.0355 },
  { id: 13, name: 'Open Plaza Trujillo', addr: 'TiendaTech Open Plaza, Trujillo, Perú', region: 'Provincia de La Libertad', type: 'provincia', lat: -8.1119, lng: -79.0379 },
  { id: 14, name: 'Real Plaza Chiclayo', addr: 'TiendaTech Real Plaza, Chiclayo, Perú', region: 'Provincia de Lambayeque', type: 'provincia', lat: -6.7735, lng: -79.8411 },
  { id: 15, name: 'Real Plaza Piura', addr: 'TiendaTech Real Plaza, Piura, Perú', region: 'Provincia de Piura', type: 'provincia', lat: -5.1945, lng: -80.6328 },
  { id: 16, name: 'Real Plaza Arequipa', addr: 'TiendaTech Real Plaza, Arequipa, Perú', region: 'Provincia de Arequipa', type: 'provincia', lat: -16.3988, lng: -71.5369 },
  { id: 17, name: 'Real Plaza Iquitos', addr: 'TiendaTech Real Plaza, Iquitos, Perú', region: 'Provincia de Loreto', type: 'provincia', lat: -3.7437, lng: -73.2516 },
];

let currentTiendaTab = 'todas'; // filtro de tab activo: 'todas' | 'lima' | 'provincia'

// renderTiendas

function renderTiendas() {
  const searchEl = document.getElementById('tiendaSearch');
  const search = searchEl ? searchEl.value.toLowerCase() : '';
  const list = document.getElementById('tiendasList');
  if (!list) return;

  const filtered = storeData.filter(s => {
    const matchTab = currentTiendaTab === 'todas' || s.type === currentTiendaTab;
    const matchSearch = !search || s.name.toLowerCase().includes(search) || s.addr.toLowerCase().includes(search);
    return matchTab && matchSearch;
  });

  list.innerHTML = filtered.map(s => `
    <div class="tienda-card" onclick="selectTienda(${s.id}, this)">
      <div class="tienda-card-name">${s.name}</div>
      <div class="tienda-card-addr">${s.addr}</div>
      <div class="tienda-card-region">📍 ${s.region}</div>
      <span class="tienda-card-link">Ver en mapa →</span>
    </div>
  `).join('');
}

function filterTiendas() { renderTiendas(); }

// setTiendaTab

function setTiendaTab(tab, btn) {
  currentTiendaTab = tab;
  document.querySelectorAll('.tienda-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderTiendas();
}

// selectTienda

function selectTienda(id, el) {
  const s = storeData.find(x => x.id === id);
  if (!s) return;
  document.querySelectorAll('.tienda-card').forEach(c => c.classList.remove('selected'));
  if (el) el.classList.add('selected');
  const frame = document.getElementById('tiendaMapFrame');
  if (frame) {
    frame.src = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${s.lng}!3d${s.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s${encodeURIComponent(s.name + ' ' + s.addr)}!5e0!3m2!1ses!2spe!4v1`;
  }
}

//  SISTEMA DE CATEGORÍAS DINÁMICO

// CATEGORY_CONFIG — fuente única de verdad para metadatos de categoría.

const CATEGORY_CONFIG = {
  'Laptops Gamer': { imageUrl: 'imagenes/laptop.jpg', sectionId: 'section-laptops' },
  'PC': { imageUrl: 'imagenes/pc1.jpg', sectionId: 'section-pc' },
  'Componentes': { imageUrl: 'imagenes/teclado.jpeg', sectionId: 'section-componentes' },
  'Smartphones': { imageUrl: 'imagenes/iphone17negro.jpg', sectionId: 'section-smartphones' },
  'Gaming': { imageUrl: 'imagenes/switch.jpg', sectionId: 'section-gaming' },
  'Perifericos': { imageUrl: 'imagenes/periferico1.jpg', sectionId: 'section-perifericos' },
};

// buildMegaMenu

function buildMegaMenu() {
  const grid = document.getElementById('megaMenuGrid');
  if (!grid) return;

  const items = [];
  document.querySelectorAll('.section[data-category]').forEach(section => {
    const cat = section.dataset.category;
    const count = section.querySelectorAll('.product-card').length;
    if (count < 1) return;
    const cfg = CATEGORY_CONFIG[cat] || { imageUrl: '', icon: '📦' };
    items.push({ cat, count, imageUrl: cfg.imageUrl, icon: cfg.icon, sectionId: section.id });
  });

  grid.innerHTML = items.map(p => {
    const iconHtml = p.imageUrl
      ? `<img src="${p.imageUrl}" alt="${p.cat}" class="mega-cat-img" onerror="this.onerror=null;this.src='';this.nextElementSibling.style.display='flex';this.style.display='none'"><span class="mega-cat-icon-fallback" style="display:none">${p.icon}</span>`
      : `<span class="mega-cat-icon">${p.icon}</span>`;
    return `
      <a class="mega-cat" onclick="toggleMega(); scrollToSection('${p.sectionId}')">
        <div class="mega-cat-icon-wrap">${iconHtml}</div>
        <div class="mega-cat-name">${p.cat}</div>
        <div class="mega-cat-count">${p.count} productos</div>
      </a>`;
  }).join('');
}

// buildCategoryBar

function buildCategoryBar() {
  const inner = document.getElementById('catStickyInner');
  if (!inner) return;

  const prevActive = inner.querySelector('.cat-pill.active')?.dataset.section || null;
  const pills = [];

  document.querySelectorAll('.section[data-category]').forEach(section => {
    const cat = section.dataset.category;
    const count = section.querySelectorAll('.product-card').length;
    if (count < 1) return;
    const cfg = CATEGORY_CONFIG[cat] || { imageUrl: '', icon: '📦' };
    pills.push({ cat, count, imageUrl: cfg.imageUrl, icon: cfg.icon, sectionId: section.id });
  });

  buildMegaMenu();

  inner.innerHTML = pills.map((p, i) => {
    const isActive = prevActive ? prevActive === p.sectionId : i === 0;
    const iconHtml = p.imageUrl
      ? `<img src="${p.imageUrl}" alt="${p.cat}" class="cat-pill-img" onerror="this.onerror=null;this.src='';this.nextElementSibling.style.display='inline';this.style.display='none'"><span class="cat-pill-icon-fallback" style="display:none">${p.icon}</span>`
      : `<span class="cat-pill-icon">${p.icon}</span>`;
    return `
      <button class="cat-pill${isActive ? ' active' : ''}"
              data-section="${p.sectionId}"
              onclick="scrollToSection('${p.sectionId}', this)"
              aria-label="Ir a ${p.cat} (${p.count} productos)">
        ${iconHtml}
        <span class="cat-pill-label">${p.cat}</span>
        <span class="cat-pill-count">${p.count}</span>
      </button>`;
  }).join('');
}

// scrollToSection

function scrollToSection(sectionId, btn) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// initCatScrollSpy

function initCatScrollSpy() {
  const sections = document.querySelectorAll('.section[data-category]');
  if (!sections.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        document.querySelectorAll('.cat-pill').forEach(pill => {
          pill.classList.toggle('active', pill.dataset.section === id);
        });
        // En móvil: hacer scroll del pill activo para que sea visible dentro de la barra
        const active = document.querySelector(`.cat-pill[data-section="${id}"]`);
        active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
  }, {
    rootMargin: '-68px 0px -65% 0px',
    threshold: 0
  });

  sections.forEach(s => observer.observe(s));
}

// initProductObserver

function initProductObserver() {
  const observer = new MutationObserver(() => buildCategoryBar());
  document.querySelectorAll('.section[data-category] .products-track').forEach(track => {
    observer.observe(track, { childList: true });
  });
}

// addProduct

function addProduct(p) {
  const cfg = CATEGORY_CONFIG[p.category];
  if (!cfg) {
    console.warn(`[addProduct] Categoría desconocida: "${p.category}". ` +
      `Opciones válidas: ${Object.keys(CATEGORY_CONFIG).join(', ')}`);
    return;
  }

  const section = document.getElementById(cfg.sectionId);
  if (!section) { console.warn('[addProduct] Sección no encontrada:', cfg.sectionId); return; }

  const track = section.querySelector('.products-track');
  if (!track) return;

  // Crear la tarjeta de producto
  const card = document.createElement('div');
  card.className = 'product-card';
  Object.assign(card.dataset, {
    brand: p.brand || '',
    id: String(p.id),
    name: p.name || '',
    price: p.price || '0'
  });

  card.innerHTML = `
    ${p.img ? `<img src="${p.img}" alt="${p.name}" onerror="this.style.display='none'">` : ''}
    ${p.discount ? `<span class="badge">${p.discount}</span>` : ''}
    <div class="product-brand">${(p.brand || '').toUpperCase()}</div>
    <div class="product-name">${p.name}</div>
    <div class="product-id">ID ${p.id}</div>
    ${p.priceOld ? `<div class="product-price-old">S/${p.priceOld}</div>` : ''}
    <div class="product-price">S/${p.price}</div>
    <button class="add-cart-btn">Agregar al carro</button>
  `;

  // Conectar botón del nuevo card al carrito
  card.querySelector('.add-cart-btn').addEventListener('click', function (e) {
    e.stopPropagation();
    addToCartFromCard({ id: p.id, name: p.name, price: p.price, brand: p.brand || '', img: p.img || '' });
  });

  track.appendChild(card);
  // MutationObserver dispara buildCategoryBar() automáticamente
  showToast(`✓ "${p.name.slice(0, 28)}…" añadido al catálogo`);
}

// guía de compraDOM

// toggleFaq

function toggleFaq(btn) {
  const item = btn.closest('.guide-faq-item');
  const answer = item.querySelector('.guide-faq-a');
  const isOpen = answer.classList.contains('open');
  // Cerrar todos
  document.querySelectorAll('.guide-faq-a').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.guide-faq-q').forEach(q => q.classList.remove('open'));
  // Abrir el clickeado (si estaba cerrado)
  if (!isOpen) { answer.classList.add('open'); btn.classList.add('open'); }
}

// guideScrollTo

function guideScrollTo(id, linkEl) {
  const el = document.getElementById('guide-' + id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.querySelectorAll('.guide-nav-link').forEach(l => l.classList.remove('active'));
  if (linkEl) linkEl.classList.add('active');
}

//  INICIALIZACIÓN

renderTiendas();       // poblar lista de tiendas
renderCart();          // mostrar carrito guardado
updateCartCount();     // badge del navbar
updateNavAuth();       // estado login/logout del navbar
buildMegaMenu();       // construir mega-menú de categorías
buildCategoryBar();    // generar pills de la barra sticky con conteos
initCatScrollSpy();    // scroll-spy: actualizar pill activo al hacer scroll
initProductObserver(); // MutationObserver: re-construir barra si cambian los productos

// Cerrar dropdown de búsqueda al hacer clic fuera (especialmente útil en móvil)
document.addEventListener('click', function (e) {
  // Para el dropdown de búsqueda principal
  if (!e.target.closest('.nav-search')) {
    const dd = document.getElementById('searchDropdown');
    if (dd) dd.classList.remove('show');
  }
  // Para el dropdown de búsqueda móvil
  if (!e.target.closest('.mobile-search-inner')) {
    const mobileDD = document.getElementById('mobileSearchDropdown');
    if (mobileDD) mobileDD.classList.remove('show');
  }
});

// Ajuste del top del mega menú para móvil (cuando se abre)
function toggleMega() {
  const wrap = document.getElementById('megaWrap');
  const overlay = document.getElementById('megaOverlay');
  const btn = document.getElementById('catBtn');
  if (!wrap) return;

  // En móvil, forzamos top dinámico según la altura del navbar
  if (window.innerWidth <= 768) {
    const navHeight = document.querySelector('nav')?.offsetHeight || 58;
    wrap.style.top = navHeight + 'px';
  } else {
    wrap.style.top = '68px';
  }

  const isOpen = wrap.classList.toggle('open');
  if (overlay) overlay.classList.toggle('open', isOpen);
  if (btn) btn.classList.toggle('open', isOpen);
}

// Opcional: recalcular el top del mega menú al redimensionar
window.addEventListener('resize', function () {
  const wrap = document.getElementById('megaWrap');
  if (wrap && wrap.classList.contains('open')) {
    if (window.innerWidth <= 768) {
      const navHeight = document.querySelector('nav')?.offsetHeight || 58;
      wrap.style.top = navHeight + 'px';
    } else {
      wrap.style.top = '68px';
    }
  }
});
/* ============================================================
   INTERACTIVE CARD TILT — efecto 3D + shimmer al hover
   ============================================================ */
function initCardTilt() {
  document.querySelectorAll('.product-card').forEach(card => {
    // Agregar capa de shimmer si no existe
    if (!card.querySelector('.card-shimmer')) {
      const shimmer = document.createElement('div');
      shimmer.className = 'card-shimmer';
      card.appendChild(shimmer);
    }

    card.addEventListener('mousemove', function(e) {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const cx = r.width / 2;
      const cy = r.height / 2;
      const rotX = ((y - cy) / cy) * -8;
      const rotY = ((x - cx) / cx) * 8;

      card.style.transform =
        `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.04,1.04,1.04)`;
      card.style.boxShadow =
        `${-rotY * 0.7}px ${rotX * 0.7}px 28px rgba(0,150,80,0.18)`;

      card.style.setProperty('--shimmer-x', ((x / r.width) * 100).toFixed(1) + '%');
      card.style.setProperty('--shimmer-y', ((y / r.height) * 100).toFixed(1) + '%');
    });

    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
}

// Inicializar al cargar
initCardTilt();

// Re-inicializar si se agregan tarjetas dinámicamente (addProduct)
const _origAddProduct = typeof addProduct === 'function' ? addProduct : null;
if (_origAddProduct) {
  window.addProduct = function(p) {
    _origAddProduct(p);
    setTimeout(initCardTilt, 100);
  };
}
// ═══════════════════════════════════════════════════════
//  MINI-CARRUSELES INTERNOS (una imagen por slide del hero)
// ═══════════════════════════════════════════════════════

(function initInnerCarousels() {
  const INNER_INTERVAL = 2800; // ms entre imágenes
  const innerTimers = [];

  // Color neon por carrusel (coincide con slide)
  const IC_COLORS = ['#00c853', '#a855f7', '#ff6d00', '#0099ff'];

  function setupInner(idx) {
    const track = document.getElementById(`innerTrack${idx}`);
    const dotsEl = document.getElementById(`innerDots${idx}`);
    const carousel = document.getElementById(`innerCarousel${idx}`);
    if (!track || !dotsEl || !carousel) return;

    const imgs = Array.from(track.querySelectorAll('img'));
    if (imgs.length < 2) { imgs[0] && imgs[0].classList.add('ic-active'); return; }

    let current = 0;

    // Construir dots
    imgs.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'hs-inner-dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', `Imagen ${i + 1}`);
      btn.onclick = () => goInner(idx, i);
      dotsEl.appendChild(btn);
    });

    // Construir flechas mini
    const arrowL = document.createElement('button');
    arrowL.className = 'hs-inner-arrow left';
    arrowL.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M15 18l-6-6 6-6"/></svg>';
    arrowL.onclick = () => goInner(idx, (current - 1 + imgs.length) % imgs.length);

    const arrowR = document.createElement('button');
    arrowR.className = 'hs-inner-arrow right';
    arrowR.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M9 18l6-6-6-6"/></svg>';
    arrowR.onclick = () => goInner(idx, (current + 1) % imgs.length);

    carousel.appendChild(arrowL);
    carousel.appendChild(arrowR);

    // Activar primera imagen
    imgs[0].classList.add('ic-active');

    function goInner(carIdx, n) {
      if (carIdx !== idx) return;
      imgs[current].classList.remove('ic-active');
      current = (n + imgs.length) % imgs.length;
      imgs[current].classList.add('ic-active');

      // Actualizar dots
      const dots = dotsEl.querySelectorAll('.hs-inner-dot');
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });

      resetInnerTimer(idx);
    }

    // Exponer goInner globalmente para poder llamarlo desde el timer
    window[`goInner${idx}`] = (n) => goInner(idx, n);
    window[`getInnerCurrent${idx}`] = () => current;
    window[`getInnerCount${idx}`] = () => imgs.length;

    function resetInnerTimer(carIdx) {
      clearInterval(innerTimers[carIdx]);
      innerTimers[carIdx] = setInterval(() => {
        const cur = window[`getInnerCurrent${carIdx}`]();
        const cnt = window[`getInnerCount${carIdx}`]();
        window[`goInner${carIdx}`]((cur + 1) % cnt);
      }, INNER_INTERVAL);
    }

    resetInnerTimer(idx);
  }

  // Inicializar los 4 carruseles internos
  for (let i = 0; i < 4; i++) setupInner(i);
})();
