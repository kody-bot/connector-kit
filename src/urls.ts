export type ConnectorRouteMatch = {
	kind: string
	instanceId: string
	rest: string
}

function trimTrailingSlash(value: string) {
	let trimmed = value
	while (trimmed.endsWith('/')) {
		trimmed = trimmed.slice(0, -1)
	}
	return trimmed
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
	const decodeSegment = (value: string) => {
		try {
			return decodeURIComponent(value)
		} catch {
			return null
		}
	}

	if (parts.length >= 3 && parts[0] === 'connectors' && parts[1] && parts[2]) {
		const decodedKind = decodeSegment(parts[1])
		const decodedInstanceId = decodeSegment(parts[2])
		if (!decodedKind || !decodedInstanceId) return null
		const kind = decodedKind.trim()
		const instanceId = decodedInstanceId.trim()
		if (!kind || !instanceId) return null
		const rest = parts.length > 3 ? `/${parts.slice(3).join('/')}` : ''
		return { kind, instanceId, rest }
	}

	return null
}

export function connectorIngressPath(kind: string, instanceId: string): string {
	const k = kind.trim().toLowerCase()
	const id = encodeURIComponent(instanceId.trim())
	return `/connectors/${encodeURIComponent(k)}/${id}`
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
