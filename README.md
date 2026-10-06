# antiquadom.ru

Статическая HTML-версия сайта https://antiquadom.ru («Антикварный домъ»), бывший WordPress + Elementor.
Хостинг — Cloudflare Pages.

```
index.html, <раздел>/<страница>/index.html   страницы (чистые URL)
assets/images                                изображения
assets/css                                   стили
assets/js                                    скрипты (в т.ч. динамически подгружаемые чанки Elementor / Hello+)
assets/fonts                                 шрифты (кириллица + латиница)
functions/api/contact.js                     Cloudflare Pages Function: форма обратной связи → письмо
_headers                                     заголовки кеширования
```

## Форма обратной связи

Страница `/contact/`: поля «имя», «телефон», «вопрос» отправляются JSON-ом на `POST /api/contact`
(`functions/api/contact.js`), функция шлёт письмо через [Resend](https://resend.com).

Переменные окружения (Pages → Settings → Variables and Secrets):

| Имя              | Описание                                                           |
|------------------|--------------------------------------------------------------------|
| `RESEND_API_KEY` | API-ключ Resend (secret)                                           |
| `MAIL_TO`        | получатель(и) через запятую, напр. `info@antiquadom.ru`            |
| `MAIL_FROM`      | подтверждённый отправитель, напр. `Сайт <noreply@antiquadom.ru>`   |

Домен отправителя нужно подтвердить в Resend (DNS-записи SPF/DKIM).

## Развёртывание

Cloudflare Pages → Connect to Git → этот репозиторий.
Build command: пусто, Build output directory: `/` (корень). Папка `functions/` подхватывается автоматически.

Локально: `npx wrangler pages dev .` (переменные — в файле `.dev.vars`).

## Заметка

В репозитории есть страницы с очень длинными адресами (до ~250 символов в slug). В Windows включите
`git config core.longpaths true`, иначе checkout может не создать часть файлов.
