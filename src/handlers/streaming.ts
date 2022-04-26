import { SubstrateEvent } from '@subql/types'
import { STREAMEXECUTORS, Executor } from './executors'

export class StreamingHandler {
  static async checkAndSave(substrateEvent: SubstrateEvent) {
    const {
      event: { method }
    } = substrateEvent
    if (method in STREAMEXECUTORS) {
      await STREAMEXECUTORS[method](substrateEvent)
    } else {
      logger.warn(`Ignore unknown crowdloan method`)
    }
  }
}