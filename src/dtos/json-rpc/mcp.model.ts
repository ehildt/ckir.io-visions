export type SupportedToolMethod = "tools/list" | "tools/call" | "initialize";

export type SupportedToolFunction = "visions.analyze";

export type McpGenericType<
  T extends {
    requestedTools?: any;
    name?: SupportedToolFunction;
  } = {
    arguments: any;
    requestedTools?: any;
    name?: SupportedToolFunction;
  },
> = {
  id: number;
  jsonrpc: "2.0";
  method: SupportedToolMethod;
  params: T;
};
