import { UStoreProvider } from '@ustore/core'

const PROOF_STATUS = {
  PROGRESS: 1,
  SUCCESS: 2,
  FAILED: 3
}
const PROOF_CHECK_INTERVAL = 3000

class ProofThumbnailUpdater {

  constructor () {
    this.cartModel = null
    this.timeout = null
  }

  init(cartModel) {
    this.cartModel = cartModel
    const items = this.cartModel
      .items.filter(item => item.proof?.Status === PROOF_STATUS.PROGRESS)
      .map(item => item.orderItemId)

    if (items.length) {
      this.timeout = setTimeout(() => {
        this.run(items)
      },PROOF_CHECK_INTERVAL)
    }

  }

  stop() {
    this.timeout && clearTimeout(this.timeout)
  }

  async run(items) {
    const statuses = await UStoreProvider.api.products.checkProofStatus(items)
    statuses.forEach(status => {
      const item = this.cartModel?.items?.find(item => item.orderItemId === status.OrderItemID)
      if (item) {
        item.setProofStatus(status)
      }
    })
    const nextOrderIds = statuses.filter(status => status.Status === PROOF_STATUS.PROGRESS).map(status => status.OrderItemID)
    if (nextOrderIds.length) {
      this.timeout = setTimeout(() => {
        this.run(nextOrderIds)
      },PROOF_CHECK_INTERVAL)
    }
  }



}

const proofThumbnailUpdater = new ProofThumbnailUpdater()
export default proofThumbnailUpdater
