<!--
 * @Date: 2023-03-08 08:19:37
 * @LastEditors: xzz2021
 * @LastEditTime: 2023-03-11 09:54:59
-->
# wsReloadPlugin

### a webpack plugin for chrome extension v3 development 


  in your webpack.config.js
  ````js
  const { wsAutoReloadPlugin } = require('ws-reload-plugin')
  //  ...config
  plugins: [
      new wsAutoReloadPlugin(),
  ]

  ````
  in your content.js(content_scripts), you need add those
  ````js
        // the parameters :  {recconnectTime = 6, port = 7777, message = 'compiler'}  default value
        import { createWsConnect } from 'ws-reload-plugin'
        createWsConnect({})  // if you want to use default values, remember to add {} as a parameter
  ````

  in your background.js(service_worker), add those
  ````js
  //  the arguments :  yourMsg = 'compiler' (default is 'compiler)
     import { bgdListenMsg } from 'ws-reload-plugin'
     bgdListenMsg(yourMsg) // yourMsg must be same as yourMsg of content.js

  ````
####  the plugin is optimizing, if you have any good idea, just connect me, learn from each other, thank you !!!
####  TG: https://t.me/xzz2020