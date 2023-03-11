/*
 * @Date: 2022-09-27 09:33:17
 * @LastEditors: xzz2021
 * @LastEditTime: 2023-03-11 09:40:40
 */

//bgd作为通讯的方案不可行,因为bgd会休眠-----需借由content触发事件------

// const pluginName = 'wsAutoReloadPlugin';
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
          console.log('----当前总客户端数量----:', wss.clients.size)
          wss.clients.forEach(ws => {
            if(ws.id == 'bg') {  // 区分bgd身份
              ws.send(JSON.stringify("编译完成了bg"))
              console.log('----编译完成----发送给bgd客户端----', new Date().toLocaleString())
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


const createWsConnect = ({recconnectTime = 6, port = 7777, message={type: 'compiler'}}) =>{
  window.recconnectTime2 ? '' : window.recconnectTime2 = 0
  const ws = new WebSocket(`ws://localhost:${port}`)
  function checkConnect({recconnectTime, port, message}){  // 不完全心跳检测,清除上次的ws,新开ws进行初始化操作
    setTimeout(() => {
      createWsConnect({recconnectTime, port, message})
    }, 3000);
  }
  ws.onopen = (e) => {
    console.log('---bg----连接----正常-----:', new Date())
    ws.send("bg")
  }
  ws.onmessage = (e) => {
      if(JSON.parse(e.data) == '编译完成了bg'){
        chrome.runtime.sendMessage( message, (response) => {
          response? resolve(response): resolve('异常中断')
        })
      }
  }
ws.onclose =  (e) => {  // 服务端或客户端主动断开时 触发
    console.log('--------bg--------断开------:',recconnectTime2,'----------', new Date())
    //连接关闭后主动断开此次连接
    ws.close()
    recconnectTime2 ++    //  重连次数
    if(recconnectTime2 <= recconnectTime)  {checkConnect({recconnectTime, port, message})}
  }
}

const bgdListenMsg = (yourMsg = 'compiler') => {
  chrome.runtime.onInstalled.addListener(function () {
    chrome.runtime.onMessage.addListener(
      (message, sender, sendResponse) => {
        if(message == yourMsg){
          chrome.tabs.query({ active: true }, ([tab]) => {
            if (true) {  
              chrome.runtime.reload()
              chrome.tabs.reload()
            } else {
              chrome.runtime.reload()
            }
          })
      }
      sendResponse('reload successful')
      })
  })
}

module.exports = {wsAutoReloadPlugin, createWsConnect, bgdListenMsg }