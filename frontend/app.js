const tg=window.Telegram?.WebApp; tg?.ready(); tg?.expand();

const demoListings=[
 {id:1,category:'housing',title:'Апартаменты у моря',price:8000000,currency:'VND',period:'month',lat:12.245,lon:109.194},
 {id:2,category:'scooter',title:'Honda Air Blade',price:150000,currency:'VND',period:'day',lat:12.252,lon:109.191},
 {id:3,category:'motorcycle',title:'Honda CB150R',price:300000,currency:'VND',period:'day',lat:12.249,lon:109.200},
 {id:4,category:'car',title:'Toyota Vios',price:650000,currency:'VND',period:'day',lat:12.238,lon:109.188}
];

const map=L.map('map').setView([12.245,109.194],14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);

let markers=[];
let currentCategory='all';

const fmtPrice=(n,c)=>new Intl.NumberFormat('ru-RU').format(n)+' '+c;
const periodLabel=p=>({hour:'час',day:'день',week:'нед.',month:'мес.'}[p]||p);

function render(list){
  markers.forEach(m=>m.remove()); markers=[];
  list.filter(x=>currentCategory==='all'||x.category===currentCategory).forEach(x=>{
    const icon=L.divIcon({className:'',html:`<div class="price-marker">${fmtPrice(x.price,x.currency)}<small>${periodLabel(x.period)} · ${x.title}</small></div>`,iconAnchor:[55,18]});
    const m=L.marker([x.lat,x.lon],{icon}).addTo(map);
    m.on('click',()=>showListing(x)); markers.push(m);
  });
}
function showListing(x){
  document.getElementById('sheetContent').innerHTML=`
    <div class="listing-title">${x.title}</div>
    <div class="listing-price">${fmtPrice(x.price,x.currency)} / ${periodLabel(x.period)}</div>
    <div class="listing-meta">Категория: ${x.category}</div>`;
  document.getElementById('sheet').classList.remove('hidden');
}
document.getElementById('closeSheet').onclick=()=>document.getElementById('sheet').classList.add('hidden');

document.querySelectorAll('.filter').forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); currentCategory=btn.dataset.category; render(demoListings);
});

document.getElementById('locateBtn').onclick=()=>{
  if(!navigator.geolocation)return;
  navigator.geolocation.getCurrentPosition(pos=>{
    map.setView([pos.coords.latitude,pos.coords.longitude],16);
    L.circleMarker([pos.coords.latitude,pos.coords.longitude],{radius:7}).addTo(map);
  });
};

render(demoListings);
