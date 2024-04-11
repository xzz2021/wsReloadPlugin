interface obj {
  reconnectTime: number
  port: number
  message: string
}
export declare function createWsConnect(options:obj):void


export declare function bgdListenMsg(yourMsg: string):void
