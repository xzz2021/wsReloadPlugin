<!--
 * @Date: 2023-03-08 08:19:37
 * @LastEditors: xzz
 * @LastEditTime: 2023-03-17 16:13:56
-->
# wsReloadPlugin

sorry for a tiny bug, please use the version 1.0.5 
### a webpack auto reload plugin for chrome extension v3 developers
#####  The run steps:  
#####    &emsp;1.create a websocket server and client in node,when everytime compiler is finished, 
#####    &emsp;send message to content client(why not service worker? it will sleep, it need event driven)
#####    &emsp;2.create a websocket client in content to receive message, then send command to service worker
#####    &emsp;3.service worker listen the command to reload runtime and tab

  in your webpack.config.js, add the following code
  ````js
  // the parameters and default values:  { port = 7777 } 
  const { wsAutoReloadPlugin } = require('ws-reload-plugin')
  plugins: [
      new wsAutoReloadPlugin(),
  ]
  ````
  in your content.js(content_scripts), add the following code
  ````js
// the parameters and default values: {reconnectTime = 6, port = 7777, message = 'compiler'} 
// each reconnectTime is 3 seconds, when webpack is stop, it will reconnect 6 times by default
      import { createWsConnect } from 'ws-reload-plugin'
      createWsConnect({}) // {} is required
  ````
  in your background.js(service_worker), add the following code
  ````js
// the parameters and default values::  bgdListenMsg(yourMsg = 'compiler')
// yourMsg must be as same as parameters.message in createWsConnect({})
     import { bgdListenMsg } from 'ws-reload-plugin'
     bgdListenMsg()

  ````
####  The plugin is optimizing, if you have any good idea, just connect me, learn from each other, thank you !!!
####  [my telegram group](https://t.me/my7dtd)
#####  At the same time, I had created another full version cli to develop chrome extension v3 which is use vue3, you can see it in my [github page](https://github.com/xzz2021/chrome-extension-v3-auto-reload).