import './ColorSelector.scss'
import { Icon } from '$core-components'
import React, { useEffect, useState } from 'react'
import EditorTooltip from './EditorTooltip'
import ColorPicker from './ColorPicker'
import ueditProvider from './ueditProvider'
import { t } from '$themelocalization'

const defaultColor = '#d6d6d6'

const ColorSelector = ({ type, icon, iconWidth, iconHeight, tooltip, product, orderItem }) => {
    const [lastColor, setLastColor] = useState(null)

    const colorTitles = {
        Text: t('UEdit.ColorPicker.TextTitle'),
        Line: t('UEdit.ColorPicker.LineTitle'),
        Fill: t('UEdit.ColorPicker.FillTitle')
    }
    useEffect(() => {
        const prevActiveColors = localStorage.getItem(`activeColors_${orderItem.ID}`)
        if (prevActiveColors) {
            setLastColor(JSON.parse(prevActiveColors)[type])
        } else {
            const newActiveColors = { Text: defaultColor, Line: defaultColor, Fill: defaultColor }
            setLastColor(newActiveColors[type])
            localStorage.setItem(`activeColors_${orderItem.ID}`, JSON.stringify(newActiveColors))
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const applyColor = (color) => {
        switch (type) {
            case 'Text':
                    ueditProvider.applyTextOverridesOnSelection({ color })
                break
            case 'Line':
                    ueditProvider.setLineColor(color)
                break
            case 'Fill':
                    ueditProvider.setShapeBackgroundColor(color)
                break
            default:
                break
        }
    }

    const updateActiveColors = (color) => {
        const prevActiveColors = localStorage.getItem(`activeColors_${orderItem.ID}`)
        localStorage.setItem(`activeColors_${orderItem.ID}`, JSON.stringify({...JSON.parse(prevActiveColors), [type]: color}))
    }

    return <div className="color-selector">
        <div className="color-button" onClick={() => applyColor(lastColor)}>
            <Icon name={icon} width={`${iconWidth}px`} height={`${iconHeight}px`}/>
            <div className="selected-color" style={{backgroundColor: lastColor }}/>
        </div>
        <EditorTooltip width={120} text={tooltip}/>
        <div className="vertical-line"/>
        <div className="arrow">
            <ColorPicker
                isShape={type !== 'Text'}
                title={colorTitles[type]}
                productID={product.ID}
                lastColor={lastColor}
                setColor={(color) => {
                    setLastColor(color)
                    applyColor(color)
                    updateActiveColors(color)
            }}>
                <Icon name='arrowDown.svg' width="16px" height="20px"/>
            </ColorPicker>
        </div>
    </div>
}

export default ColorSelector
