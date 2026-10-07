const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

const API_BASE = window.RENTMAP_API_BASE || '/api';
const inTelegram = Boolean(tg?.initData);
document.documentElement.classList.toggle('outside-telegram', !inTelegram);

const REGIONS = {
  nha_trang: { center: [12.245, 109.194], zoom: 13 },
  da_nang: { center: [16.0544, 108.2022], zoom: 13 },
  goa: { center: [15.4, 73.95], zoom: 11 },
  sri_lanka: { center: [7.8731, 80.7718], zoom: 8 }
};

const LANGUAGES = ['ru','en','vi','hi','si','ta','kok','mr'];
const translations = {
  ru: {
    addListing:'Объявление', nearby:'Рядом', all:'Все', housing:'🏠 Жильё', scooters:'🛵 Скутеры', motorcycles:'🏍️ Мото', cars:'🚗 Авто',
    favorites:'Избранное', newListing:'Новое объявление', category:'Категория', title:'Название', price:'Цена', period:'Период',
    hour:'Час', day:'День', week:'Неделя', month:'Месяц', description:'Описание', photos:'Фотографии', locationHelp:'Нажмите на карте, чтобы выбрать место объявления.',
    locationNotSelected:'Точка не выбрана', publish:'Опубликовать', titlePlaceholder:'Например, квартира у моря', pricePlaceholder:'8000000',
    descriptionPlaceholder:'Описание, условия аренды...', categoryLabel:'Категория', write:'Написать', owner:'Владелец',
    addToFavorites:'♡ В избранное', inFavorites:'♥ В избранном', loading:'Загрузка...', favoritesEmpty:'Пока ничего не сохранено.',
    favoritesTelegram:'Избранное доступно внутри Telegram.', favoriteError:'Не удалось загрузить избранное.', published:'Объявление опубликовано!',
    publishing:'Публикуем...', chooseLocation:'Сначала выберите место на карте.', maxPhotos:'Можно выбрать максимум 10 фотографий.',
    apiError:'API пока недоступен. Проверьте Laravel и настройки базы данных.', listingPhotoError:'Объявление создано, но фотографии не загрузились.',
    location:'📍 {lat}, {lng}', periodHour:'час', periodDay:'день', periodWeek:'нед.', periodMonth:'мес.'
  },
  en: {
    addListing:'Listing', nearby:'Nearby', all:'All', housing:'🏠 Housing', scooters:'🛵 Scooters', motorcycles:'🏍️ Motorcycles', cars:'🚗 Cars',
    favorites:'Favorites', newListing:'New listing', category:'Category', title:'Title', price:'Price', period:'Period',
    hour:'Hour', day:'Day', week:'Week', month:'Month', description:'Description', photos:'Photos', locationHelp:'Tap the map to choose the listing location.',
    locationNotSelected:'Location not selected', publish:'Publish', titlePlaceholder:'For example, apartment near the sea', pricePlaceholder:'8000000',
    descriptionPlaceholder:'Description, rental conditions...', categoryLabel:'Category', write:'Message', owner:'Owner',
    addToFavorites:'♡ Add to favorites', inFavorites:'♥ In favorites', loading:'Loading...', favoritesEmpty:'Nothing saved yet.',
    favoritesTelegram:'Favorites are available inside Telegram.', favoriteError:'Could not load favorites.', published:'Listing published!',
    publishing:'Publishing...', chooseLocation:'Choose a location on the map first.', maxPhotos:'Maximum 10 photos.',
    apiError:'API is not available yet. Check Laravel and database settings.', listingPhotoError:'Listing was created, but photos failed to upload.',
    location:'📍 {lat}, {lng}', periodHour:'hour', periodDay:'day', periodWeek:'wk.', periodMonth:'mo.'
  },
  vi: {
    addListing:'Đăng tin', nearby:'Gần đây', all:'Tất cả', housing:'🏠 Nhà ở', scooters:'🛵 Xe tay ga', motorcycles:'🏍️ Xe máy', cars:'🚗 Ô tô',
    favorites:'Yêu thích', newListing:'Tin đăng mới', category:'Danh mục', title:'Tiêu đề', price:'Giá', period:'Thời gian',
    hour:'Giờ', day:'Ngày', week:'Tuần', month:'Tháng', description:'Mô tả', photos:'Ảnh', locationHelp:'Chạm vào bản đồ để chọn vị trí tin đăng.',
    locationNotSelected:'Chưa chọn vị trí', publish:'Đăng tin', titlePlaceholder:'Ví dụ: căn hộ gần biển', pricePlaceholder:'8000000',
    descriptionPlaceholder:'Mô tả, điều kiện thuê...', categoryLabel:'Danh mục', write:'Nhắn tin', owner:'Chủ tin',
    addToFavorites:'♡ Thêm yêu thích', inFavorites:'♥ Đã yêu thích', loading:'Đang tải...', favoritesEmpty:'Chưa có tin nào được lưu.',
    favoritesTelegram:'Yêu thích chỉ khả dụng trong Telegram.', favoriteError:'Không thể tải mục yêu thích.', published:'Đã đăng tin!',
    publishing:'Đang đăng...', chooseLocation:'Hãy chọn vị trí trên bản đồ trước.', maxPhotos:'Tối đa 10 ảnh.',
    apiError:'API chưa khả dụng. Hãy kiểm tra Laravel và cơ sở dữ liệu.', listingPhotoError:'Đã tạo tin nhưng tải ảnh thất bại.',
    location:'📍 {lat}, {lng}', periodHour:'giờ', periodDay:'ngày', periodWeek:'tuần', periodMonth:'tháng'
  },
  hi: {
    addListing:'विज्ञापन', nearby:'पास में', all:'सभी', housing:'🏠 आवास', scooters:'🛵 स्कूटर', motorcycles:'🏍️ मोटरसाइकिल', cars:'🚗 कार',
    favorites:'पसंदीदा', newListing:'नया विज्ञापन', category:'श्रेणी', title:'नाम', price:'कीमत', period:'अवधि',
    hour:'घंटा', day:'दिन', week:'सप्ताह', month:'महीना', description:'विवरण', photos:'फोटो', locationHelp:'विज्ञापन का स्थान चुनने के लिए मानचित्र पर टैप करें।',
    locationNotSelected:'स्थान नहीं चुना गया', publish:'प्रकाशित करें', titlePlaceholder:'उदाहरण: समुद्र के पास अपार्टमेंट', pricePlaceholder:'8000000',
    descriptionPlaceholder:'विवरण, किराये की शर्तें...', categoryLabel:'श्रेणी', write:'संदेश', owner:'मालिक',
    addToFavorites:'♡ पसंदीदा में जोड़ें', inFavorites:'♥ पसंदीदा में', loading:'लोड हो रहा है...', favoritesEmpty:'अभी कुछ भी सेव नहीं है।',
    favoritesTelegram:'पसंदीदा केवल Telegram में उपलब्ध है।', favoriteError:'पसंदीदा लोड नहीं हो सका।', published:'विज्ञापन प्रकाशित हो गया!',
    publishing:'प्रकाशित हो रहा है...', chooseLocation:'पहले मानचित्र पर स्थान चुनें।', maxPhotos:'अधिकतम 10 फोटो।',
    apiError:'API अभी उपलब्ध नहीं है। Laravel और डेटाबेस की जाँच करें।', listingPhotoError:'विज्ञापन बन गया, लेकिन फोटो अपलोड नहीं हुईं।',
    location:'📍 {lat}, {lng}', periodHour:'घंटा', periodDay:'दिन', periodWeek:'सप्ताह', periodMonth:'महीना'
  },
  si: {
    addListing:'දැන්වීම', nearby:'අසල', all:'සියල්ල', housing:'🏠 නිවාස', scooters:'🛵 ස්කූටර්', motorcycles:'🏍️ මෝටර්සයිකල්', cars:'🚗 කාර්',
    favorites:'ප්‍රියතම', newListing:'නව දැන්වීම', category:'වර්ගය', title:'මාතෘකාව', price:'මිල', period:'කාලය',
    hour:'පැය', day:'දින', week:'සතිය', month:'මාසය', description:'විස්තරය', photos:'ඡායාරූප', locationHelp:'දැන්වීමේ ස්ථානය තේරීමට සිතියම මත තට්ටු කරන්න.',
    locationNotSelected:'ස්ථානය තෝරා නැත', publish:'පළ කරන්න', titlePlaceholder:'උදාහරණය: මුහුද අසල මහල් නිවාසය', pricePlaceholder:'8000000',
    descriptionPlaceholder:'විස්තරය, කුලී කොන්දේසි...', categoryLabel:'වර්ගය', write:'පණිවිඩය', owner:'හිමිකරු',
    addToFavorites:'♡ ප්‍රියතමයට', inFavorites:'♥ ප්‍රියතමයේ', loading:'පූරණය වෙමින්...', favoritesEmpty:'තවම කිසිවක් සුරැකී නැත.',
    favoritesTelegram:'ප්‍රියතම Telegram තුළ පමණක් ඇත.', favoriteError:'ප්‍රියතම පූරණය කළ නොහැක.', published:'දැන්වීම පළ කරන ලදී!',
    publishing:'පළ කරමින්...', chooseLocation:'පළමුව සිතියම මත ස්ථානය තෝරන්න.', maxPhotos:'ඡායාරූප 10ක් දක්වා.',
    apiError:'API තවම ලබා ගත නොහැක. Laravel සහ දත්ත සමුදාය පරීක්ෂා කරන්න.', listingPhotoError:'දැන්වීම සාදන ලදී, නමුත් ඡායාරූප උඩුගත නොවීය.',
    location:'📍 {lat}, {lng}', periodHour:'පැය', periodDay:'දින', periodWeek:'සතිය', periodMonth:'මාසය'
  },
  ta: {
    addListing:'விளம்பரம்', nearby:'அருகில்', all:'அனைத்தும்', housing:'🏠 வீடுகள்', scooters:'🛵 ஸ்கூட்டர்கள்', motorcycles:'🏍️ மோட்டார் சைக்கிள்கள்', cars:'🚗 கார்கள்',
    favorites:'விருப்பங்கள்', newListing:'புதிய விளம்பரம்', category:'வகை', title:'தலைப்பு', price:'விலை', period:'காலம்',
    hour:'மணி', day:'நாள்', week:'வாரம்', month:'மாதம்', description:'விளக்கம்', photos:'புகைப்படங்கள்', locationHelp:'விளம்பர இடத்தைத் தேர்ந்தெடுக்க வரைபடத்தைத் தட்டவும்.',
    locationNotSelected:'இடம் தேர்ந்தெடுக்கப்படவில்லை', publish:'வெளியிடு', titlePlaceholder:'உதாரணம்: கடலுக்கு அருகிலுள்ள அபார்ட்மென்ட்', pricePlaceholder:'8000000',
    descriptionPlaceholder:'விளக்கம், வாடகை நிபந்தனைகள்...', categoryLabel:'வகை', write:'செய்தி', owner:'உரிமையாளர்',
    addToFavorites:'♡ விருப்பங்களில் சேர்', inFavorites:'♥ விருப்பங்களில்', loading:'ஏற்றுகிறது...', favoritesEmpty:'இன்னும் எதுவும் சேமிக்கப்படவில்லை.',
    favoritesTelegram:'விருப்பங்கள் Telegram-ல் மட்டுமே கிடைக்கும்.', favoriteError:'விருப்பங்களை ஏற்ற முடியவில்லை.', published:'விளம்பரம் வெளியிடப்பட்டது!',
    publishing:'வெளியிடுகிறது...', chooseLocation:'முதலில் வரைபடத்தில் இடத்தைத் தேர்ந்தெடுக்கவும்.', maxPhotos:'அதிகபட்சம் 10 புகைப்படங்கள்.',
    apiError:'API இன்னும் கிடைக்கவில்லை. Laravel மற்றும் தரவுத்தளத்தைச் சரிபார்க்கவும்.', listingPhotoError:'விளம்பரம் உருவாக்கப்பட்டது, ஆனால் புகைப்படங்கள் பதிவேற்றப்படவில்லை.',
    location:'📍 {lat}, {lng}', periodHour:'மணி', periodDay:'நாள்', periodWeek:'வாரம்', periodMonth:'மாதம்'
  },
  kok: {
    addListing:'जाहिरात', nearby:'लागीं', all:'सगळें', housing:'🏠 घरां', scooters:'🛵 स्कूटर', motorcycles:'🏍️ मोटारसायकल', cars:'🚗 कार',
    favorites:'आवडते', newListing:'नवी जाहिरात', category:'वर्ग', title:'शीर्षक', price:'दर', period:'काळ',
    hour:'तास', day:'दिस', week:'सप्तक', month:'म्हयनो', description:'विवरण', photos:'फोटो', locationHelp:'जाहिरातीचें थार निवडपाखातीर नकाशाचेर टॅप करात.',
    locationNotSelected:'थार निवडलें ना', publish:'प्रकाशित करात', titlePlaceholder:'देखीक: दर्यादेग अपार्टमेंट', pricePlaceholder:'8000000',
    descriptionPlaceholder:'विवरण, भाड्याच्या अटी...', categoryLabel:'वर्ग', write:'संदेश', owner:'मालक',
    addToFavorites:'♡ आवडत्यांत दवरात', inFavorites:'♥ आवडत्यांत', loading:'लोड जाता...', favoritesEmpty:'आतां मेरेन कितेंच सेव केल्लें ना.',
    favoritesTelegram:'आवडते फकत Telegram भितर उपलब्ध.', favoriteError:'आवडते लोड जाले ना.', published:'जाहिरात प्रकाशित जाली!',
    publishing:'प्रकाशित जाता...', chooseLocation:'पयलीं नकाशाचेर थार निवडात.', maxPhotos:'जास्तीत जास्त 10 फोटो.',
    apiError:'API अजून उपलब्ध ना. Laravel आनी डेटाबेस तपासात.', listingPhotoError:'जाहिरात तयार जाली, पूण फोटो अपलोड जाले ना.',
    location:'📍 {lat}, {lng}', periodHour:'तास', periodDay:'दिस', periodWeek:'सप्तक', periodMonth:'म्हयनो'
  },
  mr: {
    addListing:'जाहिरात', nearby:'जवळपास', all:'सर्व', housing:'🏠 घर', scooters:'🛵 स्कूटर', motorcycles:'🏍️ मोटारसायकल', cars:'🚗 कार',
    favorites:'आवडते', newListing:'नवीन जाहिरात', category:'श्रेणी', title:'नाव', price:'किंमत', period:'कालावधी',
    hour:'तास', day:'दिवस', week:'आठवडा', month:'महिना', description:'वर्णन', photos:'फोटो', locationHelp:'जाहिरातीचे ठिकाण निवडण्यासाठी नकाशावर टॅप करा.',
    locationNotSelected:'ठिकाण निवडलेले नाही', publish:'प्रकाशित करा', titlePlaceholder:'उदा. समुद्राजवळील अपार्टमेंट', pricePlaceholder:'8000000',
    descriptionPlaceholder:'वर्णन, भाड्याच्या अटी...', categoryLabel:'श्रेणी', write:'संदेश', owner:'मालक',
    addToFavorites:'♡ आवडत्यांत जोडा', inFavorites:'♥ आवडत्यांत', loading:'लोड होत आहे...', favoritesEmpty:'अजून काहीही जतन केलेले नाही.',
    favoritesTelegram:'आवडते फक्त Telegram मध्ये उपलब्ध आहेत.', favoriteError:'आवडते लोड करता आली नाहीत.', published:'जाहिरात प्रकाशित झाली!',
    publishing:'प्रकाशित होत आहे...', chooseLocation:'प्रथम नकाशावर ठिकाण निवडा.', maxPhotos:'जास्तीत जास्त 10 फोटो.',
    apiError:'API अद्याप उपलब्ध नाही. Laravel आणि डेटाबेस तपासा.', listingPhotoError:'जाहिरात तयार झाली, पण फोटो अपलोड झाले नाहीत.',
    location:'📍 {lat}, {lng}', periodHour:'तास', periodDay:'दिवस', periodWeek:'आठवडा', periodMonth:'महिना'
  }
};

