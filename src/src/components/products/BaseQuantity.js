import React, { useState } from 'react'
import { debounce } from 'throttle-debounce'
import { t } from '$themelocalization'
import { Icon } from '$core-components'
import './BaseQuantity.scss'

const BaseQuantity = ({ quantityConfig, additionalClassName, onChange, id, quantity, showMinimalDisplay }) => {
    const [updatedQuantity, setUpdatedQuantity] = useState(quantity)

    const getValueFromRange = (options, value) => {
        if (options.length === 0) {
            return null
        }

        // if not in any range, use the minimum value.
        let selected = options.find((item) => { return value.toString() === item.Value.toString() })
        if (selected === undefined) {
            selected = options[0]
        }

        return selected
    }

    const onValueChange = (e) => {
        setUpdatedQuantity(parseInt(e.target.value))
        debounced(e);
    }

    const onKeyDown = (e) => {
        if (e.key === '.' || e.key === '-' || e.key === '+' || e.key === '=') {
            e.preventDefault()
            return false
        }
    }

    const onClickPlusMinus = ( reduceOrAdd, id ) => {
        setUpdatedQuantity( ( prevQuantity ) => {
            const value = Number(prevQuantity) + reduceOrAdd
            debounced( { target: { value, id } } )
            return value
        } )
    }

    const debounced = debounce( 50, (e) => {
        const { value, id } = e.target
        let newValue = value
        if (value.length === 10) {
            newValue = value.substring(0, 9)
        }
        setUpdatedQuantity( newValue )
        onChange && onChange( { target: { value: newValue, id } } )
    } )

    if (!quantityConfig) {
        return null
    }

    const selectedDropDownItem = quantityConfig.Options && getValueFromRange(quantityConfig.Options, updatedQuantity)

    return (<div className='product-quantity'>
        {!quantityConfig.Changeable && !showMinimalDisplay &&   // READ ONLY LABEL
          <div className='ro-quantity-wrapper'>
              <span className={'quantity-control quantity-label ' + additionalClassName} id={'quantity_' + id}>{updatedQuantity}</span>
          </div>
        }
        {!quantityConfig.Changeable && showMinimalDisplay &&   // READ ONLY LABEL with Quantity before
          <div className='ro-quantity-wrapper-show-quantity'>
              <span className='quantity-label'>{t('product.quantity')}:</span>
              <span className={'quantity-control quantity-label ' + additionalClassName} id={'quantity_' + id}>{updatedQuantity}</span>
          </div>
        }
        {quantityConfig.Changeable && quantityConfig.Options === null && !showMinimalDisplay && // TEXT BOX
          <div className='txt-quantity-wrapper'>
              <input id={'quantity_' + id} type={'number'} className={'quantity-control quantity-input ' + additionalClassName}
                     onChange={onValueChange} value={updatedQuantity}
                     onKeyDown={onKeyDown}
                     onWheel={(e) => {  return false }} />
          </div>
        }
        {quantityConfig.Changeable && quantityConfig.Options === null && showMinimalDisplay && // TEXT BOX WITH +/-
          <div className="txt-quantity-wrapper-show-indicators">
              <Icon
                className={`indicator minus ${updatedQuantity <= 1 ? 'disabled' : ''}`}
                name="Homepage_quickAddtoCart_minus.svg"
                width="22px"
                height="22px"
                onClick={() => { onClickPlusMinus(-1, 'quantity_' + id) }}
              />
              <input id={'quantity_' + id} type={'number'} className={'quantity-control quantity-input  ' + additionalClassName}
                     onChange={onValueChange} value={updatedQuantity}
                     onKeyDown={onKeyDown}
                     onWheel={( e ) => { return false }} />
              <Icon
                className="indicator plus"
                name="Homepage_quickAddtoCart_Plus.svg"
                width="22px"
                height="22px"
                onClick={() => { onClickPlusMinus( 1, 'quantity_' + id ) }}
              />
          </div>
        }
        {quantityConfig.Changeable && quantityConfig.Options != null && quantityConfig.Options.length && !showMinimalDisplay &&// DROPDOWN
          <div className='dd-quantity-wrapper'>
              <select id={'quantity_' + id} onChange={onChange} className={'quantity-control quantity-dropdown ' + additionalClassName} defaultValue={selectedDropDownItem.Value} title={selectedDropDownItem.Name}>
                  {quantityConfig.Options.map((item) => {
                      return <option key={item.Value} value={item.Value} >{item.Name}</option>
                  })}
              </select>
          </div>
        }
        {quantityConfig.Changeable && quantityConfig.Options != null && quantityConfig.Options.length && showMinimalDisplay &&// DROPDOWN with custom carret
          <div className='dd-quantity-wrapper-custom-caret'>
              <select id={'quantity_' + id} onChange={onChange} className={'quantity-control quantity-dropdown custom-caret ' + additionalClassName} defaultValue={selectedDropDownItem.Value} title={selectedDropDownItem.Name}>
                  {quantityConfig.Options.map((item) => {
                      return <option key={item.Value} value={item.Value} >{item.Name}</option>
                  })}
              </select>
          </div>
        }
    </div>)
}

export default BaseQuantity
