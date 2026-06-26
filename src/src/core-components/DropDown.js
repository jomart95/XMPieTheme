import React, { useState } from 'react'
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Input,
} from 'reactstrap-wc'
import { t } from '$themelocalization'
import { Icon } from '$core-components'
import './DropDown.scss'

const SearchMenuItem = ({ onChange, placeholder }) => {
  const [searchValue, setSearchValue] = useState('')

  const onChangeHandler = (value) => {
    setSearchValue(value)
    onChange(value)
  }

  const onClearSearchHandler = () => {
    setSearchValue('')
    onChange('')
  }

  return <div className="drop-down-search-input-item">
    <Input type="text" value={searchValue} className="drop-down-search-input" onChange={(e) => onChangeHandler(e.target.value)} placeholder={placeholder}/>
    <div className="drop-down-search-icon-container">
      {searchValue ? <Icon name="close_black.svg" wrapperClassName="drop-down-search-icon" width="14px" height="14px" onClick={onClearSearchHandler}/> :
       <Icon name="search.svg" wrapperClassName="drop-down-search-icon" width="20px" height="20px"/>}
    </div>
  </div>
}

const DropDown = ({ direction, items, selectedValue, onChange, searchable, dropDownToggle, searchPlaceholder, disabled, customArrow, ...args }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const toggle = () => setDropdownOpen((prevState) => !prevState)
  const [searchValue, setSearchValue] = useState('')

  const filteredItems = items.filter(item => searchValue === '' || item.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1)

  const Item = ({ item }) => {
    if (item.component) {
      return React.createElement(item.component)
    }
    return <div className={`drop-down-item-container ${item.disabled ? 'disabled' : ''}`}>
      {item.icon && <Icon name={item.icon} className={`drop-down-item-icon drop-down-name-${item.icon.replace('.svg','')}`} width={item.width ?? '20px'} height={item.height ?? '20px'}/>}
      <span>{item.name}</span>
    </div>
  }

  return (

    <Dropdown isOpen={dropdownOpen} toggle={toggle} direction={direction} className="drop-down">
      {dropDownToggle ?
        (<DropdownToggle className="drop-down-toggle-overrides" disabled={disabled}><span>{dropDownToggle}</span></DropdownToggle>) :
        (<DropdownToggle disabled={disabled} caret>{customArrow && customArrow}{selectedValue?.name ? <span>{selectedValue.name}</span> : <span>&nbsp;</span>}</DropdownToggle>)
      }
      <DropdownMenu {...args} >
        {searchable && <SearchMenuItem onChange={setSearchValue} placeholder={searchPlaceholder}/>  }
        {filteredItems.map((item, index) => {
          if (item.divider) {
            return <DropdownItem key={index} divider />
          }
          return <DropdownItem key={index}
                               onKeyDown={() => !item.disabled && onChange(item)}
                               onClick={() => !item.disabled && onChange(item)}
                               active={selectedValue?.value === item.value}
                               disabled={item.disabled}
          >
            <Item item={item}/>
          </DropdownItem>
        })}
        {filteredItems.length === 0 && <DropdownItem disabled>{t('DropDown.NoResultsFound')}</DropdownItem>}
      </DropdownMenu>
    </Dropdown>

  )
}

export default DropDown