const languageNames = {ru:'Русский',en:'English',vi:'Tiếng Việt',hi:'हिन्दी',si:'සිංහල',ta:'தமிழ்',kok:'कोंकणी',mr:'मराठी'};
const regionNames = {
  nha_trang:{ru:'Нячанг',en:'Nha Trang',vi:'Nha Trang',hi:'न्हा ट्रांग',si:'නා ට්‍රෑන්ග්',ta:'நா ட்ராங்',kok:'Nha Trang',mr:'न्हा ट्रांग'},
  da_nang:{ru:'Дананг',en:'Da Nang',vi:'Đà Nẵng',hi:'दा नांग',si:'දා නං',ta:'டா நாங்',kok:'Da Nang',mr:'दा नांग'},
  goa:{ru:'Гоа',en:'Goa',vi:'Goa',hi:'गोवा',si:'ගෝවා',ta:'கோவா',kok:'गोंय',mr:'गोवा'},
  sri_lanka:{ru:'Шри-Ланка',en:'Sri Lanka',vi:'Sri Lanka',hi:'श्रीलंका',si:'ශ්‍රී ලංකාව',ta:'இலங்கை',kok:'Sri Lanka',mr:'श्रीलंका'}
};
let lang = localStorage.getItem('rentmap_lang') || 'ru';
let currentRegion = localStorage.getItem('rentmap_region') || 'nha_trang';

