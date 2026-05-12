import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
	buildUsernamePathPrefix,
	connectorIngressPath,
	connectorSessionKey,
	connectorSessionUrl,
	connectorWebSocketUrl,
	parseConnectorRoutePath,
	parseUserScopedConnectorRoutePath,
	userScopedConnectorIngressPath,
	userScopedConnectorSessionUrl,
	userScopedConnectorWebSocketUrl,
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

test('parses username-scoped connector routes', () => {
	assert.deepEqual(
		parseUserScopedConnectorRoutePath(
			'/@kentcdodds/connectors/custom/alpha/rpc/tools-list',
		),
		{
			username: 'kentcdodds',
			kind: 'custom',
			instanceId: 'alpha',
			rest: '/rpc/tools-list',
		},
	)
	assert.deepEqual(
		parseUserScopedConnectorRoutePath(
			'/@user%40example.com/connectors/HOME/living%20room',
		),
		{
			username: 'user@example.com',
			kind: 'home',
			instanceId: 'living room',
			rest: '',
		},
	)
	assert.equal(parseUserScopedConnectorRoutePath('/connectors/home/default'), null)
	assert.equal(parseUserScopedConnectorRoutePath('/@/connectors/home/default'), null)
	assert.equal(parseUserScopedConnectorRoutePath('/@kentcdodds/connectors/home'), null)
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

test('creates username-scoped connector URLs', () => {
	assert.equal(buildUsernamePathPrefix(' kentcdodds '), '/@kentcdodds')
	assert.equal(
		userScopedConnectorIngressPath({
			username: 'user@example.com',
			kind: 'custom kind',
			instanceId: 'alpha/beta',
		}),
		'/@user%40example.com/connectors/custom%20kind/alpha%2Fbeta',
	)
	assert.equal(
		userScopedConnectorSessionUrl({
			workerBaseUrl: 'https://kody.example/',
			username: 'kentcdodds',
			kind: 'home',
			instanceId: 'default',
		}),
		'https://kody.example/@kentcdodds/connectors/home/default',
	)
	assert.equal(
		userScopedConnectorWebSocketUrl({
			workerBaseUrl: 'https://kody.example/',
			username: 'kentcdodds',
			kind: 'home',
			instanceId: 'default',
		}),
		'wss://kody.example/@kentcdodds/connectors/home/default',
	)
})
