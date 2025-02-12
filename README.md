<!-- ##### wsReloadPlugin [English](https://github.com/xzz2021/wsReloadPlugin/blob/main/README.md) -->

这是一个 webpack 打包工具的 plugin,只有**浏览器插件开发者**用得到,功能类似 webpack 本身就有的 dev-server!

基于 webpack5 和 websocket, 实现浏览器扩展(插件)开发阶段编译完成自动刷新功能!`**此版本为破坏性重构版,不兼容历史版本**`

`安装使用:`

1. 安装

```js
npm install ws-reload-plugin --save-dev
```

2. webpack.config.js 配置文件中引入此模块,必须传入 content 和 background 的编译输出文件名,比如你打包后的文件目录是 dist/content.js 和 dist/service/background.js, 则按下面传参;

```js
const { wsAutoReloadPlugin } = require("ws-reload-plugin");
plugins: [
  new wsAutoReloadPlugin({
    port: 2021, // 选传,  默认2021
    entryFiles: {
      // 必须传参
      content: "./content.js", // content 输出文件path
      background: "./service/background.js", // background 输出文件path
    },
    autoRun: { content: true, background: true }, // 选传, 默认都为true
  }),
];
```

3. ##### 此插件会自动在 content 文件插入 websocket 代码, 创建一个`createWsConnect`函数, background 文件插入监听代码, 创建一个`bgdListenMsg`函数, 默认会直接在顶层调用`

4. 如果你想在 content 里自定义控制创建调用, 比如只想在某些页面挂载,请传入参数 `{autoRun: { content: false}}`, 然后自行调用函数`createWsConnect()`即可

5. 如果你想在 service worker 里自定义控制监听和刷新时机, 请传入参数 `{autoRun: { background: false}}`, 然后添加以下代码到你的自定义逻辑中

```js
//const bgdListenMsg = () => {
//chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
if (message == "compiler") {
  sendResponse("reload successful");
  chrome.tabs.query({ url: sender.url }, ([tab]) => {
    if (tab) {
      chrome.tabs.reload(tab.id);
      chrome.runtime.reload();
    }
  });
}
//  });
//};
```

`实现原理:`

- 1.在 node 环境下创建 websocket 服务端与客户端，每次编译完成后通过 webpack 钩子(hook)发送信息给 content 客户端；(为什么不直接发送给 background？因为 v3 改为 service worker，有自动休眠机制)
- 2.content 客户端收到消息后再发送给 service worker(background)
- 3.service worker 监听命令并执行刷新
