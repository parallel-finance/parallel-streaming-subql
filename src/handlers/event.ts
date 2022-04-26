import { SubstrateEvent } from '@subql/types'
import { StreamingHandler } from './crowdloans'

export class EventHandler {
  private event: SubstrateEvent

  constructor(event: SubstrateEvent) {
    this.event = event
  }

  public async save() {
    await StreamingHandler.checkAndSave(this.event)
  }
}
