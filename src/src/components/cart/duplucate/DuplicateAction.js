import React, {useState, useContext } from 'react'
import { createPortal } from 'react-dom'
import { observer } from 'mobx-react-lite'
import { RootDocumentContext } from '$themeservices'
import ItemDuplicateTooltip from './ItemDuplicateTooltip'
import DuplicateItemsDialogError from './DuplicateItemsDialogError'
import ConfirmDuplicationModal from './ConfirmDuplicationModal'
import DuplicateButton from './DuplicateButton.js'
import { t } from '$themelocalization'

import './DuplicateAction.scss'
import CartErrorModel from '../model/CartErrorModel'


const DuplicateAction = ({ item, list, showLargeIcon = false }) => {
  const entity = item || list
  const {rootElement} = useContext(RootDocumentContext)()
  const [duplicateTooltipMessage, setDuplicateTooltipMessage] = useState(null)
  const [duplicateDialogMessage, setDuplicateDialogMessage] = useState(null)
  const desktopDuplicateButtonRef = React.useRef(null)
  const [showDuplicateListModal, setShowDuplicateListModal] = useState(false)

  const duplicate = async (isMobile) => {
    const res = await entity.duplicate()
    if ([CartErrorModel.CART_ERROR_TYPES.ProductComponentNotAvailable, CartErrorModel.CART_ERROR_TYPES.ProductNotAvailable ].includes(res?.Type)) {
      if (isMobile) {
        setDuplicateDialogMessage(res.Message)
      } else {
        setDuplicateTooltipMessage(res.Message)
      }
    }
  }
  const onDuplicate = async (isMobile) => {
    if (list ||  (item?.subItems.length > 0 && (item?.hasUSAData || item?.isCOD || item?.hasItemsOffline))) {
      setShowDuplicateListModal(true)
      return
    }
    await duplicate(isMobile)
  }

  const hoverHandler = () => {
    if (list?.eligibleItemsCount > list?.duplicationLimit ) {
      setDuplicateTooltipMessage(t("Cart.Duplicate.DuplicateRestriction", { count: list.duplicationLimit}))
    }
  }

  const clearTooltip = () => setDuplicateTooltipMessage(null)

  return <div className="cart-entity-duplicate-action-container">
    <DuplicateButton
      ref={desktopDuplicateButtonRef}
      className="action desktop-duplicate-button"
      onClick={async () => await onDuplicate(false)}
      hoverhandler={ list && hoverHandler}
      clearTooltip={clearTooltip}
      disabled={list?.eligibleItemsCount > list?.duplicationLimit || list?.itemsCount === 0}
      showLargeIcon={showLargeIcon}
    />

    <DuplicateButton
      className="action mobile-duplicate-button"
      onClick={async () => await onDuplicate(true)}
      disabled={list?.itemsCount === 0}
      showLargeIcon={showLargeIcon}
    />

    {duplicateTooltipMessage &&
      createPortal(
        <ItemDuplicateTooltip message={duplicateTooltipMessage}
                              isList={!!list}
                              desktopDuplicateButtonRef={desktopDuplicateButtonRef}
                              onClickOutside={() => setDuplicateTooltipMessage(null)}/>, rootElement)}
    {duplicateDialogMessage && <DuplicateItemsDialogError message={duplicateDialogMessage} onClose={() => setDuplicateDialogMessage(null)} />}
    {showDuplicateListModal &&
      <ConfirmDuplicationModal
        onClose={() => setShowDuplicateListModal(false)}
        onDuplicate={async (isMobile) => {
          setShowDuplicateListModal(false)
          await duplicate(isMobile)
        }}
        entity={entity}
      />
    }

  </div>
}

export default observer(DuplicateAction)
