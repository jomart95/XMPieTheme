import React, {useContext} from 'react'
import { observer } from 'mobx-react-lite'
import { Modal, ModalBody } from 'reactstrap-wc'
import { t,mt } from '$themelocalization'
import { LoadingDots, Icon } from '$core-components'
import './DuplicateProgressDialog.scss'
import {activityMonitor, ActivityStatus, ActivityType, RootDocumentContext } from '$themeservices'

const CLOSE_DIALOG_TIMEOUT = 2000

const DuplicateProgressDialog = ({ model }) => {

  let showDuplicateDialog = false
  let hasFailed = false
  let hasPartialFailed = false
  let hasSuccess = false
  let selectedActivity = null
  const {rootElement} = useContext(RootDocumentContext)()

  const closeDialog = (activityId) => {
    activityMonitor.clearActivities()
    model.reloadAfterDuplicate(activityId)
  }

  for (const activity in model?.activities) {
    selectedActivity = model.activities[activity].activity
    showDuplicateDialog = !!selectedActivity?.Status

    hasPartialFailed = selectedActivity?.Status === ActivityStatus.PartiallyFailed
    hasFailed = selectedActivity?.Status === ActivityStatus.Failed || hasPartialFailed
    hasSuccess = selectedActivity?.Status === ActivityStatus.Success

    if (hasSuccess) {
      break
    }
  }

  if (hasSuccess) {
    setTimeout(() => closeDialog(selectedActivity?.ActivityID), CLOSE_DIALOG_TIMEOUT)
  }

  return (
    <Modal isOpen={showDuplicateDialog} className="cart-ng-duplicate-progress-dialog"
           modalClassName="duplicate-progress-dialog-container" backdropClassName="duplicate-progress-modal-backdrop"
           wrapClassName="cart-ng-duplicate-progress-dialog-wrapper" container={rootElement}>
      {hasFailed &&
        <button className="cart-ng-duplicate-process-close" onClick={() => closeDialog(selectedActivity?.ActivityID)}>
          <Icon name="close_black.svg" width="14px" height="14px"/>
        </button>
      }
      <ModalBody className="dialog-content">
       <Progress selectedActivity={selectedActivity}/>
        <Success selectedActivity={selectedActivity}/>
        <Failed selectedActivity={selectedActivity}/>
      </ModalBody>
    </Modal>
  )
}

export default observer(DuplicateProgressDialog)

function Progress ({ selectedActivity }) {
  if (selectedActivity?.Status !== ActivityStatus.Progress) {
    return null
  }
  const typeToMessage = {
    [ActivityType.OrderItemDuplication]: 'Cart.Dialog.DuplicateInProgress.DuplicatingItemPleaseWait',
    [ActivityType.KitOrderItemDuplication]: 'Cart.Dialog.DuplicateInProgress.DuplicatingKitItemProgress',
    [ActivityType.CartListDuplication]: 'Cart.Dialog.DuplicateInProgress.DuplicatingKitItemProgress',
    [ActivityType.OrderReordering]: 'Cart.Dialog.DuplicateInProgress.ReorderingOrderProgress',
    [ActivityType.KitOrderItemReordering]: 'Cart.Dialog.DuplicateInProgress.ReorderingOrderProgress',
    [ActivityType.OrderItemReordering]: 'Cart.Dialog.DuplicateInProgress.DuplicatingItemPleaseWait'
  }

  if (!typeToMessage[selectedActivity?.Type]) {
    return null
  }
  return (
    <div className="cart-ng-duplicate-progress">
      <HourGlass/>
      <div className="dialog-text">
        {mt(typeToMessage[selectedActivity?.Type], {
          name: selectedActivity?.Name,
          num: selectedActivity?.Progress || 1,
          total: selectedActivity?.Total
        })}
      </div>
      <div>
        <LoadingDots className="loading-dots"/>
      </div>
    </div>
  )
}


function Success ({ selectedActivity }) {
  if (selectedActivity?.Status !== ActivityStatus.Success) {
    return null
  }

  const typeToMessage = {
    [ActivityType.OrderItemDuplication]: ['Cart.Dialog.DuplicateSuccess.Duplicating','Cart.Dialog.DuplicateSuccess.DuplicatedSuccessfully' ],
    [ActivityType.KitOrderItemDuplication]: ['Cart.Dialog.DuplicateSuccess.Duplicating','Cart.Dialog.DuplicateSuccess.DuplicatedSuccessfully'],
    [ActivityType.CartListDuplication]: ['Cart.Dialog.DuplicateSuccess.Duplicating','Cart.Dialog.DuplicateSuccess.DuplicatedSuccessfully'],
    [ActivityType.KitOrderItemReordering]: ['Cart.Dialog.DuplicateSuccess.ReorderingOrderCompleted','Cart.Dialog.DuplicateSuccess.ReorderingOrderSuccessfully'],
    [ActivityType.OrderReordering]: ['Cart.Dialog.DuplicateSuccess.ReorderingOrderCompleted', 'Cart.Dialog.DuplicateSuccess.ReorderingOrderSuccessfully'],
    [ActivityType.OrderItemReordering]: ['Cart.Dialog.DuplicateSuccess.ReorderingOrderCompleted', 'Cart.Dialog.DuplicateSuccess.ReorderingOrderSuccessfully']
  }

  return <div className="cart-ng-duplicate-success">
    <Icon name="cart_duplicate_success.svg" height="30px" width="33px" wrapperClassName="cart-ng-duplicate-success-icon"/>
    <div className="dialog-text">
      <div>{mt(typeToMessage[selectedActivity?.Type][0], { name: selectedActivity?.Name })}</div>
      <div className="success-text"> {mt(typeToMessage[selectedActivity?.Type][1], { name: selectedActivity?.Name })}</div>
    </div>
  </div>
}


