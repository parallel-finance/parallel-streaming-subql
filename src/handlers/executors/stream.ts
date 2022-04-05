import { SubstrateEvent } from '@subql/types'
import { Stream, StreamAccount } from '../../types'
import { convertToAnyChainAddress } from '../utils/address'
import { ensureStrNumber } from '../utils/decimalts'

type StreamProps = {
  recipient: string
  id: number
  deposit: number
  remainingBalance: number
  currencyId: number
  ratePerSec: number
  sender: string
  startTime: number
  stopTime: number
}

type StreamAccountProps = {
  id: string;
  address: string;
  inBound: string[];
  outBound: string[];
}

const saveRecord = async (header, record, event) => {
  try {
    await record.save()

    logger.info(
      `#${header.number.toNumber()} handle ${event} ${JSON.stringify(
        record
      )}`
    )
  } catch (error) {
    logger.error(`handle ${event} error: `, error)
  }

}

const addOutboundStream = async (header, account, id: string) => {
  // Check sender StreamAccount
  var streamAccount = await StreamAccount.get(account) 
  if(streamAccount === undefined) {
    // Create StreamAccount Record
    const senderRecord = StreamAccount.create({
      id: account,
      inBound: [],
      outBound: [id]
    })
    await saveRecord(header, senderRecord, "Create sender StreamAccount at CreateStream") 
  } else {
    streamAccount.outBound.push(id)
    await saveRecord(header, streamAccount, "Update sender StreamAccount at CreateStream")
  }
}
const addInboundStream = async (header, account, id: string) => {
  // Check sender StreamAccount
  var streamAccount = await StreamAccount.get(account) 
  if(streamAccount === undefined) {
    // Create StreamAccount Record
    const senderRecord = StreamAccount.create({
      id: account,
      inBound: [id],
      outBound: []
    })
    await saveRecord(header, senderRecord, "Create recipient StreamAccount at CreateStream") 
  } else {
    streamAccount.inBound.push(id)
    await saveRecord(header, streamAccount, "Update recipient StreamAccount at CreateStream")
  }
}

const removeInboundStream = async (header, account, id: string) => {
  var streamAccount = await StreamAccount.get(account) 
  const filtered = streamAccount.inBound.filter(e => e !== id)
  await saveRecord(header, filtered, "remove recipient stream in StreamAccount at CancelStream")
}

const removeOutboundStream = async (header, account, id: string) => {
  try{
    var streamAccount = await StreamAccount.get(account) 
    const filtered = streamAccount.outBound.filter(e => e !== id)
    await saveRecord(header, filtered, "remove sender stream in StreamAccount at CancelStream")
  } catch(error) {
    logger.error(`handle ${event} error: `, error)
  }
  
}

export const handleCreateStream = async ({
  idx,
  event: { data },
  block: {
    timestamp,
    block: { header }
  },
  extrinsic
}: SubstrateEvent) => {
  const [id, sender, recipient, deposit, currencyId, startTime, stopTime] =
    JSON.parse(data.toString()) as [
      number,
      string,
      string,
      number,
      number,
      number,
      number
    ]

  const ratePerSec = deposit / (stopTime - startTime)

  // Create Stream Record
  const streamRecord = Stream.create({
    recipient,
    id: id.toString(),
    deposit,
    currencyId,
    ratePerSec,
    remainingBalance: deposit,
    sender,
    startTime,
    stopTime
  })

  await saveRecord(header, streamRecord, "CreateStream")

  // Add Outbound stream to sender
  await addOutboundStream(header, sender, id.toString())

  // Add Inbound stream to recipient
  await addInboundStream(header, recipient, id.toString())
}

export const handleCancelStream = async ({
  idx,
  event: { data },
  block: {
    timestamp,
    block: { header }
  },
  extrinsic
}: SubstrateEvent) => {
  const [id, sender, recipient, deposit, sender_balance, recipient_balance] =
    JSON.parse(data.toString()) as [
      number,
      string,
      string,
      number,
      number,
      number
    ]

    Stream.remove(id.toString())
    
    // remove outbound stream in sender account
    var senderAccount = StreamAccount.get(sender)
    await removeOutboundStream(header, senderAccount, id.toString())

    // remove inbound stream in recipient account
    var recipientAccount = StreamAccount.get(recipient)
    await removeInboundStream(header, recipientAccount, id.toString())
}

export const handleWithdrawFromStream = async ({
  idx,
  event: { data },
  block: {
    timestamp,
    block: { header }
  },
  extrinsic
}: SubstrateEvent) => {
  const [id, recipient, amount] =
    JSON.parse(data.toString()) as [
      number,
      string,
      number
    ]
  
  var stream = await Stream.get(id.toString())

  // check if remaining balance - withdrawn amount equals zero
  if(stream.remainingBalance - amount === 0) {
    await Stream.remove(id.toString())
    await removeInboundStream(header, stream.recipient, id.toString())
    await removeOutboundStream(header, stream.sender, id.toString())
  } else {
    stream.remainingBalance -= amount
    await saveRecord(header, stream, "WithdrawFromStream")
  }
}
