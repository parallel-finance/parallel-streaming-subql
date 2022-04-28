import { SubstrateEvent } from '@subql/types'
import { Stream, StreamAccount } from '../../types'
import { convertToAnyChainAddress } from '../utils/address'

const saveStreamAccount = async (blockHeight: number, record, event) => {
  try {
    await record.save()

    logger.info(
      `#${blockHeight} handle ${event} ${JSON.stringify(record)}`
    )
  } catch (error) {
    logger.error(`handle ${event} error: `, error)
  }
}

const addOutboundStream = async (header, account, id: string) => {
  // Check sender StreamAccount
  const currentStreamAccount = await StreamAccount.get(account)
  if (currentStreamAccount === undefined) {
    // Create StreamAccount Record
    const newSenderStreamAccount = StreamAccount.create({
      id: account,
      inBound: [],
      outBound: [id]
    })
    await saveStreamAccount(
      header,
      newSenderStreamAccount,
      'Create sender StreamAccount at CreateStream'
    )
  } else {
    currentStreamAccount.outBound.push(id)
    await saveStreamAccount(
      header,
      currentStreamAccount,
      'Update sender StreamAccount at CreateStream'
    )
  }
}

const addInboundStream = async (header, account, id: string) => {
  // Check sender StreamAccount
  const currentStreamAccount = await StreamAccount.get(account)
  if (currentStreamAccount === undefined) {
    // Create StreamAccount Record
    const newReceiverStreamAccount = StreamAccount.create({
      id: account,
      inBound: [id],
      outBound: []
    })
    await saveStreamAccount(
      header,
      newReceiverStreamAccount,
      'Create recipient StreamAccount at CreateStream'
    )
  } else {
    currentStreamAccount.inBound.push(id)
    await saveStreamAccount(
      header,
      currentStreamAccount,
      'Update recipient StreamAccount at CreateStream'
    )
  }
}

type StreamCreatedEventData = [
  number,
  string,
  string,
  number,
  number,
  number,
  number
]

export const handleStreamCreated = async (substrateEvent: SubstrateEvent) => {
  const {
    event: { data },
    block: {
      block: { header }
    },
    extrinsic
  } = substrateEvent;
  const [id, sender, recipient, deposit, assetId, startTime, stopTime] = JSON.parse(data.toString()) as StreamCreatedEventData;
  const createdExtHash: string = extrinsic.extrinsic.hash.toString();
  const blockHeight: number = header.number.toNumber();
  const streamId = id.toString();
  const anyChainSenderAddress: string = convertToAnyChainAddress(sender);
  const anyChainRecipientAddress: string = convertToAnyChainAddress(recipient);

  const ratePerSec: number = deposit / (stopTime - startTime)

  // Create Stream Record
  const streamRecord = Stream.create({
    recipient: anyChainRecipientAddress,
    id: streamId,
    deposit,
    assetId,
    ratePerSec,
    remainingBalance: deposit,
    sender: anyChainSenderAddress,
    startTime,
    stopTime,
    createdExtHash
  })

  await saveStreamAccount(blockHeight, streamRecord, 'StreamCreated')

  // // Add Outbound stream to sender
  // await addOutboundStream(blockHeight, anyChainSenderAddress, streamId)
  //
  // // Add Inbound stream to recipient
  // await addInboundStream(blockHeight, anyChainRecipientAddress, streamId)
}
