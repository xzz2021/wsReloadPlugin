interface OptionsType {
  port?: number;
  entryFiles: {
    content: string;
    background: string;
  };
  autoRun?: {
    content?: boolean;
    background?: boolean;
  };
}
export declare function WsAutoReloadPlugin(options: OptionsType): void;