function t(key) {
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}
function regionLabel(region) {
  return regionNames[region]?.[lang] ?? regionNames[region]?.en ?? region;
}
function applyTranslations() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => el.placeholder = t(el.dataset.i18nPlaceholder));
  const langSelect = document.getElementById('languageSelect');
  const regionSelect = document.getElementById('regionSelect');
  if (langSelect) langSelect.value = lang;
  if (regionSelect) {
    Array.from(regionSelect.options).forEach(o => { o.textContent = regionLabel(o.value); });
    regionSelect.value = currentRegion;
  }
  document.getElementById('selectedLocation').textContent = t('locationNotSelected');
}
function setupSelectors() {
  const languageSelect = document.getElementById('languageSelect');
  const regionSelect = document.getElementById('regionSelect');
  languageSelect.innerHTML = LANGUAGES.map(code => `<option value="${code}">${languageNames[code]}</option>`).join('');
  regionSelect.innerHTML = Object.keys(REGIONS).map(code => `<option value="${code}">${regionLabel(code)}</option>`).join('');
  languageSelect.value = lang;
  regionSelect.value = currentRegion;
  languageSelect.onchange = async () => {
    lang = languageSelect.value;
    localStorage.setItem('rentmap_lang', lang);
    applyTranslations();
    render(listings);
  };
  regionSelect.onchange = async () => {
    currentRegion = regionSelect.value;
    localStorage.setItem('rentmap_region', currentRegion);
    map.setView(REGIONS[currentRegion].center, REGIONS[currentRegion].zoom);
    try { await loadListings(); } catch (error) { console.error(error); }
  };
}

