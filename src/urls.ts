export type ConnectorRouteMatch = {
	instanceId: string
	rest: string
}

export type UserScopedConnectorRouteMatch = ConnectorRouteMatch & {
	username: string
}

export const remoteConnectorNamePattern =
	/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/

function trimTrailingSlash(value: string) {
	let trimmed = value
	while (trimmed.endsWith('/')) {
		trimmed = trimmed.slice(0, -1)
	}
	return trimmed
}

function decodePathSegment(value: string): string | null {
	try {
		return decodeURIComponent(value)
	} catch {
		return null
	}
}

export function normalizeRemoteConnectorInstanceId(instanceId: string): string {
	return instanceId.trim().toLowerCase()
}

export function isValidRemoteConnectorName(instanceId: string): boolean {
	return remoteConnectorNamePattern.test(
		normalizeRemoteConnectorInstanceId(instanceId),
	)
}

export function buildUsernamePathPrefix(username: string) {
	return `/@${encodeURIComponent(username.trim())}`
}

/**
 * Stable Durable Object id segment for a remote connector WebSocket session.
 */
export function connectorSessionKey(userId: string, instanceId: string): string {
	return JSON.stringify([
		userId.trim(),
		normalizeRemoteConnectorInstanceId(instanceId),
	])
}

export function parseConnectorRoutePath(
	pathname: string,
): ConnectorRouteMatch | null {
	const parts = pathname.split('/').filter(Boolean)

	if (parts.length >= 2 && parts[0] === 'connectors' && parts[1]) {
		const decodedInstanceId = decodePathSegment(parts[1])
		if (!decodedInstanceId) return null
		const instanceId = normalizeRemoteConnectorInstanceId(decodedInstanceId)
		if (!isValidRemoteConnectorName(instanceId)) return null
		const rest = parts.length > 2 ? `/${parts.slice(2).join('/')}` : ''
		return { instanceId, rest }
	}

	return null
}

export function parseUserScopedConnectorRoutePath(
	pathname: string,
): UserScopedConnectorRouteMatch | null {
	const parts = pathname.split('/').filter(Boolean)

	if (
		parts.length >= 3 &&
		parts[0]?.startsWith('@') &&
		parts[0].length > 1 &&
		parts[1] === 'connectors' &&
		parts[2]
	) {
		const decodedUsername = decodePathSegment(parts[0].slice(1))
		const decodedInstanceId = decodePathSegment(parts[2])
		if (!decodedUsername || !decodedInstanceId) return null
		const username = decodedUsername.trim()
		const instanceId = normalizeRemoteConnectorInstanceId(decodedInstanceId)
		if (!username || !isValidRemoteConnectorName(instanceId)) return null
		const rest = parts.length > 3 ? `/${parts.slice(3).join('/')}` : ''
		return { username, instanceId, rest }
	}

	return null
}

export function connectorIngressPath(instanceId: string): string {
	const id = encodeURIComponent(normalizeRemoteConnectorInstanceId(instanceId))
	return `/connectors/${id}`
}

export function userScopedConnectorIngressPath(input: {
	username: string
	instanceId: string
}): string {
	const instanceId = encodeURIComponent(
		normalizeRemoteConnectorInstanceId(input.instanceId),
	)
	return `${buildUsernamePathPrefix(input.username)}/connectors/${instanceId}`
}

export function connectorSessionUrl(input: {
	workerBaseUrl: string
	instanceId: string
}) {
	const url = new URL(
		connectorIngressPath(input.instanceId),
		`${trimTrailingSlash(input.workerBaseUrl)}/`,
	)
	return url.toString()
}

export function connectorWebSocketUrl(input: {
	workerBaseUrl: string
	instanceId: string
}) {
	const url = new URL(connectorSessionUrl(input))
	url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
	return url.toString()
}

export function userScopedConnectorSessionUrl(input: {
	workerBaseUrl: string
	username: string
	instanceId: string
}) {
	const url = new URL(
		userScopedConnectorIngressPath(input),
		`${trimTrailingSlash(input.workerBaseUrl)}/`,
	)
	return url.toString()
}

export function userScopedConnectorWebSocketUrl(input: {
	workerBaseUrl: string
	username: string
	instanceId: string
}) {
	const url = new URL(userScopedConnectorSessionUrl(input))
	url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
	return url.toString()
}
