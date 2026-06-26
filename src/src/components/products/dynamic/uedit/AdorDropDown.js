import { useState, useEffect } from 'react'
import { Dropdown } from '$core-components'
import {t} from '$themelocalization'
import UEditProvider from './ueditProvider'
import { SelectorArrow } from '$core-components'


export const AdorDropDown = ({ selectedValue, onChange = () => {}, filterBy }) => {
  const options = [{
    name: t('UEdit.SelectContent'),
    value: ''
  }, ...UEditProvider.getAdorsList().filter(filterBy).map(ador => ({
    name: ador.name,
    value: ador.name,
    type: ador.type
  }))]
  const [selected, setSelected] = useState(options.find(o => o.name === selectedValue) || options[0])

  useEffect(() => {
    const findSelected = options.find(o => o.value === selectedValue)
    if (selectedValue) {
      if (findSelected) {
        setSelected(findSelected)
      } else {
        options[0].name = selectedValue
        setSelected(options[0])
      }
    } else {
      setSelected(options[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValue])

  const onValueChange = (selected) => {
    setSelected(selected)
    onChange(selected)
  }

  return (
    <Dropdown
      customArrow={<SelectorArrow />}
      items={options}
      selectedValue={selected}
      onChange={onValueChange}
    />
  )
}
