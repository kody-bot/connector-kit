import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
	createJsonRpcErrorResponse,
	createJsonRpcRequest,
	createJsonRpcResultResponse,
	isConnectorJsonRpcEnvelope,
	parseConnectorMessage,
	stringifyConnectorMessage,
} from '../src/protocol.ts'

test('parses connector hello messages and normalizes kind', () => {
	assert.deepEqual(
		parseConnectorMessage(
			JSON.stringify({
				type: 'connector.hello',
				connectorKind: ' HOME ',
				connectorId: 'default',
				sharedSecret: 'secret',
			}),
		),
		{
			type: 'connector.hello',
			connectorKind: 'home',
			connectorId: 'default',
			sharedSecret: 'secret',
		},
	)
})

test('parses connector JSON-RPC envelopes from ArrayBuffer payloads', () => {
	const payload = new TextEncoder().encode(
		JSON.stringify({
			type: 'connector.jsonrpc',
			message: createJsonRpcRequest('1', 'tools/list'),
		}),
	).buffer
	const parsed = parseConnectorMessage(payload)

	assert.equal(isConnectorJsonRpcEnvelope(parsed), true)
	assert.deepEqual(parsed, {
		type: 'connector.jsonrpc',
		message: {
			jsonrpc: '2.0',
			id: '1',
			method: 'tools/list',
			params: {},
		},
	})
})

test('creates JSON-RPC result and error responses', () => {
	assert.deepEqual(createJsonRpcResultResponse('1', { ok: true }), {
		jsonrpc: '2.0',
		id: '1',
		result: { ok: true },
	})
	assert.deepEqual(createJsonRpcErrorResponse('1', -32602, 'Invalid input'), {
		jsonrpc: '2.0',
		id: '1',
		error: {
			code: -32602,
			message: 'Invalid input',
		},
	})
})

test('stringifies server messages', () => {
	assert.equal(
		stringifyConnectorMessage({ type: 'server.ack', connectorId: 'default' }),
		'{"type":"server.ack","connectorId":"default"}',
	)
})

test('rejects invalid connector messages', () => {
	assert.throws(
		() => parseConnectorMessage(JSON.stringify({ type: 'connector.hello' })),
		/Invalid connector hello payload/,
	)
	assert.throws(
		() =>
			parseConnectorMessage(
				JSON.stringify({
					type: 'connector.hello',
					connectorKind: 1,
					connectorId: 'default',
					sharedSecret: 'secret',
				}),
			),
		/connectorKind must be a string/,
	)
	assert.throws(
		() => parseConnectorMessage(JSON.stringify({ type: 'unknown' })),
		/Unknown connector message type/,
	)
})
