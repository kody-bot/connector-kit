export type JsonRpcId = string | number | null

export type JsonRpcParams =
	| Record<string, unknown>
	| Array<unknown>
	| undefined

export type JsonRpcRequest = {
	jsonrpc: '2.0'
	id?: JsonRpcId
	method: string
	params?: JsonRpcParams
}

export type JsonRpcResultResponse = {
	jsonrpc: '2.0'
	id: JsonRpcId
	result: unknown
}

export type JsonRpcError = {
	code: number
	message: string
	data?: unknown
}

export type JsonRpcErrorResponse = {
	jsonrpc: '2.0'
	id: JsonRpcId
	error: JsonRpcError
}

export type JsonRpcResponse = JsonRpcResultResponse | JsonRpcErrorResponse
export type JsonRpcMessage = JsonRpcRequest | JsonRpcResponse

export type ConnectorToolDescriptor = {
	name: string
	title?: string
	description?: string
	inputSchema?: Record<string, unknown>
	outputSchema?: Record<string, unknown>
	annotations?: Record<string, unknown>
	_meta?: Record<string, unknown>
}

export type ConnectorSnapshot = {
	connectorKind: string
	connectorId: string
	description?: string
	connectedAt: string
	lastSeenAt: string
	tools: Array<ConnectorToolDescriptor>
}

export type ConnectorHelloMessage = {
	type: 'connector.hello'
	connectorKind: string
	connectorId: string
	description?: string
	sharedSecret: string
}

export type ConnectorHeartbeatMessage = {
	type: 'connector.heartbeat'
}

export type ConnectorJsonRpcEnvelope = {
	type: 'connector.jsonrpc'
	message: JsonRpcMessage
}

export type ConnectorToKodyMessage =
	| ConnectorHelloMessage
	| ConnectorHeartbeatMessage
	| ConnectorJsonRpcEnvelope

export type KodyConnectorAckMessage = {
	type: 'server.ack'
	connectorId: string
}

export type KodyConnectorErrorMessage = {
	type: 'server.error'
	message: string
}

export type KodyConnectorPingMessage = {
	type: 'server.ping'
}

export type KodyToConnectorMessage =
	| KodyConnectorAckMessage
	| KodyConnectorErrorMessage
	| KodyConnectorPingMessage

export type ConnectorJsonRpcResponse =
	| JsonRpcResultResponse
	| JsonRpcErrorResponse

export function isConnectorJsonRpcEnvelope(
	value: ConnectorToKodyMessage,
): value is ConnectorJsonRpcEnvelope {
	return value.type === 'connector.jsonrpc'
}

export function parseConnectorMessage(
	raw: string | ArrayBuffer,
): ConnectorToKodyMessage {
	const text =
		typeof raw === 'string'
			? raw
			: new TextDecoder().decode(new Uint8Array(raw))
	const value = JSON.parse(text) as unknown
	if (!value || typeof value !== 'object') {
		throw new Error('Expected object message.')
	}
	const record = value as Record<string, unknown>
	const type = record['type']
	if (type === 'connector.hello') {
		const connectorId = record['connectorId']
		const sharedSecret = record['sharedSecret']
		const connectorKindRaw = record['connectorKind']
		const descriptionRaw = record['description']
		if (
			typeof connectorKindRaw !== 'string' ||
			!connectorKindRaw.trim()
		) {
			throw new Error(
				'Invalid connector hello: connectorKind must be a non-empty string.',
			)
		}
		const connectorKind = connectorKindRaw.trim().toLowerCase()
		if (typeof connectorId !== 'string' || typeof sharedSecret !== 'string') {
			throw new Error('Invalid connector hello payload.')
		}
		return {
			type,
			connectorKind,
			connectorId,
			...(typeof descriptionRaw === 'string' && descriptionRaw.trim()
				? { description: descriptionRaw.trim() }
				: {}),
			sharedSecret,
		}
	}
	if (type === 'connector.heartbeat') {
		return { type }
	}
	if (type === 'connector.jsonrpc') {
		const message = record['message']
		if (!message || typeof message !== 'object') {
			throw new Error('Invalid JSON-RPC envelope payload.')
		}
		return {
			type,
			message: message as ConnectorJsonRpcEnvelope['message'],
		}
	}
	throw new Error(`Unknown connector message type: ${String(type)}`)
}

export function stringifyConnectorMessage(
	message: ConnectorToKodyMessage | KodyToConnectorMessage,
) {
	return JSON.stringify(message)
}

export function createJsonRpcRequest(
	id: Exclude<JsonRpcId, null>,
	method: string,
	params: JsonRpcParams = {},
): JsonRpcRequest {
	return {
		jsonrpc: '2.0',
		id,
		method,
		params,
	}
}

export function createJsonRpcResultResponse(
	id: JsonRpcId,
	result: unknown,
): JsonRpcResultResponse {
	return {
		jsonrpc: '2.0',
		id,
		result,
	}
}

export function createJsonRpcErrorResponse(
	id: JsonRpcId,
	code: number,
	message: string,
	data?: unknown,
): JsonRpcErrorResponse {
	return {
		jsonrpc: '2.0',
		id,
		error: {
			code,
			message,
			...(data === undefined ? {} : { data }),
		},
	}
}
