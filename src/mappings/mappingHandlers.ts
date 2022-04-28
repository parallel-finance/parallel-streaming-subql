import { SubstrateEvent } from '@subql/types'
import { StreamingHandler } from '../handlers/streaming'

export async function handleStreamCreated(event: SubstrateEvent): Promise<void> {
  const handler = new StreamingHandler(event)

  await handler.handleStreamCreated()
}
