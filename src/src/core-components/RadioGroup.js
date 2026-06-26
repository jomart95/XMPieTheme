import React from 'react'
import './RadioGroup.scss'

// option:
// {
//    value: string
//    label: string
// }

const RadioGroup = (props) => {
  const { className, groupName, options, selectedValue, onChange } = props

  if (!options || options.length === 0 || !groupName) {
    return null
  }

  return <div className={`${className} radio-group`} tabIndex="-1">
    {
      options.map((opt) => {
        const isSelected = opt.value === selectedValue
        return <label key={opt.value} className="radio-button" tabIndex="-1">
          <input key={`input_${opt.value}`} type="radio" data-qaautomationinfo={opt.value} data-isselected={isSelected}
                 checked={isSelected} name={groupName} onChange={onChange.bind(this, opt.value, opt)} id={opt.id}/>
          <span className="radio-checkmark"/>
          {opt.label}
        </label>
      })
    }
  </div>
}

export default RadioGroup
