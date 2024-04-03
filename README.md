# Sunny Notification Bot

Telegram bot that notifies when it's sunny https://t.me/SunnyNotificationBot

### Run

```console
npm start
```

### Develop

#### First time setup

```console
git clone https://github.com/NoamRa/sunny-notification-bot.git
cd sunny-notification-bot
npm install
```

Fill `.env` file

```console
cp example.env .env
```

and add the bot's token and allowed users

To develop use

```console
npm run dev
```

#### Steps to run attended

##### Using `rc.local`

- Add start:unattended command to `/etc/rc.local` or any startup script:
  ```sh
  cd /path/to/sunny-notification-bot
  npm run start:unattended &
  cd -
  ```
- If not working, check `/var/log/syslog`, or better yet
  `cat /var/log/syslog | grep -B 3 -A 3 sunny-notification-bot`
- If git throws with "detected dubious ownership in repository", run
  `sudo git config --global --add safe.directory /path/to/sunny-notification-bot`

##### Using pm2

- If not installed already, install [pm2](https://pm2.keymetrics.io) and set up autostart using `pm2 startup`
- Navigate to project root and register sunny-notification-bot with pm2:
  ```sh
  pm2 start ecosystem.config.cjs
  ```
- Save setup with `pm2 save`

#### Remote debugging

- Configure target on [chrome://inspect/#devices](chrome://inspect/#devices) to
  match server's IP address ex: `192.168.0.123:9229`.
- Use the `inspect` option with `0.0.0.0:9229` as host:
  ```sh
  node --inspect=0.0.0.0:9229 --max-old-space-size=abc ./src/main.js
  ```
- Server should appear as remote target. Click inspect to open Chrome DevTools.

### TODO

[] Retry when `getWeather` fails (communicate failure to user after retries?)
[] Users
[] User can choose wether to get morning notification, hourly notifications
[] USer can set their location
