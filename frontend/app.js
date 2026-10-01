const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

const API_BASE = window.RENTMAP_API_BASE || '/api';

const map = L.map('map').setView([12.245, 109.194], 14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);

let markers = [];
let currentCategory = 'all';
let listings = [];

const fmtPrice = (n, c) => new Intl.NumberFormat('ru-RU').format(Number(n)) + ' ' + c;
const periodLabel = p => ({hour: 'час', day: 'день', week: 'нед.', month: 'мес.'}[p] || p);

function normalizeListing(x) {
  return {
    ...x,
    lat: Number(x.latitude ?? x.lat),
    lon: Number(x.longitude ?? x.lon),
    category: x.category?.slug ?? x.category_slug ?? x.category
  };
}

function render(list) {
  markers.forEach(m => m.remove());
  markers = [];

  list
    .filter(x => currentCategory === 'all' || x.category === currentCategory)
    .forEach(x => {
      const icon = L.divIcon({
        className: '',
        html: `<div class="price-marker">${fmtPrice(x.price, x.currency)}<small>${periodLabel(x.price_period ?? x.period)} · ${x.title}</small></div>`,
        iconAnchor: [55, 18]
      });

      const m = L.marker([x.lat, x.lon], {icon}).addTo(map);
      m.on('click', () => showListing(x));
      markers.push(m);
    });
}

function showListing(x) {
  const period = x.price_period ?? x.period;
  const categoryName = x.category?.name ?? x.category ?? '—';

  document.getElementById('sheetContent').innerHTML = `
    <div class="listing-title">${x.title}</div>
    <div class="listing-price">${fmtPrice(x.price, x.currency)} / ${periodLabel(period)}</div>
    <div class="listing-meta">Категория: ${categoryName}</div>
    ${x.description ? `<div class="listing-meta">${x.description}</div>` : ''}
  `;

  document.getElementById('sheet').classList.remove('hidden');
}

async function loadListings() {
  const params = new URLSearchParams({limit: '100'});

  if (currentCategory !== 'all') {
    params.set('category', currentCategory);
  }

  const response = await fetch(`${API_BASE}/listings?${params.toString()}`);
  if (!response.ok) throw new Error('Не удалось загрузить объявления');

  const data = await response.json();
  listings = data.map(normalizeListing);
  render(listings);
}

async function loadNearby(lat, lng) {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: '10',
    limit: '100'
  });

  if (currentCategory !== 'all') {
    params.set('category', currentCategory);
  }

  const response = await fetch(`${API_BASE}/listings?${params.toString()}`);
  if (!response.ok) throw new Error('Не удалось загрузить объявления рядом');

  const data = await response.json();
  listings = data.map(normalizeListing);
  render(listings);
}

document.getElementById('closeSheet').onclick = () =>
  document.getElementById('sheet').classList.add('hidden');

document.querySelectorAll('.filter').forEach(btn => {
  btn.onclick = async () => {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;

    try {
      await loadListings();
    } catch (error) {
      console.error(error);
    }
  };
});

document.getElementById('locateBtn').onclick = () => {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(async pos => {
    const {latitude, longitude} = pos.coords;
    map.setView([latitude, longitude], 15);

    L.circleMarker([latitude, longitude], {radius: 7}).addTo(map);

    try {
      await loadNearby(latitude, longitude);
    } catch (error) {
      console.error(error);
    }
  });
};

async function init() {
  try {
    await loadListings();
  } catch (error) {
    console.error(error);
    document.getElementById('sheetContent').innerHTML =
      '<div class="listing-meta">API пока недоступен. Проверьте Laravel и настройки базы данных.</div>';
  }
}

init();
