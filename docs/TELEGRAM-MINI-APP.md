# Atelier OS as a Telegram Mini App

## Product decision
Atelier OS is mobile-first and launches inside Telegram as a Main Mini App.

## Telegram integration
The root layout loads the official Telegram Web App bridge:
`https://telegram.org/js/telegram-web-app.js?63`.

On launch the client:
1. calls `expand()`;
2. synchronizes Telegram safe-area insets;
3. sets header/background/bottom-bar colors;
4. calls `ready()`;
5. sends raw `initData` to the server for validation.

## Security
Never trust `initDataUnsafe` for authorization.
The server validates raw `initData` with `TELEGRAM_BOT_TOKEN`.
Current validation also rejects data older than one hour.

Status until a real bot token is configured: REAL + UNVERIFIED.

## BotFather setup after deployment
1. Create or select a bot in @BotFather.
2. Open Bot Settings → Configure Mini App → Enable Mini App.
3. Set the deployed HTTPS URL.
4. Configure the Main Mini App and optional menu button.
5. Configure splash screen colors/icon.
6. Test on Telegram iOS, Android and Desktop.

## Required environment
```
NEXT_PUBLIC_APP_URL=https://...
TELEGRAM_BOT_TOKEN=...
```

The bot token is server-only and must never be exposed with a NEXT_PUBLIC_ prefix.
