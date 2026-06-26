import React, {useRef, useState, useContext} from 'react'
import { LinkAria } from '$core-components'
import { Popover, PopoverBody } from 'reactstrap-wc'
import NavigationMenu from './NavigationMenu'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import { decodeStringForURL } from '$ustoreinternal/services/utils'
import { t } from '$themelocalization'
import { RootDocumentContext } from '$themeservices'
import './CategoriesNavbar.scss'

const CategoriesNavbar = ({ categoriesTree }) => {
  const {documentRoot, rootElement} = useContext(RootDocumentContext)()
  const [hoveredItem, setHoveredItem] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const containerRef = useRef(null)

  if (!(categoriesTree && categoriesTree.length > 0)) {
    return null
  }

  const onMouseEnter = (category) => {
    queueMicrotask(() => {
      setSelectedCategory(category)
      setHoveredItem(documentRoot.getElementById(`id-${category}`))
    })
  }

  const onMouseLeave = () => {
    setSelectedCategory(null)
    setHoveredItem(null)
  }

  return (
    <div className="categories-navbar" ref={containerRef}>
      <div
        className="categories-navbar-item"
        onMouseEnter={( e ) => onMouseEnter( 0 )}
        onMouseLeave={onMouseLeave}
      >
        <div className="category-title-wrapper view-show-all">
          <span className={`category-title ${selectedCategory === 0 ? 'highlight' : ''}`} id="id-0">
            {t( 'Header.All_Categories' )}
          </span>
          <span className="category-spacer"></span>
          {
            hoveredItem && selectedCategory === 0 &&
            <Popover className="" fade={false} isOpen={true} placement="bottom-start"
                     target={hoveredItem} container={hoveredItem} popperClassName="categories-navbar-popper">
              <PopoverBody>
                <NavigationMenu categoriesTree={categoriesTree} viewShowAll={true} selectedCategory={null} />
              </PopoverBody>
            </Popover>
          }
        </div>
      </div>
      {
        categoriesTree.map( ( { Category, SubCategories }, i ) => {
          const { FriendlyID, Name } = Category
          return (
            <div
              className="categories-navbar-item"
              key={i}
              onMouseEnter={( e ) => onMouseEnter( FriendlyID, e.target )}
              onMouseLeave={onMouseLeave}
            >
              <LinkAria className="category-title-wrapper"
                        to={urlGenerator.get( {
                          page: 'category',
                          id: FriendlyID,
                          name: decodeStringForURL( Name ),
                        } )}>
                <span className={`category-title ${selectedCategory === FriendlyID ? 'highlight' : ''}`}
                      key={i} id={`id-${FriendlyID}`}>
                  <span className="link" key={i} dangerouslySetInnerHTML={{ __html: Name }} />
                </span>
                {
                  hoveredItem && selectedCategory === FriendlyID && SubCategories?.length > 0 &&
                  <Popover fade={false} isOpen={true} placement="bottom-start"
                           target={hoveredItem} container={rootElement}
                           popperClassName="categories-navbar-popper">
                    <PopoverBody>
                      <NavigationMenu categoriesTree={categoriesTree} viewShowAll={false} selectedCategory={Category} />
                    </PopoverBody>
                  </Popover>
                }
              </LinkAria>
            </div>
          )
        } )
      }
    </div>
  )
}

export default CategoriesNavbar