const map = L.map('map').setView(REGIONS[currentRegion].center, REGIONS[currentRegion].zoom);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'© OpenStreetMap'}).addTo(map);

let markers = [];
let currentCategory = 'all';
let listings = [];

const fmtPrice = (n, c) => new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : lang === 'vi' ? 'vi-VN' : 'en-US').format(Number(n)) + ' ' + c;
const fmtMapPrice = (n, c) => {
  const value = Number(n);
  if (!Number.isFinite(value)) return '';
  const units = c === 'VND' ? [[1e9,'B'],[1e6,'M'],[1e3,'K']] : [[1e9,'B'],[1e6,'M'],[1e3,'K']];
  for (const [unit, suffix] of units) if (value >= unit) {
    const v = value / unit;
    return (v >= 100 ? Math.round(v) : v >= 10 ? v.toFixed(1).replace(/\.0$/,'') : v.toFixed(1).replace(/\.0$/,'')) + suffix;
  }
  return String(Math.round(value));
};
const periodLabel = p => ({hour:t('periodHour'),day:t('periodDay'),week:t('periodWeek'),month:t('periodMonth')}[p] || p);
const escapeHtml = value => String(value ?? '').replace(/[&<>\\"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','\\\"':'&quot;',"'":'&#039;'}[ch]));
const photoUrl = path => path ? `${window.RENTMAP_STORAGE_BASE || ''}/storage/${String(path).replace(/^\\//, '')}` : '';

function normalizeListing(x) {
  return {...x, lat:Number(x.latitude ?? x.lat), lon:Number(x.longitude ?? x.lon), category:x.category?.slug ?? x.category_slug ?? x.category};
}
function renderListingStrip(list) {
  const strip=document.getElementById('listingStrip');
  if(!strip)return;
  const visible=list.filter(x=>currentCategory==='all'||x.category===currentCategory);
  strip.innerHTML=visible.map((x,i)=>{ const photo=Array.isArray(x.photos)&&x.photos[0]?photoUrl(x.photos[0].path):''; return `<article class="listing-card" data-listing-index="${i}">
    ${photo?`<img class="listing-card-photo" src="${escapeHtml(photo)}" alt="" loading="lazy">`:''}
    <div class="listing-card-body">
    <div class="listing-card-title">${escapeHtml(x.title)}</div>
    <div class="listing-card-price">${fmtPrice(x.price,x.currency)} / ${escapeHtml(periodLabel(x.price_period ?? x.period))}</div>
    <div class="listing-card-meta">${escapeHtml(x.category_name||x.category||'')}</div>
    <div class="listing-card-desc">${escapeHtml(x.description||'')}</div>
    </div>
  </article>`}).join('');
  strip.querySelectorAll('.listing-card').forEach((card,i)=>card.onclick=()=>{showListing(visible[i]);if(markers[i]){map.setView(markers[i].getLatLng(),Math.max(map.getZoom(),15));markers[i].openPopup();}});
}
function render(list) {
  markers.forEach(m => m.remove()); markers = [];
  list.filter(x => currentCategory === 'all' || x.category === currentCategory).forEach(x => {
    const icon = L.divIcon({
      className:'map-pin-icon',
      html:`<div class="map-pin"><div class="map-pin-content">${fmtMapPrice(x.price,x.currency)}<small>${escapeHtml(x.title)}</small></div></div>`,
      iconSize:[54,54],
      iconAnchor:[10,54],
      popupAnchor:[0,-54]
    });
    const m=L.marker([x.lat,x.lon],{icon}).addTo(map);
    m.on('click',()=>showListing(x)); markers.push(m);
  });
  renderListingStrip(list);
}
async function toggleFavorite(id,button) {
  const initData=tg?.initData; if(!initData)return;
  const active=button.dataset.favorite==='1';
  const res=await fetch(`${API_BASE}/favorites/${id}`,{method:active?'DELETE':'POST',headers:{'X-Telegram-Init-Data':initData}});
  if(!res.ok)return;
  button.dataset.favorite=active?'0':'1'; button.textContent=active?t('addToFavorites'):t('inFavorites');
}
function showListing(x) {
  const period=x.price_period ?? x.period;
  const categoryName=x.category?.name ?? x.category ?? '—';
  const photos=Array.isArray(x.photos)?x.photos:[];
  const gallery=photos.length?`<div class="listing-gallery">${photos.map(p=>{const url=photoUrl(p.path);return url?`<img src="${url}" alt="" loading="lazy">`:''}).join('')}</div>`:'';
  document.getElementById('sheetContent').innerHTML=`${gallery}<div class="listing-title">${escapeHtml(x.title)}</div><div class="listing-price">${fmtPrice(x.price,x.currency)} / ${periodLabel(period)}</div><div class="listing-meta">${t('categoryLabel')}: ${escapeHtml(categoryName)}</div>${x.description?`<div class="listing-meta listing-description">${escapeHtml(x.description)}</div>`:''}`;
  document.getElementById('favoriteArea').innerHTML=`<button class="favorite-btn" data-favorite="0" onclick="toggleFavorite(${x.id},this)">${t('addToFavorites')}</button>`;
  const owner=x.user||x.owner;
  const ownerName=owner?[owner.first_name,owner.last_name].filter(Boolean).join(' ')||(owner.username?'@'+owner.username:t('owner')):'';
  const ownerPhoto=owner?.photo_url?`<img class="owner-avatar" src="${escapeHtml(owner.photo_url)}" alt="">`:'<div class="owner-avatar"></div>';
  document.getElementById('ownerArea').innerHTML=owner?`<div class="owner-card">${ownerPhoto}<div><div class="owner-name">${escapeHtml(ownerName)}</div>${owner.username?`<div class="owner-username">@${escapeHtml(owner.username)}</div>`:''}</div>${owner.username?`<button class="contact-owner" onclick="window.open('https://t.me/${encodeURIComponent(owner.username)}','_blank')">${t('write')}</button>`:''}</div>`:'';
  document.getElementById('sheet').classList.remove('hidden');
}
async function loadFavorites() {
  const initData=tg?.initData, box=document.getElementById('favoritesContent');
  if(!initData){box.innerHTML=`<div class="listing-meta">${t('favoritesTelegram')}</div>`;return;}
  box.innerHTML=`<div class="listing-meta">${t('loading')}</div>`;
  const res=await fetch(API_BASE+'/favorites',{headers:{'X-Telegram-Init-Data':initData}});
  if(!res.ok){box.innerHTML=`<div class="listing-meta">${t('favoriteError')}</div>`;return;}
  const data=await res.json();
  if(!data.length){box.innerHTML=`<div class="listing-meta">${t('favoritesEmpty')}</div>`;return;}
  box.innerHTML=data.map(x=>'<button class="favorite-item" data-id="'+x.id+'"><b>'+escapeHtml(x.title)+'</b><span>'+fmtPrice(x.price,x.currency)+' / '+periodLabel(x.price_period)+'</span></button>').join('');
  box.querySelectorAll('.favorite-item').forEach(btn=>btn.onclick=()=>{const x=data.find(v=>Number(v.id)===Number(btn.dataset.id));if(x){document.getElementById('favoritesSheet').classList.add('hidden');showListing(normalizeListing(x));}});
}
async function loadListings() {
  const params=new URLSearchParams({limit:'100',region:currentRegion});
  if(currentCategory!=='all')params.set('category',currentCategory);
  const response=await fetch(`${API_BASE}/listings?${params.toString()}`);
  if(!response.ok)throw new Error('Не удалось загрузить объявления');
  listings=(await response.json()).map(normalizeListing); render(listings);
}
async function loadNearby(lat,lng) {
  const params=new URLSearchParams({lat:String(lat),lng:String(lng),radius:'10',limit:'100'});
  if(currentCategory!=='all')params.set('category',currentCategory);
  const response=await fetch(`${API_BASE}/listings?${params.toString()}`);
  if(!response.ok)throw new Error('Не удалось загрузить объявления рядом');
  listings=(await response.json()).map(normalizeListing); render(listings);
}

document.getElementById('closeSheet').onclick=()=>document.getElementById('sheet').classList.add('hidden');
document.getElementById('filtersBtn').onclick=()=>document.getElementById('filterSheet').classList.toggle('hidden');
document.getElementById('closeFilterSheet').onclick=()=>document.getElementById('filterSheet').classList.add('hidden');
document.getElementById('languageBtn').onclick=()=>document.getElementById('languageSelect').click();
document.querySelectorAll('.filter').forEach(btn=>{btn.onclick=async()=>{document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));document.querySelectorAll(`.filter[data-category="${btn.dataset.category}"]`).forEach(b=>b.classList.add('active'));currentCategory=btn.dataset.category;document.getElementById('filterSheet').classList.add('hidden');try{await loadListings();}catch(error){console.error(error);}};});
document.getElementById('locateBtn').onclick=()=>{if(!navigator.geolocation)return;navigator.geolocation.getCurrentPosition(async pos=>{const{latitude,longitude}=pos.coords;map.setView([latitude,longitude],15);L.circleMarker([latitude,longitude],{radius:7}).addTo(map);try{await loadNearby(latitude,longitude);}catch(error){console.error(error);}});};

