import { SubstrateEvent } from '@subql/types'
import { Stream } from '../../types'
import { convertToAnyChainAddress } from '../utils/address'

const saveStream = async (blockHeight: number, stream: Stream, event) => {
  try {
    await stream.save()

    logger.info(
      `#${blockHeight} handle ${event} ${JSON.stringify(stream)}`
    )
  } catch (error) {
    logger.error(`handle ${event} error: `, JSON.stringify(error))
  }
}

export const processStreamCreatedEvent = async (substrateEvent: SubstrateEvent) => {
  const {
    event: { data },
    block: {
      block: { header }
    },
    extrinsic
  } = substrateEvent;
  const [id, sender, recipient, deposit, assetId, startTime, stopTime] = JSON.parse(data.toString()) as [
    number,
    string,
    string,
    string,
    number,
    number,
    number
  ];
  const createdExtHash: string = extrinsic.extrinsic.hash.toString();
  const blockHeight: number = header.number.toNumber();
  const streamId = id.toString();
  const anyChainSenderAddress: string = convertToAnyChainAddress(sender);
  const anyChainRecipientAddress: string = convertToAnyChainAddress(recipient);

  const streamRecord = Stream.create({
    recipient: anyChainRecipientAddress,
    id: streamId,
    deposit,
    assetId,
    remainingBalance: deposit,
    sender: anyChainSenderAddress,
    startTime: new Date(startTime*1000),
    stopTime: new Date(stopTime*1000),
    blockHeight,
    createdExtHash
  })

  await saveStream(blockHeight, streamRecord, 'StreamCreated')
}

const logStream = (stream: Stream): void =>  {
  logger.info(`stream.id: ${stream.id} type: ${typeof stream.id}`);
  logger.info(`stream.recipient: ${stream.recipient} type: ${typeof stream.recipient}`);
  logger.info(`stream.deposit: ${stream.deposit} type: ${typeof stream.deposit}`);
  logger.info(`stream.assetId: ${stream.assetId} type: ${typeof stream.assetId}`);
  logger.info(`stream.remainingBalance: ${stream.remainingBalance} type: ${typeof stream.remainingBalance}`);
  logger.info(`stream.sender: ${stream.sender} type: ${typeof stream.sender}`);
  logger.info(`stream.startTime: ${stream.startTime} type: ${typeof stream.startTime}`);
  logger.info(`stream.stopTime: ${stream.stopTime} type: ${typeof stream.stopTime}`);
}

export const processStreamWithdrawnEvent = async (substrateEvent: SubstrateEvent) => {
  const {
    event: { data },
    block: {
      block: { header }
    },
  } = substrateEvent;
  const blockHeight: number = header.number.toNumber();
  logger.info(`process withdrawn event: ${JSON.stringify(substrateEvent)}`);

  const [id, , , amount] = JSON.parse(data.toString()) as [number, string, string, string];
  const streamRecord = await Stream.get(id.toString())
  if (streamRecord.blockHeight === blockHeight) {
    return;
  }
  streamRecord.remainingBalance = (BigInt(streamRecord.remainingBalance) - BigInt(amount)).toString();
  streamRecord.blockHeight = blockHeight;
  await saveStream(blockHeight, streamRecord, 'StreamWithdrawn')
}
