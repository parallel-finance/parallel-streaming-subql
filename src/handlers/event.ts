import { SubstrateEvent } from '@subql/types'
import { StreamingHandler } from './streaming'

export class EventHandler {
  private event: SubstrateEvent

  private lastExt: string

  constructor(event: SubstrateEvent) {
    this.event = event
    const ext = this.event.extrinsic.extrinsic.hash.toString()
    this.lastExt = ext
  }

  public async save() {
    
      await StreamingHandler.checkAndSave(this.event)

  }
}
