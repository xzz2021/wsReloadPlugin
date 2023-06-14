<!--
 * @Date: 2023-03-08 08:19:37
 * @LastEditors: xzz
 * @LastEditTime: 2023-03-18 10:48:17
-->
##### wsReloadPlugin [English](https://github.com/xzz2021/wsReloadPlugin/blob/main/README.md)

### 基于webpack和websocket开发的谷歌扩展v3开发编译时自动刷新功能模块
#####  运行原理:  
 * 1.在node环境下创建websocket服务端与客户端，每次编译完成后服务端发送信息给content客户端；(为什么不直接发送给background？因为v3改为service worker，有自动休眠机制)
 * 2.content客户端收到消息后发送给service worker
 * 3.service worker监听命令并执行刷新

  > webpack.config.js配置文件中引入此模块
  ````js
  // the parameter:  { port = 7777 } 
  const { wsAutoReloadPlugin } = require('ws-reload-plugin')
  plugins: [
      new wsAutoReloadPlugin(),
  ]
  ````
  > content.js(content_scripts),添加以下引入代码
  ````js
// 默认参数: {reconnectTime = 20, port = 7777, message = 'compiler'} 
// 重连间隔3秒，默认次数20
  const { createWsConnect } = require('ws-reload-plugin')
  createWsConnect({})
// 或者使用ES module
  import { createWsConnect } from 'ws-reload-plugin'
  createWsConnect({})
  ````
  > background.js(service_worker),添加以下引入代码
  ````js
// 编译完成发送的消息内容要和content里的一致，默认是'compiler'
    const { bgdListenMsg } = require('ws-reload-plugin')
    bgdListenMsg()
// 或者使用ES module
  import { bgdListenMsg } from 'ws-reload-plugin'
  bgdListenMsg()
  ````
  ###### [基于webpack搭建的v3版插件完整开发框架](https://github.com/xzz2021/crx-cli)

  ###### 如果有异常，可以在[这里](https://www.npmjs.com/package/ws-reload-plugin?activeTab=readme)安装查看历史版本
