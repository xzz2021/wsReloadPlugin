<!--
 * @Date: 2023-03-08 08:19:37
 * @LastEditors: xzz
 * @LastEditTime: 2023-03-18 10:48:17
-->

##### wsReloadPlugin [中文](https://github.com/xzz2021/wsReloadPlugin/blob/main/README_zh.md)

### A webpack plugin for chrome extension v3 developers to compile and automatically refresh

##### Implementation principle:

- 1.create a websocket server and client in node,when everytime compiler is finished,send message to content client(why not service worker? it will sleep and  needs event driven)
- 2.create a websocket client in content to receive message, then send command to service worker(background)
- 3.service worker listen the command to reload runtime and current tab


> 1. `Installation Commands:`

```js
npm install ws-reload-plugin --save-dev
```

>2. Add the following code to the webpack.config.js file

```js
// the parameter:  { port = 7777 }
const { wsAutoReloadPlugin } = require('ws-reload-plugin')
plugins: [new wsAutoReloadPlugin()]
```

>3. Add the following code to the content.js(content_scripts) file

```js
/* When the ws service is disconnected, it will automatically reconnect,
with an interval of 3 seconds each time, and the default reconnection is 20 times */
const { createWsConnect } = require('ws-reload-plugin')
createWsConnect()
// or use ES module
import { createWsConnect } from 'ws-reload-plugin'
createWsConnect()
```

>4. Add the following code to  your service_worker(background) file

```js
// the parameters and default values::  bgdListenMsg(yourMsg = 'compiler')
// yourMsg must be as same as parameters.message in createWsConnect({})
const { bgdListenMsg } = require('ws-reload-plugin')
bgdListenMsg()
// or use ES module
import { bgdListenMsg } from 'ws-reload-plugin'
bgdListenMsg()
```

###### [my complete vue3-based cli for extension develop](https://github.com/xzz2021/crx-cli)

###### here are all history versions [npmjs](https://www.npmjs.com/package/ws-reload-plugin?activeTab=readme)
