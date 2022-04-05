import {
  handleCreateStream,
  handleWithdrawFromStream,
  handleCancelStream
} from './stream'
import { SubstrateEvent } from '@subql/types'

export type Executor = (event: SubstrateEvent) => Promise<void>

export const CROWDLOANEXECUTORS: { [method: string]: Executor } = {
  ['CreateStream']: handleCreateStream,
  ['CancelStream']: handleCancelStream,
  ['WithdrawFromStream']: handleWithdrawFromStream,
}
