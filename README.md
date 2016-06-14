# srbot

*A Slack bot for Student Robotics*

srbot is a Slack bot written with Node, for helping out with Student Robotics.

## Getting Started

```
npm install
```

Get your bot API key. If you do not yet have a bot, [create one](https://my.slack.com/services/new/bot).
To run the bot:
```
BOT_API_KEY=<api-key> node bin/bot.js
>>> BOT_API_KEY=XXXX-XXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXX node bin/bot.js
```

## Features

### NLP

SRBot has natural language parsing using [natural](https://npmjs.org/package/natural). If you ask SRBot for help, it will tell you what else it can be queried about. At the moment the parsing is not very advanced, so if SRBot tells you the type of answer it is looking for, and you don't use, probably nothing will happen.

### Linking

SRBot can also link to trac tickets and gerrit commits.
