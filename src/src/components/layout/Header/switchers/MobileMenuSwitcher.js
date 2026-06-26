import React, {useContext, useEffect, useRef, useState} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useButton } from 'react-aria'
import { RootDocumentContext } from '$themeservices'
import { Icon, SelectAria, ListBoxAria, OptionAria } from '$core-components'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import themeContext from '$ustoreinternal/services/themeContext'
import { t } from '$themelocalization'
import Flag from './Flag'
import { switchCurrency, switchCulture } from './utils'
import './MobileMenuSwitcher.scss'

export const MobileMenuSwitcher = ({ items, onClose, onTopLevelSelected }) => {
  const [currentItems, setCurrentItems] = useState(items)
  const [selected, setSelected] = useState(null)
  const [isListChanged, setIsListChanged] = useState(false)
  const selectorListRef = useRef()
  const navigate = useNavigate()
  const params = useParams()
  const { rootElement} = useContext(RootDocumentContext)()

  useEffect(() => {
    setCurrentItems(items)
  }, [items])

  useEffect(() => {
    if (currentItems) {
      setIsListChanged(true)
    }
  }, [currentItems])

  useEffect(() => {
    if (isListChanged) {
      rootElement.querySelector('.mobile-menu-switcher [role="option"]')?.focus()
      setIsListChanged(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListChanged])

  const onSelectionChanged = async (key) => {
    const selectedItem = currentItems.find(i => i.value === key)
    if (selectedItem?.children.length) {
      onTopLevelSelected && onTopLevelSelected(false)
      setSelected(selectedItem)
      if (selectedItem?.hasProducts){
        const featuredProducts = {
          id: `FP_${selectedItem.id.slice(4)}`,
          value: `FP_${selectedItem.id.slice(4)}`,
          name: t('General.FeaturedProducts'),
          children: []
        }
        setCurrentItems([featuredProducts, ...selectedItem.children])
      } else {
        setCurrentItems(selectedItem.children)
      }
      return
    }

    if (selectedItem?.value.startsWith('TCT') || selectedItem?.value.startsWith('CT') || selectedItem?.value.startsWith('FP')) {
      setSelected(null)
      setCurrentItems(items)
      onTopLevelSelected && onTopLevelSelected(true)
      onClose && onClose()
      navigate(urlGenerator.get({ page: 'category', id: selectedItem.value.slice(selectedItem?.value.startsWith('TCT') ? 4 : 3) }))
      return
    }

    if (selectedItem?.value.startsWith('CL')) {
      if (process.env.REACT_APP_WEB_COMPONENT) {
        themeContext.deleteKey('ssoToken')
      }
      await switchCulture(selectedItem.model, params, navigate, rootElement)
      if (process.env.REACT_APP_WEB_COMPONENT) {
        onClose && onClose()
        onTopLevelSelected && onTopLevelSelected(true)
      }
      return
    }

    if (selectedItem?.value.startsWith('CR')) {
      switchCurrency(selectedItem.model)
      setSelected(null)
      setCurrentItems(items)
      onClose && onClose()
      onTopLevelSelected && onTopLevelSelected(true)
    }
  }

  const onBack = (currentSelected) => {
    if (/^TC[TRL]_/.test(currentSelected)) {
      onClose && onClose()
    }
    const current = currentItems.find(i => i.value === currentSelected)
    if (current?.parent?.value?.startsWith('C')) {
      setCurrentItems(current?.parent?.children)
      setSelected(current?.parent)
      return
    }
    onTopLevelSelected && onTopLevelSelected(true)
    setCurrentItems(items)
    setSelected(null)
  }

  if (!items) {
    return <div/>
  }

  return (
    <SelectAria className="mobile-menu-switcher" onSelectionChange={(v) => onSelectionChanged(v)} isOpen={true}>
      <div className="mobile-menu-switcher-list" ref={selectorListRef}>
        {selected && <BackButton onPress={() => onBack()} label={selected.name}/>}
        <ListBoxAria items={currentItems} selectionMode="single">
          {currentItems.map((item) => {
            return <OptionAria key={item.id} value={item.value} item={item}
                                className={({ isFocused, isSelected }) => isFocused || isSelected ? 'selected' : ''}>
              <CategoryItem item={item}/>
              <CurrencyItem item={item}/>
              <CultureItem item={item}/>
            </OptionAria>
          })}
        </ListBoxAria>
      </div>
    </SelectAria>
  )
}

function BackButton (props) {
  const ref = useRef()
  let { buttonProps } = useButton(props, ref)
  if (process.env.REACT_APP_WEB_COMPONENT) {
    buttonProps = { onClick: props.onPress }
  }

  return (
    <button {...{ ...buttonProps,className: 'mobile-menu-switcher-back' }} ref={ref}>
      <Icon name="back.svg" height="19px" width="9px"/>
      <div className="mobile-submenu-title">{props.label}</div>
    </button>
  )
}

function CategoryItem ({ item }) {
  return /^T?CT|FP/.test(item.id) && <div>{item.name}</div>
}

function CurrencyItem ({ item }) {
  return /^T?CR/.test(item.id) && <div>
    {item.depth > 0 && <span className="currency-sign">{item.sign}</span>}
    <span className="currency-name">{item.name}</span>
    {item.depth === 0 && <span>{t('Header.Currency')}</span>}
  </div>
}

function CultureItem ({ item }) {
  return /^T?CL/.test(item.id) && <div>
    <Flag name={item.icon} width="29" height="19" className="icon"/>
    <span className="culture-name">{item.name}</span>
  </div>
}
