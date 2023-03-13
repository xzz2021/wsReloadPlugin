<!--
 * @Date: 2023-03-08 08:19:37
 * @LastEditors: xzz
 * @LastEditTime: 2023-03-13 09:41:15
-->
# wsReloadPlugin

### a webpack auto reload plugin for chrome extension v3 developers
#####  The run steps:  
#####    &emsp;1.create a websocket server and client in node,when evertime compiler is finished, send message to content client
#####    &emsp;2.create a websocket client in content to receive message, then send command to service worker
#####    &emsp;3.service worker listen the command to reload runtime and tab

  in your webpack.config.js, add the following code
  ````js
  // the parameters and default values: 
        // { port = 7777 } 
  const { wsAutoReloadPlugin } = require('ws-reload-plugin')
  //  ...config
  plugins: [
      new wsAutoReloadPlugin(),
  ]
  ````
  in your content.js(content_scripts), add the following code
  ````js
        // the parameters and default values: 
        // {recconnectTime = 6, port = 7777, message = 'compiler'} 
        import { createWsConnect } from 'ws-reload-plugin'
        createWsConnect({})  
  ````
  in your background.js(service_worker), add the following code
  ````js
  //  the parameters and default values::  yourMsg: String = 'compiler'
     import { bgdListenMsg } from 'ws-reload-plugin'
     bgdListenMsg() // yourMsg must be same as message of content.js

  ````
####  The plugin is optimizing, if you have any good idea, just connect me, learn from each other, thank you !!!
####  [my telegram](https://t.me/xzz2020)
####  At the same time, I have created another full version of the cli to develop chrome extension v3, which is use vue, you can see it in my [github page](https://github.com/xzz2021/chrome-extension-v3-auto-reload).