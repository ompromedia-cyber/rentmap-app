# RentMap Telegram Mini App

Telegram Mini App для поиска ближайшей аренды жилья, скутеров, мотоциклов и автомобилей на карте.

## Стек

- Laravel 11 / PHP 8.2+
- MySQL 8+
- Telegram WebApp authentication
- Leaflet + OpenStreetMap
- Vanilla HTML/CSS/JavaScript

## Что уже работает

- Карта Leaflet с объявлениями
- Фильтры: жильё / скутеры / мото / авто
- Поиск рядом с пользователем
- Цена и название прямо на маркере
- Детальная карточка объявления
- Профиль владельца и кнопка «Написать» в Telegram
- Создание объявления внутри Telegram
- Выбор точки объявления на карте
- До 10 фотографий на объявление
- Избранное
- Telegram WebApp initData HMAC-проверка
- MySQL spatial POINT SRID 4326 и поиск по радиусу

## API

Публичные:

- `GET /api/categories`
- `GET /api/listings?lat=&lng=&radius=&category=`
- `GET /api/listings/{id}`

Требуют Telegram initData:

- `POST /api/telegram/auth`
- `POST /api/listings`
- `POST /api/listings/{id}/photos`
- `DELETE /api/listing-photos/{photo}`
- `GET /api/favorites`
- `POST /api/favorites/{listing}`
- `DELETE /api/favorites/{listing}`

Заголовок:

```
X-Telegram-Init-Data: <initData>
```

## Установка на SprintHost

### 1. Требования

На сайте/сервере нужны:

- PHP 8.2 или новее
- Composer
- MySQL 8
- HTTPS
- SSH желательно, но можно загрузить проект архивом

### 2. Создать сайт

Рекомендуемый document root:

```
/path/to/rentmap-app/public
```

Важно: корень домена должен указывать именно на папку `public`, а не на корень Laravel-проекта.

### 3. Загрузить проект

Через SSH:

```
git clone https://github.com/ompromedia-cyber/rentmap-app.git
cd rentmap-app
composer install --no-dev --optimize-autoloader
```

Если GitHub-репозиторий приватный, используйте GitHub Deploy Key/SSH или загрузите ZIP проекта через панель SprintHost.

### 4. Создать .env

```
cp .env.example .env
php artisan key:generate
```

Заполните:

```env
APP_NAME=RentMap
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://ВАШ-ДОМЕН

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ИМЯ_БД
DB_USERNAME=ПОЛЬЗОВАТЕЛЬ_БД
DB_PASSWORD=ПАРОЛЬ_БД

TELEGRAM_BOT_TOKEN=ТОКЕН_БОТА

FILESYSTEM_DISK=public
```

### 5. База данных

Создайте MySQL-базу в панели SprintHost, затем:

```
php artisan migrate --force
```

Категории жилья, скутеров, мотоциклов и авто создаются миграцией автоматически.

### 6. Фотографии

Выполните:

```
php artisan storage:link
```

Папки Laravel должны быть доступны для записи:

```
storage/
bootstrap/cache/
```

### 7. Очистить/закешировать конфигурацию

```
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
```

После изменения `.env` повторяйте:

```
php artisan optimize:clear
php artisan config:cache
```

### 8. Проверка

Откройте:

```
https://ВАШ-ДОМЕН/
https://ВАШ-ДОМЕН/up
https://ВАШ-ДОМЕН/api/categories
```

Главная страница должна открыть карту RentMap.

`/up` должен вернуть успешный ответ Laravel.

`/api/categories` должен вернуть 4 категории.

### 9. Подключить Telegram

В @BotFather:

1. Откройте своего бота.
2. Создайте/настройте Mini App.
3. Укажите HTTPS URL вашего сайта, например:
   `https://rentmap.example.com/`
4. Используйте именно тот же URL в Mini App, который реально открывает `public/index.html`.

Токен этого бота должен быть указан в:

```
TELEGRAM_BOT_TOKEN=...
```

### 10. Что не нужно делать

- Не запускайте Node.js.
- Не нужен npm.
- Не нужен отдельный VPS.
- Не нужен отдельный API-домен.
- Не нужно отдельно настраивать CORS, если Mini App и API находятся на одном домене.

## Локальный запуск

```
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve
```

Для локального Telegram Mini App нужен HTTPS-доступный URL; для production используйте домен SprintHost.

## Структура production

```
rentmap-app/
├── app/
├── bootstrap/
├── config/
├── database/
├── public/
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   ├── index.php
│   └── .htaccess
├── routes/
├── storage/
├── .env
└── artisan
```

## Важно

Не загружайте настоящий `.env` и Telegram Bot Token в GitHub.

Production должен использовать:

```
APP_DEBUG=false
```