async function init() {
  setupSelectors();
  applyTranslations();
  try { await loadListings(); }
  catch(error){console.error(error);document.getElementById('sheetContent').innerHTML=`<div class="listing-meta">${t('apiError')}</div>`;}
}
init();

let createMode=false, selectedLat=null, selectedLng=null, selectedMarker=null;
function setCreateLocation(lat,lng){
  selectedLat=lat;selectedLng=lng;
  document.getElementById('selectedLocation').textContent=t('location').replace('{lat}',lat.toFixed(6)).replace('{lng}',lng.toFixed(6));
  if(selectedMarker)selectedMarker.remove();selectedMarker=L.marker([lat,lng]).addTo(map);
}
document.getElementById('addListingBtn').onclick=()=>{if(!inTelegram)return;createMode=true;document.getElementById('sheet').classList.add('hidden');document.getElementById('createSheet').classList.remove('hidden');document.getElementById('formMessage').textContent=t('locationHelp');};
document.getElementById('closeCreate').onclick=()=>{createMode=false;document.getElementById('createSheet').classList.add('hidden');if(selectedMarker){selectedMarker.remove();selectedMarker=null;}};
map.on('click',event=>{if(!createMode)return;setCreateLocation(event.latlng.lat,event.latlng.lng);});
document.getElementById('listingForm').addEventListener('submit',async event=>{
  event.preventDefault();
  if(selectedLat===null||selectedLng===null){document.getElementById('formMessage').textContent=t('chooseLocation');return;}
  const initData=tg?.initData;if(!initData)return;
  const payload={category_id:Number(document.getElementById('listingCategory').value),title:document.getElementById('listingTitle').value.trim(),description:document.getElementById('listingDescription').value.trim()||null,price:Number(document.getElementById('listingPrice').value),currency:'VND',price_period:document.getElementById('listingPeriod').value,latitude:selectedLat,longitude:selectedLng,status:'active'};
  const message=document.getElementById('formMessage'),photoInput=document.getElementById('listingPhotos'),selectedPhotos=Array.from(photoInput.files||[]);
  if(selectedPhotos.length>10){message.textContent=t('maxPhotos');return;}
  message.textContent=t('publishing');
  try{
    const response=await fetch(`${API_BASE}/listings`,{method:'POST',headers:{'Content-Type':'application/json','X-Telegram-Init-Data':initData},body:JSON.stringify(payload)});
    const data=await response.json(); if(!response.ok)throw new Error(data.message||'Failed');
    if(selectedPhotos.length){
      const formData=new FormData();selectedPhotos.forEach(file=>formData.append('photos[]',file));
      const photoResponse=await fetch(`${API_BASE}/listings/${data.id}/photos`,{method:'POST',headers:{'X-Telegram-Init-Data':initData},body:formData});
      const photoData=await photoResponse.json();if(!photoResponse.ok)throw new Error(photoData.message||t('listingPhotoError'));
    }
    message.textContent=t('published');createMode=false;document.getElementById('listingForm').reset();
    setTimeout(async()=>{document.getElementById('createSheet').classList.add('hidden');if(selectedMarker){selectedMarker.remove();selectedMarker=null;}await loadListings();},700);
  }catch(error){console.error(error);message.textContent=error.message;}
});
document.getElementById('favoritesBtn').onclick=async()=>{document.getElementById('sheet').classList.add('hidden');document.getElementById('favoritesSheet').classList.remove('hidden');await loadFavorites();};
document.getElementById('closeFavorites').onclick=()=>document.getElementById('favoritesSheet').classList.add('hidden');
