# RentMap Telegram Mini App

Telegram Mini App for finding nearby rental listings on a map.

## Stack
- Laravel / PHP API
- MySQL 8+
- Telegram WebApp authentication
- Leaflet + OpenStreetMap
- Vanilla HTML/CSS/JavaScript frontend

## Rental categories
- Housing
- Scooters
- Motorcycles
- Cars

## MVP
The initial MVP contains a responsive map interface, category filters, location-based search, highlighted listing names/prices, and a MySQL schema for the Laravel backend.

## Planned API
- GET /api/categories
- GET /api/listings?lat=&lng=&radius=&category_id=
- GET /api/listings/{id}
- POST /api/listings
- POST /api/favorites/{listing}
- DELETE /api/favorites/{listing}
- POST /api/telegram/auth

## Run frontend locally
Open `frontend/index.html` in a browser or serve the `frontend` directory with any static HTTP server.

## Database
See `database/schema.sql`.
