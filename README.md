<!--
 * @Date: 2023-03-08 08:19:37
 * @LastEditors: xzz
 * @LastEditTime: 2023-03-18 10:48:17
-->
##### wsReloadPlugin [中文](https://github.com/xzz2021/wsReloadPlugin/blob/main/README_zh.md)

### a webpack auto reload plugin for chrome extension v3 developers
#####  The run steps:  
 * 1.create a websocket server and client in node,when everytime compiler is finished,send message to content client(why not service worker? it will sleep, it needs event driven)
 * 2.create a websocket client in content to receive message, then send command to service worker
 * 3.service worker listen the command to reload runtime and tab

  > in your webpack.config.js, add the following code
  ````js
  // the parameter:  { port = 7777 } 
  const { wsAutoReloadPlugin } = require('ws-reload-plugin')
  plugins: [
      new wsAutoReloadPlugin(),
  ]
  ````
  > in your content.js(content_scripts), add the following code
  ````js
// the parameter: {reconnectTime = 20, port = 7777, message = 'compiler'} 
// the interval of each reconnect is 3 seconds, it will reconnect 20 times by default
  const { createWsConnect } = require('ws-reload-plugin')
  createWsConnect({})
// or use ES module
  import { createWsConnect } from 'ws-reload-plugin'
  createWsConnect({})
  ````
  > in your background.js(service_worker), add the following code
  ````js
// the parameters and default values::  bgdListenMsg(yourMsg = 'compiler')
// yourMsg must be as same as parameters.message in createWsConnect({})
    const { bgdListenMsg } = require('ws-reload-plugin')
    bgdListenMsg()
 // or use ES module
  import { bgdListenMsg } from 'ws-reload-plugin'
  bgdListenMsg()
  ````
  ###### [my complete vue3-based cli for extension develop](https://github.com/xzz2021/crx-cli)
 
  ###### here are all history versions [npmjs](https://www.npmjs.com/package/ws-reload-plugin?activeTab=readme)