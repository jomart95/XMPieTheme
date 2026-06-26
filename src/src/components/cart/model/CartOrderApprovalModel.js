export default class CartOrderApprovalModel {
  constructor({
    originalOrderFriendlyId,
    originalOrderId
  }) {
    this.originalOrderFriendlyId = originalOrderFriendlyId;
    this.originalOrderId = originalOrderId;
  }
}