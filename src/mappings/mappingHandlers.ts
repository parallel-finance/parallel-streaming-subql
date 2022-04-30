import { SubstrateEvent } from '@subql/types'
import { processStreamCreatedEvent, processStreamWithdrawnEvent } from "../handlers/executors/stream";

export async function handleStreamCreated(event: SubstrateEvent): Promise<void> {
  await processStreamCreatedEvent(event)
}

export async function handleStreamWithdrawn(event: SubstrateEvent): Promise<void> {
  const {event: {method}} = event;
  logger.info(`event: ${JSON.stringify(event)}`);
  await processStreamWithdrawnEvent(event)
}
