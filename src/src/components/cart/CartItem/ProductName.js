import React, { useState, useRef, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { Tooltip } from 'reactstrap-wc'
import { debounce } from 'throttle-debounce'
import { Nickname } from './Nickname'
import './ProductName.scss'

const ProductName = ({ item }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const contentRef = useRef(null)
  const rootRef = useRef(null)

  const toggle = () => setIsTooltipOpen(!isTooltipOpen)

  useEffect(() => {
    const onResize = debounce(250, () => {
      const element = contentRef?.current
      if (!element) return
      const originalOverflow = element.style.overflow;
      const originalTextOverflow = element.style.textOverflow;
      const originalWhiteSpace = element.style.whiteSpace;
      const originalWidth = element.clientWidth;

      // Set styles to what would be needed for an ellipsis
      element.style.overflow = 'hidden';
      element.style.textOverflow = 'ellipsis';
      element.style.whiteSpace = 'nowrap';

      // Check if the content overflows
      const isOverflowing = element.scrollWidth > originalWidth;

      // // Restore the original values
      element.style.overflow = originalOverflow;
      element.style.textOverflow = originalTextOverflow;
      element.style.whiteSpace = originalWhiteSpace;

      setShowTooltip(isOverflowing)
    })
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleNicknameChange = (nickname) => {
    item.updateNickname(nickname ?? null)
  }

  if (!item) return null

  return (
    <div className={`title-box ${item.nickname || isEditingNickname? 'has-value': ''}`} ref={rootRef}>
      <div className="title-wrapper">
        <div className="item-title">
          <h3 className={`title-content wrap`} ref={contentRef} id={`tooltip-${item.orderItemId}`} style={{
            overflow: 'hidden',
          }}>
            {item.product.name}
            {item.product.catalogNumber && ` / ${item.product.catalogNumber}`}
          </h3>
        </div>
      </div>
      <Nickname
        nickname={item.nickname}
        setNickname={handleNicknameChange}
        onEditStart={() => setIsEditingNickname(true)}
        onEditEnd={() => setIsEditingNickname(false)}
      />
      {showTooltip &&
        <Tooltip
          className="product-name-tooltip"
          placement="bottom"
          isOpen={isTooltipOpen}
          target={contentRef.current}
          toggle={toggle}
          container="cart-list"
          modifiers={[
              {
                  name: 'offset',
                  options: {
                      offset: ({placement}) => {
                          if (placement === 'top') {
                              return [0, 30];
                          } else {
                              return [];
                          }
                      },
                  }
              },
            ]}

        >
          {item.product.name}
        </Tooltip>
      }
    </div>
  )
}

export default observer(ProductName)
