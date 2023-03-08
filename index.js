/*
 * @Date: 2022-09-27 09:33:17
 * @LastEditors: xzz2021
 * @LastEditTime: 2023-03-08 09:35:24
 */

//bgd作为通讯的方案不可行,因为bgd会休眠-----需借由content触发事件------

// const pluginName = 'wsAutoReloadPlugin';
const  WebSocket  = require ('ws')

class AutoReloadPlugin {
  constructor(options={}) {
      this.port =  options.port || 7777;
  }

   createWsServer(){
    
    const wss = new WebSocket.Server({ port: this.port })  //  服务端
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
    return  new WebSocket(`ws://127.0.0.1:${this.port}`)
    // this.wsClient = wsClient;
  }

  apply(compiler) {
    let start = new AutoReloadPlugin()
    start.createWsServer()
    let wsClient = start.createWsClient()
    compiler.hooks.afterEmit.tap('wsAutoReloadPlugin', (compilation) => {
      //  每次编译时触发
      wsClient.send('编译完成')
      // console.log('------------编译完成----发送消息---333---:', new Date())
    })
  }
}



module.exports = AutoReloadPlugin;