function Failed ({ selectedActivity }) {
  if (![ActivityStatus.Failed,ActivityStatus.PartiallyFailed].includes(selectedActivity?.Status)){
    return null
  }

  let hasPartialFailed = selectedActivity?.Status === ActivityStatus.PartiallyFailed
  const typeToMessage = {
    [ActivityType.OrderItemDuplication]: ['Cart.Dialog.DuplicateSuccess.Duplicating','Cart.Dialog.DuplicateFailed.DuplicationFailed'],
    [ActivityType.KitOrderItemDuplication]: ['Cart.Dialog.DuplicateSuccess.Duplicating', 'Cart.Dialog.DuplicateFailed.DuplicationFailed'],
    [ActivityType.CartListDuplication]: ['Cart.Dialog.DuplicateSuccess.Duplicating','Cart.Dialog.DuplicateFailed.DuplicationFailed', 'Cart.Dialog.DuplicateFailed.SomeItemsCouldNotDuplicate'],
    [ActivityType.KitOrderItemReordering]: ['Cart.Dialog.DuplicateFailed.ReorderingOrder','Cart.Dialog.DuplicateFailed.ReorderingOrder'],
    [ActivityType.OrderReordering]: ['Cart.Dialog.DuplicateFailed.ReorderingOrder','Cart.Dialog.DuplicateFailed.ReorderingOrder'],
    [ActivityType.OrderItemReordering]: ['Cart.Dialog.DuplicateFailed.ReorderingOrder', 'Cart.Dialog.DuplicateFailed.ReorderingOrder']

  }

  return <div className="cart-ng-duplicate-failed">
    <Icon name="warning.svg" height="30px" width="33px"
          wrapperClassName={`cart-ng-duplicate-${hasPartialFailed ? 'partial-failed' : 'failed'}-icon `}/>
    <div className="dialog-text">
      <div>{t(typeToMessage[selectedActivity?.Type][0], { name: selectedActivity?.Name })}</div>
      {hasPartialFailed ?
        <div className="partial-failed-text">
          {mt(typeToMessage[selectedActivity?.Type][2], {
            num: selectedActivity?.Output?.CompletedCount,
            total: selectedActivity?.Total
          })}</div> :
        <div className="failed-text"> {mt(typeToMessage[selectedActivity?.Type][1])}</div>}
    </div>
  </div>
}

function HourGlass () {
  return (<div className="hour-glass-icon">
    <svg width="44" height="70" viewBox="0 0 44 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="65.7761" width="41.8806" height="3.22388" rx="1.61194" stroke="#636364" strokeWidth="2"/>
      <rect x="1" y="1" width="41.8806" height="3.22388" rx="1.61194" stroke="#636364" strokeWidth="2"/>
      <path d="M38.1341 5.22391C38.1341 26.1194 28.7311 21.4179 28.7311 30.8209C28.7311 40.2239 38.1341 40.2239 38.1341 65.2985H5.22363C5.22328 39.1791 16.1938 39.7015 15.149 30.8209C14.1042 21.9403 5.22335 28.209 5.22363 5.22391H38.1341Z" stroke="#636364" strokeWidth="2.5"/>
      <path d="M22.4632 28.7314C22.4632 28.7314 27.6869 21.9403 27.1645 17.2388C26.6421 12.5373 22.4632 17.2388 17.7617 17.2388C13.0602 17.2388 22.4632 28.7314 22.4632 28.7314ZM22.4632 28.7314V33.9552" stroke="#636364" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M12.2209 61.6917C14.6369 61.6784 27.5376 61.6155 31.7892 61.7673C34.2671 61.8558 32.8207 58.189 28.0911 56.367C23.8528 54.7343 21.8457 51.7505 16.3927 54.9296C12.0163 57.4811 11.725 60.2942 11.7805 61.3055C11.7932 61.536 11.99 61.693 12.2209 61.6917Z" stroke="#636364" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M22.9854 41.791V39.7015" stroke="#636364" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M22.9854 48.0597V45.9702" stroke="#636364" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  </div>)
}
