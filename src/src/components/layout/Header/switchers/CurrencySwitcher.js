import { Switcher } from '$core-components'
import React, {useEffect, useState} from 'react'
import { t } from '$themelocalization'
import { switchCurrency } from './utils'

export const CurrencySwitcher = ({ currentCurrency, currencies }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const onResize =  () => {
      const currencySwitcher = document.querySelector('.switcher.currency')
      if (currencySwitcher && window.getComputedStyle(currencySwitcher).display === 'none') {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
    }
    window.addEventListener('resize',onResize)
    onResize()
    return () => {
      window.removeEventListener('resize',onResize)
    }
  }, [])


  const currenciesViewModel = currencies?.map(({ ID, Symbol, Code }) => ({
    id: ID, sign: Symbol, name: Code, value: Code
  })) || []

  const currencySelected = (selected) => {
    const selectedCurrency = currencies.find(i => i.ID === selected)
    switchCurrency(selectedCurrency)
  }

  if (!isVisible) {
    return null
  }

  return <Switcher
    className="currency"
    items={currenciesViewModel}
    selected={currentCurrency && currenciesViewModel.find((element) => { return currentCurrency.ID === element.id })}
    label={t('Header.Currency')}
    onSelected={currencySelected}
    renderSelection={(selected) => <span className="sign">{selected.value}</span>}
    renderItem={(item) => <>
      <span className="sign">{item.sign}</span>
      <span className="name">{item.value}</span>
    </>}
  />
}

