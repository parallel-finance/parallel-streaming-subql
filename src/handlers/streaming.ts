import { SubstrateEvent } from '@subql/types'
import { STREAMINGEXECUTORS, Executor } from './executors'

export class StreamingHandler {
  static async checkAndSave(substrateEvent: SubstrateEvent) {
    const {
      event: { method }
    } = substrateEvent
    logger.info(`event method: ${method}`);
    if (method in STREAMINGEXECUTORS) {
      await STREAMINGEXECUTORS[method](substrateEvent)
    } else {
      logger.info(`event method: ${method}`);
      logger.warn(`Ignore unknown streaming method ${method}`)
    }
  }
}
