import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
	connectorIngressPath,
	connectorSessionKey,
	connectorSessionUrl,
	connectorWebSocketUrl,
	parseConnectorRoutePath,
} from '../src/urls.ts'

test('creates connector session keys', () => {
	assert.equal(connectorSessionKey('home', 'default'), 'home:default')
	assert.equal(connectorSessionKey('HOME', 'living-room'), 'home:living-room')
	assert.equal(
		connectorSessionKey('home', 'other:default'),
		'home:other:default',
	)
	assert.equal(connectorSessionKey('custom', 'alpha'), 'custom:alpha')
})

test('parses connector routes', () => {
	assert.deepEqual(
		parseConnectorRoutePath('/connectors/custom/alpha/rpc/tools-list'),
		{
			kind: 'custom',
			instanceId: 'alpha',
			rest: '/rpc/tools-list',
		},
	)
	assert.deepEqual(parseConnectorRoutePath('/connectors/home/default'), {
		kind: 'home',
		instanceId: 'default',
		rest: '',
	})
	assert.equal(parseConnectorRoutePath('/connectors/custom'), null)
})

test('creates connector ingress and absolute session URLs', () => {
	assert.equal(
		connectorIngressPath('home', 'default'),
		'/connectors/home/default',
	)
	assert.equal(
		connectorIngressPath('custom kind', 'alpha/beta'),
		'/connectors/custom%20kind/alpha%2Fbeta',
	)
	assert.equal(
		connectorSessionUrl({
			workerBaseUrl: 'https://kody.example/',
			kind: 'home',
			instanceId: 'default',
		}),
		'https://kody.example/connectors/home/default',
	)
	assert.equal(
		connectorWebSocketUrl({
			workerBaseUrl: 'https://kody.example/',
			kind: 'custom',
			instanceId: 'alpha',
		}),
		'wss://kody.example/connectors/custom/alpha',
	)
})
