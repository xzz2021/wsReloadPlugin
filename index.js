/*
 * @Date: 2022-09-27 09:33:17
 * @LastEditors: xzz
 * @LastEditTime: 2023-04-10 15:26:36
 */

//bgd作为通讯的方案不可行,因为bgd会休眠-----需借由content触发事件------


const  WebSocketNode  = require ('ws')

class wsAutoReloadPlugin {
  constructor(options={}) {
      this.port =  options.port || 7777;
  }
   createWsServer(){
    const wss = new WebSocketNode.Server({ port: this.port })  //  服务端
    //   开启服务端server
    wss.on('connection', (ws) => {  //此处ws代表当前发送消息过来的客户端
      // 有任意新的客户端连接时 //监听来自其他客户端的消息
      ws.on('message', function message(data) {
        //data收到的是 Buffery  数据
        if(data.toString() == "bg") { ws.id = 'bg'}
        if(data.toString() == '编译完成' ) {    //  服务端作为中间人收到webpack客户端编译完成消息,然后通知bgd客户端
          console.log('---current clients sum----:', wss.clients.size)
          wss.clients.forEach(ws => {
            if(ws.id == 'bg') {  // 区分bgd身份
              ws.send(JSON.stringify("编译完成了bg"))
              console.log('----compiler successful----send message----', new Date().toLocaleString())
            }
          })
        }
      })
    })
  }

   createWsClient(){
    //新建webpack客户端------------通过中间人身份通知给服务端----------------
    return  new WebSocketNode(`ws://127.0.0.1:${this.port}`)
    // this.wsClient = wsClient;
  }

  apply(compiler) {
    let start = new wsAutoReloadPlugin()
    start.createWsServer()
    let wsClient = start.createWsClient()
    compiler.hooks.afterEmit.tap('wsAutoReloadPlugin', (compilation) => {
      //  每次编译时触发
      wsClient.send('编译完成')
      // console.log('------------编译完成----发送消息---333---:', new Date())
    })
  }
}


const createWsConnect = (options) =>{
  const {reconnectTime = 20, port = 7777, message='compiler'} = options
  window.reconnectTime2 ? '' : window.reconnectTime2 = 0
  const ws = new WebSocket(`ws://localhost:${port}`)
  
  function checkConnect({reconnectTime, port, message}){  // 不完全心跳检测,清除上次的ws,新开ws进行初始化操作
    setTimeout(() => {
      createWsConnect({reconnectTime, port, message})
    }, 3000);
  }
  ws.onopen = (e) => {
    console.log('---content----connect----normal-----:', new Date())
    window.reconnectTime2 = 0
    ws.send("bg")
  }
  ws.onmessage = (e) => {
      if(JSON.parse(e.data) == '编译完成了bg'){
        chrome.runtime.sendMessage( message, (response) => {
          if(response == 'reload successful'){ }
        })
      }
  }
  
ws.onclose =  (e) => {  // 服务端或客户端主动断开时 触发
    console.log('--------content disconnect!------reconnect:',reconnectTime2,'-----', new Date())
    //连接关闭后主动断开此次连接
    ws.close()
    window.reconnectTime2 ++    //  重连次数
    if(window.reconnectTime2 <= reconnectTime){
      checkConnect({reconnectTime, port, message})
    }
  }
}

const bgdListenMsg = (yourMsg = 'compiler') => {
  // chrome.runtime.onInstalled.addListener(function () {  //onInstalled重连时会失败有bug,故移除
    chrome.runtime.onMessage.addListener(
      (message, sender, sendResponse) => {
        if(message == yourMsg){
          sendResponse('reload successful')
          chrome.tabs.query({ url: sender.url }, ([tab]) => {
            chrome.tabs.reload(tab.id)  // reload the tab which sended the message first
            chrome.runtime.reload()
        })
      }
      // })
  })
}

module.exports = {wsAutoReloadPlugin, createWsConnect, bgdListenMsg }