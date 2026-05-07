# @kody-bot/connector-kit

Shared protocol helpers and types for Kody remote connectors.

This package is intentionally small. It exists to hold stable connector
boundaries that are shared by Kody and independently shipped connector repos.

## Install

```sh
npm install @kody-bot/connector-kit
```

## Exports

- `@kody-bot/connector-kit/protocol` — connector WebSocket message types,
  parsers, serializers, and JSON-RPC helpers.
- `@kody-bot/connector-kit/urls` — connector route, session key, and WebSocket
  URL helpers.
- `@kody-bot/connector-kit/schema` — Kody JSON Schema metadata helpers.
- `@kody-bot/connector-kit` — all public exports.

## Protocol

Remote connectors open an outbound WebSocket to Kody and exchange JSON messages:

- connector to Kody: `connector.hello`, `connector.heartbeat`,
  `connector.jsonrpc`
- Kody to connector: `server.ping`, `server.ack`, `server.error`

The connector is expected to answer MCP-style JSON-RPC requests such as
`tools/list` and `tools/call` inside `connector.jsonrpc` envelopes.
