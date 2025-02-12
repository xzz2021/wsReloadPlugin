const WebSocketNode = require("ws");
const path = require("path");
const fs = require("fs");

const bgCode = `
const bgdListenMsg = () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === "compiler") {
      sendResponse("reload successful")
      chrome.tabs.query({ url: sender.url }, ([tab]) => {
        if (tab) {
          chrome.tabs.reload(tab.id)
          chrome.runtime.reload()
        }
      })
    }
  })
}
if (CREATE_LISTENSER) {
  bgdListenMsg()
}
`;
const contentCode = `
const createWsConnect = () => {
  const options = { reconnectTimes: 20, message: "compiler" }
  const { reconnectTimes, message } = options
  let reconnectCount = 0
  let ws = null
  function connect() {
    ws = new WebSocket("ws://localhost:PORTPORT")
    ws.onopen = () => {
      console.log("Connection established:", new Date())
      reconnectCount = 0
      ws.send("bg")
    }
    ws.onmessage = event => {
      try {
        if (JSON.parse(event.data) === "编译完成了bg") {
          chrome.runtime.sendMessage(message, response => {
            if (response === "reload successful") {
              console.log("Page reload initiated")
            }
          })
        }
      } catch (error) {
        console.error("Message processing error:", error)
      }
    }
    ws.onclose = () => {
      console.log("Connection closed. Reconnect attempt " + (reconnectCount + 1) + "/" + reconnectTimes)
      if (ws) {
        ws.close()
        ws = null
      }
      if (++reconnectCount < reconnectTimes) {
        setTimeout(connect, 3000)
      }
    }
    ws.onerror = error => {
      console.error("WebSocket error:", error)
    }
  }

  connect()
}
if (CREATE_WEBSOCKET) {
  createWsConnect()
}
`;
class WsAutoReloadPlugin {
  constructor(options) {
    const entryFiles = options?.entryFiles;
    if (!entryFiles?.content || !entryFiles?.background) {
      throw new Error("entryFiles is required");
    }
    const options2 = { port: 2021, ...options };
    const autoRun = options?.autoRun || { content: true, background: true };
    const autoRun2 = { content: true, background: true, ...autoRun };
    this.fileArray = [
      {
        filename: entryFiles.content,
        content: contentCode
          .replace("PORTPORT", options2.port)
          .replace("CREATE_WEBSOCKET", autoRun2.content),
      },
      {
        filename: entryFiles.background,
        content: bgCode.replace("CREATE_LISTENSER", autoRun2.background),
      },
    ];
    this.entryFiles = entryFiles;
    this.port = options2.port;
    this.serverClient = null;
    this.wpClient = null;
  }

  createWsServer() {
    try {
      const wss = new WebSocketNode.Server({ port: this.port }); //  服务端
      this.serverClient = wss;
      //   开启服务端server
      wss.on("connection", (ws) => {
        //此处ws代表当前发送消息过来的客户端
        // 有任意新的客户端连接时 //监听来自其他客户端的消息
        ws.on("message", function message(data) {
          //data收到的是 Buffery  数据
          if (data.toString() == "bg") {
            ws.id = "bg";
          }
          if (data.toString() == "编译完成") {
            //  服务端作为中间人收到webpack客户端编译完成消息,然后通知bgd客户端
            console.log("---current clients sum----:", wss.clients.size);
            wss.clients.forEach((ws) => {
              if (ws.id == "bg") {
                // 区分bgd身份
                ws.send(JSON.stringify("编译完成了bg"));
                console.log(
                  "----compiler successful----send message----",
                  new Date().toLocaleString()
                );
              }
            });
          }
        });
      });
    } catch (error) {
      console.error("Failed to create WebSocket server:", error);
    }
  }

  handleClientError(error) {
    console.error("WebSocket client error:", error);
  }

  createWsClient() {
    const client = new WebSocketNode(`ws://127.0.0.1:${this.port}`);
    client.on("error", this.handleClientError.bind(this));
    this.wpClient = client;
  }

  destroy() {
    if (!this.serverClient) return;
    this.serverClient.clients.forEach((ws) => ws.close());
    this.serverClient.close();
    if (!this.wpClient) return;
    this.wpClient.close();
  }

  apply(compiler) {
    this.createWsServer();
    this.createWsClient();
    compiler.hooks.afterEmit.tapAsync(
      "WsAutoReloadPlugin",
      (compilation, callback) => {
        this.fileArray.forEach((file) => {
          const filePath = path.join(
            compilation.outputOptions.path,
            file.filename
          );
          const content = fs.readFileSync(filePath, "utf-8");
          if (content.includes(file.content)) return;
          const newContent = file.content + content;
          fs.writeFileSync(filePath, newContent, "utf-8");
        });
        this.wpClient.send("编译完成");
        callback();
      }
    );
    // 当退出webpack时,关闭服务
    process.on("exit", () => {
      this.destroy();
    });
  }
}

module.exports = { WsAutoReloadPlugin };
