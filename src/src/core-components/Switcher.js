import React, {useContext, useEffect, useRef, useState} from 'react'
import { Button, Label, ListBox, ListBoxItem, Popover, Select, SelectValue } from 'react-aria-components'
import { useClickOutside } from '$themehooks'
import { RootDocumentContext } from '$themeservices'


import './Switcher.scss'

const Switcher = (props) => {
  const { className, items, label, selected, onSelected, renderSelection, renderItem } = props
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef(null)
  const {rootElement} = useContext(RootDocumentContext)()

  useClickOutside(popoverRef, () => setIsOpen(false), rootElement)

  useEffect(() => {
    if (isOpen) {
      popoverRef.current.style.position = 'fixed'
      document.documentElement.style.overflow = ''
      document.documentElement.style.paddingRight = ''
    }
  }, [isOpen])

  if (!items) {
    return <div/>
  }

  const onSelectBlur = (e) => {
    setIsOpen(false)
    if (e.target.getAttribute('role') === 'option') {
      window.queueMicrotask(() => {
        e.target.setAttribute('tabindex', 0)
        e.target.focus()
      })
    }
  }

  return (
    <Select className={`switcher ${className}`} selectedKey={selected.value}
            onSelectionChange={(keys) => onSelected(keys)}
            isOpen={isOpen} onOpenChange={setIsOpen}
            onBlur={onSelectBlur}>
      <Label>{label}</Label>
      <Button>
        <SelectValue>
          {renderSelection && renderSelection(selected)}
        </SelectValue>
      </Button>
      <Popover className={`switcher-popup ${className}`} shouldCloseOnInteractOutside={() => false} ref={popoverRef}>
        <ListBox items={items} selectionMode="single" selectionBehavior="toggle">
          {(item) => <ListBoxItem key={item.id} value={item.value}>
            {renderItem && renderItem(item)}
          </ListBoxItem>}
        </ListBox>
      </Popover>
    </Select>
  )
}

export default Switcher
