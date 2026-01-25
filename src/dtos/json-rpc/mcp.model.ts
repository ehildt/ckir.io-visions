export type SupportedToolMethod = "tools/list" | "tools/call";

export type SupportedToolFunction = "visions.analyze";

export type McpGenericType<
  T extends {
    requestedTools?: any;
    function?: SupportedToolFunction;
  } = {
    arguments: any;
    requestedTools?: any;
    function: SupportedToolFunction;
  },
> = {
  id: number;
  jsonrpc: "2.0";
  method: SupportedToolMethod;
  params: T;
};
