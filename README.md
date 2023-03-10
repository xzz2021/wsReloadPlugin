# wsReloadPlugin

a webpack plugin for chrome extension v3 development 
#### this plugin is incomplete,  i will complete it soon, around one week, before that, you can try this:
you need use it with content and service worker
arguments: the default port is 7777, 
  ````js
  {
    port: your_port
  }
  ````
  in your webpack config.js
  ````js
  const wsAutoReloadPlugin = require('ws-reload-plugin')
  //  ...config
  plugins: [
      new wsAutoReloadPlugin(),
  ]

  ````
  in your content.js, you need add those
  ````js
  let recconnectTime = 0
function createWsConnect() {
  const ws = new WebSocket('ws://localhost:7777')
  function checkConnect(){  // 不完全心跳检测,清除上次的ws,新开ws进行初始化操作
    setTimeout(() => {
      createWsConnect()
    }, 5000);
  }
  ws.onopen = (e) => {
    console.log('---bg----连接----正常-----:', new Date())
    ws.send("bg")
  }
  
  ws.onmessage = (e) => {
      if(JSON.parse(e.data) == '编译完成了bg'){
        // API.sendMessage({type: 'complier'})
        chrome.runtime.sendMessage( {type: 'complier'}, (response) => {
            // console.log('-----------option: -----response-------', response)
            response? resolve(response): resolve('异常中断')
          })
      }
  }
ws.onclose =  (e) => {  // 服务端或客户端主动断开时 触发
    console.log('--------bg--------断开------:',recconnectTime,'----------', new Date())
    //连接关闭后主动断开此次连接
    ws.close()
    recconnectTime ++    //  重连次数
    if(recconnectTime <= 10)  {createWsConnect()}
  }
}
createWsConnect()
  ````

  in your background.js, you need add those
  ````js

  chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    if(message.type == 'complier'){
      chrome.tabs.query({ active: true }, ([tab]) => {
        
        if (true) {  
          chrome.runtime.reload()
          chrome.tabs.reload()
        } else {
          chrome.runtime.reload()
        }
      })
      // sendResponse('reload successful')
  }
  })
  ````
####  此插件需要搭配content.js以及background.js(service worker)一起使用，后期会整合
#### 大致流程  webpack建立websocket服务端，和一个客户端发送编译完成通知，content建立一个客户端接收响应，收到消息后通知background执行刷新
详细介绍：https://juejin.cn/post/7207444169358737466