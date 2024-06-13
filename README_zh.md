
20240613更新: 修复新版本浏览器刷新失效的bug!

##### wsReloadPlugin [English](https://github.com/xzz2021/wsReloadPlugin/blob/main/README.md)

#### 这是一个 webpack 打包工具的 plugin,只有浏览器插件开发者用得到,功能类似 webpack 本身就有的 dev-server!

#### 基于 webpack 和 websocket, 实现浏览器扩展(插件)开发阶段编译完成自动刷新功能!

`运行原理:`

- 1.在 node 环境下创建 websocket 服务端与客户端，每次编译完成后服务端发送信息给 content 客户端；(为什么不直接发送给 background？因为 v3 改为 service worker，有自动休眠机制)
- 2.content 客户端收到消息后发送给 service worker(background)
- 3.service worker 监听命令并执行刷新

> 1. `安装命令:`

```js
npm install ws-reload-plugin --save-dev
```
> 2. webpack.config.js 配置文件中引入此模块
```js
// the parameter:  { port = 7777 }
const { wsAutoReloadPlugin } = require('ws-reload-plugin')
plugins: [new wsAutoReloadPlugin()]
```

>3. content.js(content_scripts)引入代码

```js
// 默认参数: {reconnectTime = 20, port = 7777, message = 'compiler'}
// 重连间隔3秒，默认次数20
const { createWsConnect } = require('ws-reload-plugin')
createWsConnect()
// 或者使用ES module
import { createWsConnect } from 'ws-reload-plugin'
createWsConnect()
```

>4. background.js(service_worker)引入代码

```js
// 编译完成发送的消息内容要和content里的一致，默认是'compiler'
const { bgdListenMsg } = require('ws-reload-plugin')
bgdListenMsg()
// 或者使用ES module
import { bgdListenMsg } from 'ws-reload-plugin'
bgdListenMsg()
```

###### [基于 webpack 搭建的 v3 版插件完整开发框架](https://github.com/xzz2021/crx-cli)

###### 如果有异常，可以在 npmjs 官网[这里](https://www.npmjs.com/package/ws-reload-plugin?activeTab=readme)安装查看历史版本
