import {
  handleCreateStream,
  handleWithdrawFromStream,
  handleCancelStream
} from './handles'
import { SubstrateEvent } from '@subql/types'

export type Executor = (event: SubstrateEvent) => Promise<void>

export const STREAMINGEXECUTORS: { [method: string]: Executor } = {
  ['StreamCreated']: handleCreateStream,
  ['StreamCanceled']: handleCancelStream,
  ['StreamWithdrawn']: handleWithdrawFromStream,
}
