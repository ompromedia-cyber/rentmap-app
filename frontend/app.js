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
const escapeHtml = value => String(value ?? '').replace(/[&<>\"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[ch]));
const photoUrl = path => path ? `${window.RENTMAP_STORAGE_BASE || ''}/storage/${String(path).replace(/^\\//, '')}` : '';

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
        html: `<div class="price-marker">${fmtPrice(x.price, x.currency)}<small>${periodLabel(x.price_period ?? x.period)} · ${escapeHtml(x.title)}</small></div>`,
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

  const photos = Array.isArray(x.photos) ? x.photos : [];
  const gallery = photos.length ? `<div class="listing-gallery">${photos.map(p => {
    const url = photoUrl(p.path);
    return url ? `<img src="${url}" alt="" loading="lazy">` : '';
  }).join('')}</div>` : '';

  document.getElementById('sheetContent').innerHTML = `
    ${gallery}
    <div class="listing-title">${escapeHtml(x.title)}</div>
    <div class="listing-price">${fmtPrice(x.price, x.currency)} / ${periodLabel(period)}</div>
    <div class="listing-meta">Категория: ${escapeHtml(categoryName)}</div>
    ${x.description ? `<div class="listing-meta listing-description">${escapeHtml(x.description)}</div>` : ''}
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

let createMode = false;
let selectedLat = null;
let selectedLng = null;
let selectedMarker = null;

function setCreateLocation(lat, lng) {
  selectedLat = lat;
  selectedLng = lng;
  document.getElementById('selectedLocation').textContent =
    `📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}`;

  if (selectedMarker) selectedMarker.remove();
  selectedMarker = L.marker([lat, lng]).addTo(map);
}

document.getElementById('addListingBtn').onclick = () => {
  createMode = true;
  document.getElementById('sheet').classList.add('hidden');
  document.getElementById('createSheet').classList.remove('hidden');
  document.getElementById('formMessage').textContent =
    'Укажите точку объявления, нажав на карте.';
};

document.getElementById('closeCreate').onclick = () => {
  createMode = false;
  document.getElementById('createSheet').classList.add('hidden');
  if (selectedMarker) {
    selectedMarker.remove();
    selectedMarker = null;
  }
};

map.on('click', event => {
  if (!createMode) return;
  setCreateLocation(event.latlng.lat, event.latlng.lng);
});

document.getElementById('listingForm').addEventListener('submit', async event => {
  event.preventDefault();

  if (!selectedLat || !selectedLng) {
    document.getElementById('formMessage').textContent = 'Сначала выберите место на карте.';
    return;
  }

  const initData = tg?.initData;
  if (!initData) {
    document.getElementById('formMessage').textContent =
      'Создание объявлений доступно внутри Telegram Mini App.';
    return;
  }

  const payload = {
    category_id: Number(document.getElementById('listingCategory').value),
    title: document.getElementById('listingTitle').value.trim(),
    description: document.getElementById('listingDescription').value.trim() || null,
    price: Number(document.getElementById('listingPrice').value),
    currency: 'VND',
    price_period: document.getElementById('listingPeriod').value,
    latitude: selectedLat,
    longitude: selectedLng,
    status: 'active'
  };

  const message = document.getElementById('formMessage');
  const photoInput = document.getElementById('listingPhotos');
  const selectedPhotos = Array.from(photoInput.files || []);
  if (selectedPhotos.length > 10) {
    message.textContent = 'Можно выбрать максимум 10 фотографий.';
    return;
  }
  message.textContent = 'Публикуем...';

  try {
    const response = await fetch(`${API_BASE}/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': initData
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Не удалось создать объявление');
    }

    if (selectedPhotos.length) {
      const formData = new FormData();
      selectedPhotos.forEach(file => formData.append('photos[]', file));
      const photoResponse = await fetch(`${API_BASE}/listings/${data.id}/photos`, {
        method: 'POST',
        headers: {'X-Telegram-Init-Data': initData},
        body: formData
      });
      const photoData = await photoResponse.json();
      if (!photoResponse.ok) throw new Error(photoData.message || 'Объявление создано, но фотографии не загрузились');
    }

    message.textContent = 'Объявление опубликовано!';
    createMode = false;
    document.getElementById('listingForm').reset();

    setTimeout(async () => {
      document.getElementById('createSheet').classList.add('hidden');
      if (selectedMarker) {
        selectedMarker.remove();
        selectedMarker = null;
      }
      await loadListings();
    }, 700);
  } catch (error) {
    console.error(error);
    message.textContent = error.message;
  }
});
