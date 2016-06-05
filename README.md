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

1. Help
2. Trac
3. Gerrit
4. Google Groups


### 1 Help

`/srhelp` for how to use srbot.

### 2 Trac

You can use `trac:N` or `t:N` to get a link to https://studentrobotics.org/trac/ticket/N.
e.g. `trac:201` => https://studentrobotics.org/trac/ticket/201

### 3 Gerrit

You can use `gerrit:N` or `ger:N` or `g:N` to get a link to https://www.studentrobotics.org/gerrit/#/c/N/.
e.g. `gerrit:2654` => https://www.studentrobotics.org/gerrit/#/c/2654/
