import React, { useState, useRef, useContext } from 'react'
import { createPortal } from 'react-dom'
import { ChromePicker } from 'react-color'
import { Button, Icon } from '$core-components'
import { t } from '$themelocalization'
import { RootDocumentContext } from '$themeservices'
import './ColorPicker.scss'
import UEditProvider from './ueditProvider'

const ColorPicker = ({ setColor, children, isShape, title, productID, lastColor }) => {
  const {rootElement} = useContext(RootDocumentContext)()
  const [showColorPicker, setShowColorPicker] = useState(false)
  const buttonRef = useRef(null)
  const [currentColor, setCurrentColor] = useState('#d6d6d6')

  const userHexColorList = JSON.parse(localStorage.getItem(`recentColors_${productID}`)) || []
  const closeColorPicker = (e, noColor) => {
    e.stopPropagation()
    setColor(noColor ? null : currentColor)
    if (currentColor && !UEditProvider.hexColorList.includes(currentColor)) {
      localStorage.setItem(`recentColors_${productID}`, JSON.stringify([...new Set([currentColor, ...userHexColorList])]))
    }
    setShowColorPicker(false)
  }

  return <Button className="icon-btn" onClick={() => setShowColorPicker(true)} ref={buttonRef}>
    {children}
    {showColorPicker &&
      createPortal(
        <div className="color-section">
          <div className={"color-controls-title"}>{title}</div>
          <Button className="icon-btn uedit-close" onClick={(e) => closeColorPicker(e)}>
            <Icon name="uedit-close.svg" width="20px" height="20px"/>
          </Button>
          <ChromePicker
              disableAlpha={true}
              width={'100%'}
              color={currentColor || lastColor || '#FFFFFF'}
              onChangeComplete={(color) => setCurrentColor(color?.hex)}
          />
          <div className="color-lists">
            {UEditProvider.hexColorList.length ?
                <div className="recommended-colors">
                  <div className={'recommended-colors-title'}>{t('UEdit.ColorPicker.RecommendedColors')}</div>
                  <div className="color-swatch">
                    {isShape && <div key={'no-color'} className="color-swatch-icon no-color">
                      <div className="color" style={{backgroundColor: '#FFF'}}
                           onClick={(e) => {
                             setCurrentColor(null)
                             closeColorPicker(e, true)
                           }}/>
                    </div>}
                    {UEditProvider.hexColorList.map((color, idx) => {
                          return <div key={idx} className="color-swatch-icon">
                            <div className="color" style={{backgroundColor: color}}
                                 onClick={() => setCurrentColor(color)}/>
                          </div>
                        },
                    )}
                  </div>
                </div> : null
            }
            {userHexColorList.length ?
                <div className="recent-colors">
                  <div className={`recent-colors-title`}>{t('UEdit.ColorPicker.RecentColors')}</div>
                  <div className="color-swatch">
                    {userHexColorList.map((color, idx) => {
                          return <div key={idx} className="color-swatch-icon">
                            <div className="color" style={{backgroundColor: color}}
                                 onClick={() => setCurrentColor(color)}/>
                          </div>
                        },
                    )}
                  </div>
                </div> : null
            }

          </div>
          <div className="mobile-color-list">
            <div className="color-swatch">
              {isShape && <div key={'no-color'} className="color-swatch-icon no-color">
                <div className="color" style={{backgroundColor: '#FFF'}}
                     onClick={(e) => {
                       setCurrentColor(null)
                       closeColorPicker(e, true)
                     }}/>
              </div>}
              {[...UEditProvider.hexColorList, ...userHexColorList].map((color, idx) => {
                    return <div key={idx} className="color-swatch-icon">
                      <div className="color" style={{backgroundColor: color}}
                           onClick={() => setCurrentColor(color)}/>
                    </div>
                  },
              )}
            </div>
          </div>
        </div>
          , rootElement)}
  </Button>


}

export default ColorPicker
