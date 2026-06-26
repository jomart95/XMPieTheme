import React, { useState } from 'react'
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Input,
} from 'reactstrap-wc'
import { SelectorArrow } from '$core-components'

import './UEditDropDown.scss'

export const UEditDropDown = ({
  direction,
  items,
  selectedValue,
  onChange,
  searchable,
  searchPlaceholder,
  disabled,
  customArrow,
  ...args
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [otherValue, setOtherValue] = useState('')
  const toggle = () => setDropdownOpen((prevState) => !prevState)
  return (
    <Dropdown isOpen={dropdownOpen} toggle={toggle} direction={direction} className="uedit-drop-down">
      <DropdownToggle disabled={disabled} caret>
        <SelectorArrow/>
        {selectedValue?.name ?
        <span>{selectedValue.name}</span> :
        <span> {otherValue ? `${otherValue} pt` : ''}</span>}
      </DropdownToggle>
      <DropdownMenu {...args} >
        {items.map((item, index) => {
          return <DropdownItem key={index}
                               onKeyDown={() => !item.disabled && onChange(item)}
                               onClick={() => !item.disabled && onChange(item)}
                               active={selectedValue?.value === item.value}
                               disabled={item.disabled}
          >
            <span>{item.name}</span>
          </DropdownItem>
        })}
        <DropdownItem key={items.length} onClick={() => onChange({ name: `${otherValue} pt`, value: parseFloat(otherValue) })}>
          <Input type="number" value={otherValue} onChange={(e) => setOtherValue(e.target.value)}
                 onClick={(e) => e.stopPropagation()}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') {
                     if (e.target.value) {
                       onChange({ name: `${otherValue} pt`, value: parseFloat(e.target.value) })
                     }
                     setDropdownOpen(false)
                   }
                 }}
          />
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>

  )
}
