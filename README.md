# Invixe App

A mobile app for learning the stock market in a fun, interactive way (like Duolingo).

## Project Structure

```
invixe/
├── app/        # React Native frontend
├── server/     # Node.js backend (Express + Prisma + MongoDB)
```

---

## Getting Started

### 1. Frontend (React Native)

```
cd app
npm install
npm run android   # or npm run ios
```

### 2. Backend (Node.js + Express + Prisma + MongoDB)

```
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev
```

- Configure your MongoDB connection string in `server/.env`.
- Edit lessons, users, and progress models in `server/prisma/schema.prisma`.

---

## Folders
- `app/` - React Native mobile app
- `server/` - Backend API 