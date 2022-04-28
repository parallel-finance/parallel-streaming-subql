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
    logger.error(`handle ${event} error: `, error)
  }
}

export const handleStreamCreated = async (substrateEvent: SubstrateEvent) => {
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
    createdExtHash
  })

  logger.info(JSON.stringify(streamRecord));

  await saveStream(blockHeight, streamRecord, 'StreamCreated')
}
