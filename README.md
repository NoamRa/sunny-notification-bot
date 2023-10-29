# Sunny Notification Bot

Telegram bot that notifies when it's sunny
https://t.me/SunnyNotificationBot

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

* Add start:unattended command to `/etc/rc.local` or any startup script:
  ```sh
  cd /path/to/sunny-notification-bot
  npm run start:unattended &
  cd -
  ```
* If not working, check `/var/log/syslog`, or better yet `cat /var/log/syslog | grep -B 3 -A 3 sunny-notification-bot`
* If git throws with "detected dubious ownership in repository", run `sudo git config --global --add safe.directory /path/to/sunny-notification-bot`
