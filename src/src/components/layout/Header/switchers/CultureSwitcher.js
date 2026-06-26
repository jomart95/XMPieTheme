import { Switcher } from '$core-components'
import Flag from './Flag'
import React, { useEffect, useState } from 'react'
import { t } from '$themelocalization'
import { useParams } from 'react-router-dom'
import { switchCulture } from './utils'

export const CultureSwitcher = ({currentCulture,cultures }) => {
  const params = useParams()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const onResize =  () => {
      const cultureSwitcher = document.querySelector('.switcher.culture')
      if (cultureSwitcher && window.getComputedStyle(cultureSwitcher).display === 'none') {
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

  const culturesViewModel = cultures?.map(({ ID, CountryCode, Name }) => ({
    id: ID, icon: `${CountryCode}.svg`, name: Name, value: Name
  })) || []

  const cultureSelected = (selected) => {
    const selectedCulture = cultures.find(i => i.ID === selected)
    switchCulture(selectedCulture, params)
  }

  if (!isVisible) {
    return null
  }

  return <Switcher
    className="culture"
    items={culturesViewModel}
    selected={currentCulture && culturesViewModel.find((element) => { return currentCulture.ID === element.id })}
    label={t('Header.Language')}
    onSelected={cultureSelected}
    renderSelection={(selected) => <>
      <Flag name={selected.icon} width="29" height="19" className="icon"/>
      <span className="switcher-selected">{selected.value}</span>
    </>}
    renderItem={(item) => <>
      <Flag name={item.icon} width="29" height="19" className="icon"/>
      <span className="name">{item.value}</span>
    </>}
  />
}
