export type ConnectorRouteMatch = {
	kind: string
	instanceId: string
	rest: string
}

export type UserScopedConnectorRouteMatch = ConnectorRouteMatch & {
	username: string
}

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

export function buildUsernamePathPrefix(username: string) {
	return `/@${encodeURIComponent(username.trim())}`
}

/**
 * Stable Durable Object id segment for a remote connector WebSocket session.
 */
export function connectorSessionKey(kind: string, instanceId: string): string {
	const k = kind.trim().toLowerCase()
	const id = instanceId.trim()
	return `${k}:${id}`
}

export function parseConnectorRoutePath(
	pathname: string,
): ConnectorRouteMatch | null {
	const parts = pathname.split('/').filter(Boolean)

	if (parts.length >= 3 && parts[0] === 'connectors' && parts[1] && parts[2]) {
		const decodedKind = decodePathSegment(parts[1])
		const decodedInstanceId = decodePathSegment(parts[2])
		if (!decodedKind || !decodedInstanceId) return null
		const kind = decodedKind.trim()
		const instanceId = decodedInstanceId.trim()
		if (!kind || !instanceId) return null
		const rest = parts.length > 3 ? `/${parts.slice(3).join('/')}` : ''
		return { kind, instanceId, rest }
	}

	return null
}

export function parseUserScopedConnectorRoutePath(
	pathname: string,
): UserScopedConnectorRouteMatch | null {
	const parts = pathname.split('/').filter(Boolean)

	if (
		parts.length >= 4 &&
		parts[0]?.startsWith('@') &&
		parts[0].length > 1 &&
		parts[1] === 'connectors' &&
		parts[2] &&
		parts[3]
	) {
		const decodedUsername = decodePathSegment(parts[0].slice(1))
		const decodedKind = decodePathSegment(parts[2])
		const decodedInstanceId = decodePathSegment(parts[3])
		if (!decodedUsername || !decodedKind || !decodedInstanceId) return null
		const username = decodedUsername.trim()
		const kind = decodedKind.trim().toLowerCase()
		const instanceId = decodedInstanceId.trim()
		if (!username || !kind || !instanceId) return null
		const rest = parts.length > 4 ? `/${parts.slice(4).join('/')}` : ''
		return { username, kind, instanceId, rest }
	}

	return null
}

export function connectorIngressPath(kind: string, instanceId: string): string {
	const k = kind.trim().toLowerCase()
	const id = encodeURIComponent(instanceId.trim())
	return `/connectors/${encodeURIComponent(k)}/${id}`
}

export function userScopedConnectorIngressPath(input: {
	username: string
	kind: string
	instanceId: string
}): string {
	const k = input.kind.trim().toLowerCase()
	const id = encodeURIComponent(input.instanceId.trim())
	return `${buildUsernamePathPrefix(input.username)}/connectors/${encodeURIComponent(k)}/${id}`
}

export function connectorSessionUrl(input: {
	workerBaseUrl: string
	kind: string
	instanceId: string
}) {
	const url = new URL(
		connectorIngressPath(input.kind, input.instanceId),
		`${trimTrailingSlash(input.workerBaseUrl)}/`,
	)
	return url.toString()
}

export function connectorWebSocketUrl(input: {
	workerBaseUrl: string
	kind: string
	instanceId: string
}) {
	const url = new URL(connectorSessionUrl(input))
	url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
	return url.toString()
}

export function userScopedConnectorSessionUrl(input: {
	workerBaseUrl: string
	username: string
	kind: string
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
	kind: string
	instanceId: string
}) {
	const url = new URL(userScopedConnectorSessionUrl(input))
	url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
	return url.toString()
}
