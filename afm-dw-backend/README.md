## Инструкции

```bash
#version of node js is 16.x.x

#available configs
development - для разработки
staging - для тестирования
local - для локального запуска
prod - продакшн для афм

# запуск сервера в режиме разработки
NODE_ENV=development npx nodemon --files hr.ts

# собрать
npm run build

# запуск
npm run start

```

## Docker Compose

```bash
docker-compose up -d

```