(() => {
  const labels = {
    ru: { title:'Отметьте вашу точку на карте', text:'Нажмите на карте в нужном месте или найдите адрес ниже.', address:'Введите адрес', find:'Найти', continue:'Продолжить', pick:'Отметьте точку на карте или найдите её по адресу.', selected:'Точка выбрана: 📍 {lat}, {lng}', enter:'Введите адрес для поиска.', searching:'Ищем адрес...', notFound:'Адрес не найден.', searchError:'Не удалось определить адрес.' },
    en: { title:'Mark your location on the map', text:'Tap the map at the desired place or find the address below.', address:'Enter address', find:'Find', continue:'Continue', pick:'Mark a point on the map or find it by address.', selected:'Location selected: 📍 {lat}, {lng}', enter:'Enter an address to search.', searching:'Searching for address...', notFound:'Address not found.', searchError:'Could not find the address.' },
    vi: { title:'Đánh dấu vị trí trên bản đồ', text:'Chạm vào vị trí mong muốn trên bản đồ hoặc tìm địa chỉ bên dưới.', address:'Nhập địa chỉ', find:'Tìm', continue:'Tiếp tục', pick:'Chọn điểm trên bản đồ hoặc tìm theo địa chỉ.', selected:'Đã chọn vị trí: 📍 {lat}, {lng}', enter:'Nhập địa chỉ để tìm.', searching:'Đang tìm địa chỉ...', notFound:'Không tìm thấy địa chỉ.', searchError:'Không thể tìm địa chỉ.' },
    hi: { title:'मानचित्र पर अपना स्थान चिह्नित करें', text:'मानचित्र पर स्थान चुनें या नीचे पता खोजें।', address:'पता दर्ज करें', find:'खोजें', continue:'जारी रखें', pick:'मानचित्र पर स्थान चुनें या पते से खोजें।', selected:'स्थान चुना गया: 📍 {lat}, {lng}', enter:'खोजने के लिए पता दर्ज करें।', searching:'पता खोजा जा रहा है...', notFound:'पता नहीं मिला।', searchError:'पता खोजा नहीं जा सका।' }
  };
  const fallback = labels.en;
  const getLabel = key => (labels[lang] || fallback)[key] || fallback[key];
  const applyPickerLabels = () => {
    document.querySelector('[data-i18n="locationPickerTitle"]').textContent = getLabel('title');
    document.querySelector('[data-i18n="locationPickerText"]').textContent = getLabel('text');
    addressInput.placeholder = getLabel('address');
    addressButton.textContent = getLabel('find');
    confirmButton.textContent = getLabel('continue');
  };

  const addButton = document.getElementById('addListingBtn');
  const picker = document.getElementById('locationPicker');
  const addressInput = document.getElementById('locationAddress');
  const addressButton = document.getElementById('locationAddressSearch');
  const pickerMessage = document.getElementById('locationPickerMessage');
  const confirmButton = document.getElementById('confirmLocation');
  const cancelButton = document.getElementById('cancelLocation');
  if (!addButton || !picker || !addressInput || !addressButton || !confirmButton || !cancelButton) return;

  let pickerMode = false;
  let pendingLocation = null;
  applyPickerLabels();

  const setMessage = (message) => { if (pickerMessage) pickerMessage.textContent = message || ''; };

  const openPicker = () => {
    if (!inTelegram) return;
    pickerMode = true; pendingLocation = null; createMode = true;
    document.getElementById('sheet')?.classList.add('hidden');
    document.getElementById('createSheet')?.classList.add('hidden');
    document.getElementById('selectedLocation').textContent = t('locationNotSelected');
    applyPickerLabels();
    setMessage(getLabel('pick'));
    addressInput.value = '';
    picker.classList.remove('hidden');
    map.invalidateSize();
  };

  const closePicker = () => { pickerMode = false; createMode = false; pendingLocation = null; picker.classList.add('hidden'); };

  const acceptLocation = (lat, lng) => {
    pendingLocation = { lat: Number(lat), lng: Number(lng) };
    setCreateLocation(pendingLocation.lat, pendingLocation.lng);
    setMessage(getLabel('selected').replace('{lat}', pendingLocation.lat.toFixed(6)).replace('{lng}', pendingLocation.lng.toFixed(6)));
  };

  addButton.onclick = openPicker;
  cancelButton.onclick = () => { closePicker(); if (selectedMarker) { selectedMarker.remove(); selectedMarker = null; } };

  confirmButton.onclick = () => {
    if (!pendingLocation) { setMessage(t('chooseLocation')); return; }
    pickerMode = false; createMode = true; picker.classList.add('hidden');
    document.getElementById('createSheet').classList.remove('hidden');
    document.getElementById('formMessage').textContent = '';
  };

  map.on('click', event => { if (pickerMode) acceptLocation(event.latlng.lat, event.latlng.lng); });

  const searchAddress = async () => {
    const query = addressInput.value.trim();
    if (!query) { setMessage(getLabel('enter')); return; }
    setMessage(getLabel('searching')); addressButton.disabled = true;
    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('q', query); url.searchParams.set('format', 'json'); url.searchParams.set('limit', '1'); url.searchParams.set('accept-language', lang || 'en');
      const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Geocoding failed');
      const results = await response.json();
      if (!results.length) { setMessage(getLabel('notFound')); return; }
      const lat = Number(results[0].lat), lng = Number(results[0].lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('Invalid coordinates');
      map.setView([lat, lng], Math.max(map.getZoom(), 16)); acceptLocation(lat, lng);
    } catch (error) { console.error(error); setMessage(getLabel('searchError')); }
    finally { addressButton.disabled = false; }
  };

  addressButton.onclick = searchAddress;
  addressInput.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); searchAddress(); } });
})();
