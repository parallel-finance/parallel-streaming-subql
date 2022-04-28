import { SubstrateEvent } from '@subql/types'
import { STREAMINGEXECUTORS, Executor } from './executors'

export class StreamingHandler {
  // check last extrinsic forever until this stops
  static lastExt = undefined
  static async checkAndSave(substrateEvent: SubstrateEvent) {
    const {
      event: { method },
      extrinsic
    } = substrateEvent
    const ext = extrinsic.extrinsic.hash.toString()
    // Subquery events usually come with duplicate request as this is GraphQL :/, check whether the record really needs to be saved 
    logger.info(`processing ext at ${ext} with last ext ${this.lastExt}`)
    // check duplicate extrinsic
    if (ext !== this.lastExt && method in STREAMINGEXECUTORS) {
      this.lastExt = ext
      logger.info(`Executing handler with event method: ${method}`)
      await STREAMINGEXECUTORS[method](substrateEvent)
    } else {
      logger.warn(`Ignore unknown streaming method ${method}`)
    }
  }
}
