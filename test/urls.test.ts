import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
	buildUsernamePathPrefix,
	connectorIngressPath,
	connectorSessionKey,
	connectorSessionUrl,
	connectorWebSocketUrl,
	isValidRemoteConnectorName,
	normalizeRemoteConnectorInstanceId,
	parseConnectorRoutePath,
	parseUserScopedConnectorRoutePath,
	userScopedConnectorIngressPath,
	userScopedConnectorSessionUrl,
	userScopedConnectorWebSocketUrl,
} from '../src/urls.ts'

test('normalizes and validates remote connector names', () => {
	assert.equal(normalizeRemoteConnectorInstanceId(' HOME '), 'home')
	assert.equal(isValidRemoteConnectorName('home'), true)
	assert.equal(isValidRemoteConnectorName('living-room'), true)
	assert.equal(isValidRemoteConnectorName('living room'), false)
	assert.equal(isValidRemoteConnectorName('-bad'), false)
})

test('creates connector session keys', () => {
	assert.equal(
		connectorSessionKey('user-123', 'default'),
		JSON.stringify(['user-123', 'default']),
	)
	assert.equal(
		connectorSessionKey(' user-123 ', 'HOME'),
		JSON.stringify(['user-123', 'home']),
	)
})

test('parses connector routes', () => {
	assert.deepEqual(
		parseConnectorRoutePath('/connectors/alpha/rpc/tools-list'),
		{
			instanceId: 'alpha',
			rest: '/rpc/tools-list',
		},
	)
	assert.deepEqual(parseConnectorRoutePath('/connectors/home'), {
		instanceId: 'home',
		rest: '',
	})
	assert.deepEqual(parseConnectorRoutePath('/connectors/custom'), {
		instanceId: 'custom',
		rest: '',
	})
})

test('parses username-scoped connector routes', () => {
	assert.deepEqual(
		parseUserScopedConnectorRoutePath(
			'/@kentcdodds/connectors/alpha/rpc/tools-list',
		),
		{
			username: 'kentcdodds',
			instanceId: 'alpha',
			rest: '/rpc/tools-list',
		},
	)
	assert.deepEqual(
		parseUserScopedConnectorRoutePath(
			'/@user%40example.com/connectors/living-room',
		),
		{
			username: 'user@example.com',
			instanceId: 'living-room',
			rest: '',
		},
	)
	assert.deepEqual(parseUserScopedConnectorRoutePath('/@kentcdodds/connectors/home'), {
		username: 'kentcdodds',
		instanceId: 'home',
		rest: '',
	})
	assert.equal(parseUserScopedConnectorRoutePath('/connectors/home'), null)
	assert.equal(parseUserScopedConnectorRoutePath('/@/connectors/home'), null)
	assert.deepEqual(
		parseUserScopedConnectorRoutePath('/@kentcdodds/connectors/home/default'),
		{
			username: 'kentcdodds',
			instanceId: 'home',
			rest: '/default',
		},
	)
})

test('creates connector ingress and absolute session URLs', () => {
	assert.equal(connectorIngressPath('home'), '/connectors/home')
	assert.equal(connectorIngressPath(' HOME '), '/connectors/home')
	assert.equal(
		connectorSessionUrl({
			workerBaseUrl: 'https://kody.example/',
			instanceId: 'home',
		}),
		'https://kody.example/connectors/home',
	)
	assert.equal(
		connectorWebSocketUrl({
			workerBaseUrl: 'https://kody.example/',
			instanceId: 'alpha',
		}),
		'wss://kody.example/connectors/alpha',
	)
})

test('creates username-scoped connector URLs', () => {
	assert.equal(buildUsernamePathPrefix(' kentcdodds '), '/@kentcdodds')
	assert.equal(
		userScopedConnectorIngressPath({
			username: 'user@example.com',
			instanceId: 'living-room',
		}),
		'/@user%40example.com/connectors/living-room',
	)
	assert.equal(
		userScopedConnectorSessionUrl({
			workerBaseUrl: 'https://kody.example/',
			username: 'kentcdodds',
			instanceId: 'home',
		}),
		'https://kody.example/@kentcdodds/connectors/home',
	)
	assert.equal(
		userScopedConnectorWebSocketUrl({
			workerBaseUrl: 'https://kody.example/',
			username: 'kentcdodds',
			instanceId: 'home',
		}),
		'wss://kody.example/@kentcdodds/connectors/home',
	)
})
