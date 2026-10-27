(() => {
  const api = window.RENTMAP_API_BASE || '/api';
  const tgData = () => window.Telegram?.WebApp?.initData || '';
  const labels = () => {
    const lang = window.lang || document.documentElement.lang || 'ru';
    return lang === 'en'
      ? {archive:'Archive',restore:'Publish again',delete:'Delete',confirmArchive:'Archive this listing?',confirmRestore:'Publish this listing again?',confirmDelete:'Delete this listing permanently?'}
      : lang === 'vi'
      ? {archive:'Lưu trữ',restore:'Đăng lại',delete:'Xóa',confirmArchive:'Lưu tin này vào kho?',confirmRestore:'Đăng tin này lại?',confirmDelete:'Xóa tin này vĩnh viễn?'}
      : {archive:'В архив',restore:'Опубликовать',delete:'Удалить',confirmArchive:'Добавить это объявление в архив?',confirmRestore:'Снова опубликовать это объявление?',confirmDelete:'Удалить объявление навсегда?'};
  };

  async function action(id, type) {
    const initData = tgData();
    if (!initData) return;
    const l = labels();
    const questions = {archive:l.confirmArchive, restore:l.confirmRestore, delete:l.confirmDelete};
    if (!window.confirm(questions[type])) return;
    const options = {method:type === 'delete' ? 'DELETE' : 'POST', headers:{'X-Telegram-Init-Data':initData,'Accept':'application/json'}};
    const url = type === 'archive' ? `${api}/listings/${id}/archive` : type === 'restore' ? `${api}/listings/${id}/restore` : `${api}/listings/${id}`;
    try {
      const response = await fetch(url, options);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Request failed');
      if (typeof window.loadMyListings === 'function') await window.loadMyListings();
      if (typeof window.loadListings === 'function') await window.loadListings();
    } catch (error) {
      console.error(error);
      alert(error.message || 'Ошибка');
    }
  }

  function enhance() {
    const box = document.getElementById('myListingsContent');
    if (!box) return;
    box.querySelectorAll('.my-listing-item').forEach(item => {
      if (item.parentElement?.classList.contains('my-listing-row')) return;
      const row = document.createElement('div');
      row.className = 'my-listing-row';
      item.parentNode.insertBefore(row, item);
      row.appendChild(item);
      const id = item.dataset.id;
      const archived = /archived/i.test(item.textContent || '');
      const actions = document.createElement('div');
      actions.className = 'my-listing-actions';
      const archive = document.createElement('button');
      archive.className = 'secondary my-listing-action';
      archive.type = 'button';
      archive.textContent = archived ? labels().restore : labels().archive;
      archive.onclick = e => { e.stopPropagation(); action(id, archived ? 'restore' : 'archive'); };
      const del = document.createElement('button');
      del.className = 'secondary my-listing-action danger';
      del.type = 'button';
      del.textContent = labels().delete;
      del.onclick = e => { e.stopPropagation(); action(id, 'delete'); };
      actions.append(archive, del);
      row.appendChild(actions);
    });
  }

  const install = () => {
    if (typeof window.loadMyListings !== 'function') return setTimeout(install, 100);
    if (window.__listingActionsInstalled) return;
    window.__listingActionsInstalled = true;
    const original = window.loadMyListings;
    window.loadMyListings = async function(...args) {
      await original.apply(this, args);
      enhance();
    };
    enhance();
  };
  install();
})();
