(() => {
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

  const setMessage = (message) => {
    if (pickerMessage) pickerMessage.textContent = message || '';
  };

  const openPicker = () => {
    if (!inTelegram) return;
    pickerMode = true;
    pendingLocation = null;
    createMode = true;
    document.getElementById('sheet')?.classList.add('hidden');
    document.getElementById('createSheet')?.classList.add('hidden');
    document.getElementById('selectedLocation').textContent = t('locationNotSelected');
    setMessage(t('locationPickHelp'));
    addressInput.value = '';
    picker.classList.remove('hidden');
    map.invalidateSize();
  };

  const closePicker = () => {
    pickerMode = false;
    createMode = false;
    pendingLocation = null;
    picker.classList.add('hidden');
  };

  const acceptLocation = (lat, lng) => {
    pendingLocation = { lat: Number(lat), lng: Number(lng) };
    setCreateLocation(pendingLocation.lat, pendingLocation.lng);
    setMessage(t('locationSelected').replace('{lat}', pendingLocation.lat.toFixed(6)).replace('{lng}', pendingLocation.lng.toFixed(6)));
  };

  addButton.onclick = openPicker;
  cancelButton.onclick = () => {
    closePicker();
    if (selectedMarker) { selectedMarker.remove(); selectedMarker = null; }
  };

  confirmButton.onclick = () => {
    if (!pendingLocation) {
      setMessage(t('chooseLocation'));
      return;
    }
    pickerMode = false;
    createMode = true;
    picker.classList.add('hidden');
    document.getElementById('createSheet').classList.remove('hidden');
    document.getElementById('formMessage').textContent = '';
  };

  map.on('click', (event) => {
    if (!pickerMode) return;
    acceptLocation(event.latlng.lat, event.latlng.lng);
  });

  const searchAddress = async () => {
    const query = addressInput.value.trim();
    if (!query) {
      setMessage(t('enterAddress'));
      return;
    }
    setMessage(t('searchingAddress'));
    addressButton.disabled = true;
    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('q', query);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', '1');
      url.searchParams.set('accept-language', lang || 'en');
      const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Geocoding failed');
      const results = await response.json();
      if (!results.length) {
        setMessage(t('addressNotFound'));
        return;
      }
      const result = results[0];
      const lat = Number(result.lat);
      const lng = Number(result.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('Invalid coordinates');
      map.setView([lat, lng], Math.max(map.getZoom(), 16));
      acceptLocation(lat, lng);
    } catch (error) {
      console.error(error);
      setMessage(t('addressSearchError'));
    } finally {
      addressButton.disabled = false;
    }
  };

  addressButton.onclick = searchAddress;
  addressInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchAddress();
    }
  });
})();
