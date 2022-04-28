import {
  handleStreamCreated,
  handleWithdrawFromStream,
  handleCancelStream
} from './stream'
import { SubstrateEvent } from '@subql/types'

export type Executor = (event: SubstrateEvent) => Promise<void>

export const STREAMING_EXECUTORS: { [method: string]: Executor } = {
  ['CreateStream']: handleStreamCreated,
  ['CancelStream']: handleCancelStream,
  ['WithdrawFromStream']: handleWithdrawFromStream,
}
