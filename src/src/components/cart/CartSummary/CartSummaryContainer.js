import React, {
  useEffect,
  useRef,
  useState
} from 'react'
import { observer } from 'mobx-react-lite'
import CartSummary from './index'
import CartSummaryStickyBlock from './CartSummaryStickyBlock'
import { useSticky } from '../../products/static/useSticky'
import './CartSummaryContainer.scss'

const CartSummaryContainer = ({
  currencyState,
  model,
  loading,
  withSticky = false
}) => {
  const [showSticky, setShowSticky] = useState(false)
  const refContainer = useRef(null)
  const { showStickyPrice, stickyConnect, stickyDisconnect} = useSticky(refContainer)

  useEffect(() => {
    stickyConnect()

    return () => {
      stickyDisconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setShowSticky(showStickyPrice)
  }, [showStickyPrice])

  return (
    <div className={`cart-summary-main-container ${model?.isListsMode ? 'cart-summary-lists-mode' : ''}`} ref={refContainer}>
      <div ref={refContainer}>
        <CartSummary
          model={model}
          loading={loading}
          currencyState={currencyState}
          withSticky={withSticky}
        />
      </div>
      <CartSummaryStickyBlock
        price={model?.summary?.presentablePrices?.total}
        currencyState={currencyState}
        show={showSticky}
        model={model}
        loading={loading}
      />
    </div>
  )
}

export default observer(CartSummaryContainer)
