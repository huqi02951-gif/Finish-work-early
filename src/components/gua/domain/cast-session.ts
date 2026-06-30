import { resolveCast } from './cast-engine'
import { castOneLine } from './random'
import type { CastMethod, CastRecord, CastSession, LineValue } from './types'

export function startCast(method: CastMethod): CastSession {
  return {
    id: crypto.randomUUID(),
    method,
    line_values: [],
    created_at: new Date().toISOString(),
  }
}

export function appendLineToCastSession(
  session: CastSession,
  line: LineValue,
): CastSession {
  if (session.line_values.length >= 6) {
    throw new Error('六爻已满，不能继续起爻')
  }

  return {
    ...session,
    line_values: [...session.line_values, line],
  }
}

export function castNextLine(session: CastSession): CastSession {
  return appendLineToCastSession(session, castOneLine(session.method))
}

export function finalizeCastSession(session: CastSession): CastRecord {
  if (session.line_values.length !== 6) {
    throw new Error('六爻未满，不能揭卦')
  }

  const { record } = resolveCast(session.line_values)
  return {
    id: session.id,
    method: session.method,
    created_at: session.created_at,
    ...record,
  }
}
