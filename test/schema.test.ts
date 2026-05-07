import assert from 'node:assert/strict'
import { test } from 'node:test'
import { markSecretInputFields, secretInputSchemaFlag } from '../src/schema.ts'

test('marks selected JSON Schema properties as Kody secrets', () => {
	const schema = {
		type: 'object',
		properties: {
			username: { type: 'string' },
			password: { type: 'string' },
		},
	}

	assert.deepEqual(markSecretInputFields(schema, ['password']), {
		type: 'object',
		properties: {
			username: { type: 'string' },
			password: { type: 'string', [secretInputSchemaFlag]: true },
		},
	})
})

test('returns the original schema when no fields are changed', () => {
	const schema = {
		type: 'object',
		properties: {
			username: { type: 'string' },
		},
	}

	assert.equal(markSecretInputFields(schema, ['password']), schema)
	assert.equal(
		markSecretInputFields({ type: 'object' }, ['password']).type,
		'object',
	)
})
