import { SubstrateEvent } from '@subql/types'
import { StreamingHandler } from './streaming'

export class EventHandler {
  private event: SubstrateEvent

  constructor(event: SubstrateEvent) {
    this.event = event
  }

  public async save() {
    const {
      event: { method }
    } = this.event
    console.log(`event method: ${method}`);
    await StreamingHandler.checkAndSave(this.event)
  }
}
