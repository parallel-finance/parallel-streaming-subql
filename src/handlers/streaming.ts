import { SubstrateEvent } from '@subql/types'
import { handleStreamCreated } from "./executors/stream";

export class StreamingHandler {
  private event: SubstrateEvent

  constructor(event: SubstrateEvent) {
    this.event = event
  }

  public async handleStreamCreated() {
    const {
      event: { method }
    } = this.event
    console.log(`event method: ${method}`);
    await handleStreamCreated(this.event);
  }
}
