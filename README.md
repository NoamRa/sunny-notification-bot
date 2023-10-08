# Shopping Helper Bot

Telegram bot that manages shopping list
https://t.me/ShoopingHelperBot

### Run

```console
npm start
```

### Develop

#### First time setup

```console
git clone https://github.com/NoamRa/shopping-helper-bot.git
cd shopping-helper-bot
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
  cd /home/pi/code/shopping-helper-bot
  npm run start:unattended &
  cd -
  ```
* If git throws with "detected dubious ownership in repository", run `sudo git config --global --add safe.directory /path/to/shopping-helper-bot
