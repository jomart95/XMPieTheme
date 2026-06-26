import React, { useState } from 'react'
import {t} from '$themelocalization'
import { Icon } from '$core-components'

import './ExpandableList.scss'

export const ExpandableList = ({ properties }) => {
  const [showAll, setShowAll] = useState(properties.length <= 3)
  const visibleItems = showAll ? properties : properties.slice(0, 2)

  const toggleList = () => {
    setShowAll(!showAll)
  }

  return (
    <div>
      <ul className="expandable-list">
        {visibleItems.map((property) => (
          <li className="property" key={property}>{property.name}: {property.value}</li>
        ))}
      </ul>
      {properties?.length > 3 && <button className="expandable-list-toggler" onClick={toggleList}>
        {t(`Cart.Item.ExpandedList.${showAll ? 'ViewLess' : 'ViewMore'}`)}
        <Icon name={showAll ? 'cart_view_less.svg' : 'cart_view_more.svg'} width="10px" height="10px"/>
      </button>}
    </div>
  )
}
