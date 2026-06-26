import React, { useState, useRef, useEffect } from 'react'
import { useButton } from 'react-aria'
import { Label, ListBox, ListBoxItem, Select, SelectValue } from 'react-aria-components'
import { Icon, ButtonAria } from '$core-components'
import './MobileSwitcher.scss'

const MobileSwitcher = (props) => {
  const { className, items, label, selected, onSelected, renderSelection, renderItem } = props
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const closeSwitcher = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keyup', closeSwitcher)
    return () => window.removeEventListener('keyup', closeSwitcher)
  },[])

  if (!items) {
    return <div/>
  }



  return (
    <Select className={`mobile-switcher ${className}`} selectedKey={selected.value}
            onOpenChange={(v) => setIsOpen(v)}
            onSelectionChange={(keys) => onSelected(keys)}
            isOpen={isOpen}>
      <Label>{label}</Label>
      <SelectedValueButton onPress={() => setIsOpen(true)} {...{ renderSelection, selected }} autoFocus={!isOpen}/>
      <div className="mobile-switcher__list" style={{ display: isOpen ? '' : 'none' }}>
        <BackButton onPress={() => setIsOpen(false)} autoFocus={isOpen} label={label}/>
        <ListBox items={items} selectionMode="single">
          {(item) => <ListBoxItem key={item.id} value={item.value}>
            {renderItem && renderItem(item)}
          </ListBoxItem>}
        </ListBox>
      </div>
    </Select>
  )
}

export default MobileSwitcher

function BackButton (props) {
  const ref = useRef()
  const { buttonProps } = useButton(props, ref)

  useEffect(() => {
    if (props.autoFocus) {
      ref.current.focus()
    }
  }, [props.autoFocus])

  return (
    <button {...{ ...buttonProps, className: 'mobile-switcher-back' }} ref={ref}>
      <Icon name="back.svg" height="19px" width="9px"/>
      <div className="mobile-submenu-title">{props.label}</div>
    </button>
  )
}

function SelectedValueButton (props) {
  const ref = useRef()

  useEffect(() => {
    if (props.autoFocus) {
      const button = ref.current?.querySelector('button')
      button?.focus()
    }
  }, [props.autoFocus])

  return (
    <div ref={ref}>
      <ButtonAria>
        <SelectValue>
          {props.renderSelection && props.renderSelection(props.selected)}
        </SelectValue>
      </ButtonAria>
    </div>
  )
}
