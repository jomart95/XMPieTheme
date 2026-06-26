import React, { useEffect, useState } from 'react'
import { Button, Icon } from '$core-components'
import { t } from '$themelocalization'
import UEditProvider from './ueditProvider'
import { UEditBox } from '@ustore/uedit'
import EditorTooltip from './EditorTooltip'
import { UEditDropDown } from './UEditDropDown'
import ColorSelector from './ColorSelector'

const lineSizes = Array.from({length: 21}, (_, i) => i).map(i => ({name: `${i} pt`, value: i}))

const ShapeControlsSection = ({ueditSelectedBoxId, isShape = false, product, orderItem}) => {
    const [lineWidth, setLineWidth] = useState(lineSizes[0])

    const locks = UEditProvider.locks
    const handleLineWidthChange = (item, lockPushUndoRedo) => {
        setLineWidth(item)
        UEditProvider.setLineWidth(item.value, lockPushUndoRedo)
        if (!UEditProvider.uEdit.getSelection()[0].borderColor) {
            UEditProvider.setLineColor('#000000', lockPushUndoRedo)
        }
    }

    useEffect(() => {
        if ([UEditBox.eTypeText, UEditBox.eTypeGraphic, UEditBox.eTypeLine].includes(UEditProvider.uEdit.getSelection()[0].type)) {
            const shapeProps = UEditProvider.getShapeProps()
            if (shapeProps) {
                shapeProps.lineWidth && shapeProps.lineColor && handleLineWidthChange(lineSizes.find(size => size.value === shapeProps.lineWidth) || {
                    name: `${shapeProps.lineWidth} pt`,
                    value: shapeProps.lineWidth,
                }, true)
            }
        }
    }, [ueditSelectedBoxId])

    return <div className={`shape-controls ${isShape ? 'with-padding' : ''}`}>
        {(!locks.STROKE_COLOR_LOCKED && !locks.STROKE_WEIGHT_LOCKED) && <div className="icon-row-section">
            {!locks.STROKE_COLOR_LOCKED && <ColorSelector orderItem={orderItem} product={product} tooltip={t("UEdit.ColorPicker.LineTitle")} type="Line" icon="uEdit_color_line.svg" iconWidth={25} iconHeight={25}/>}
            {!locks.STROKE_WEIGHT_LOCKED && <div className="line-thickness">
                <Icon name="uedit-line-thickness.svg" width="32px" height="32px"/>
                <div className="dropdown-wrapper">
                    <UEditDropDown items={lineSizes} selectedValue={lineWidth} onChange={handleLineWidthChange}/>
                    <EditorTooltip width={180} text={`${t('UEdit.LineThickness')}`}/>
                </div>
            </div>}
        </div>}
        <div className="icon-row-section">
            {!isShape && !locks.BACKGROUND_COLOR_LOCKED
                && <ColorSelector orderItem={orderItem} product={product} tooltip={t("UEdit.ColorPicker.FillTitle")} type="Fill" icon="uEdit_color_fill.svg" iconWidth={25} iconHeight={25}/>}
            <div className="position-buttons-block">
                <Button className="icon-btn move-item" onClick={UEditProvider.bringToFront}>
                    <Icon name="uedit-bring-to-front.svg" width="38px" height="38px"/>
                    <EditorTooltip width={120} text={`${t('UEdit.BringToFront')}`}/>
                </Button>
                <Button className="icon-btn move-item" onClick={UEditProvider.bringForward}>
                    <Icon name="uedit-bring-forward.svg" width="38px" height="38px"/>
                    <EditorTooltip width={120} text={`${t('UEdit.BringForward')}`}/>
                </Button>
                <Button className="icon-btn move-item" onClick={UEditProvider.sendBackward}>
                    <Icon name="uedit-take-backword.svg" width="38px" height="38px"/>
                    <EditorTooltip width={120} text={`${t('UEdit.TakeBackward')}`}/>
                </Button>
                <Button className="icon-btn move-item" onClick={UEditProvider.sendToBack}>
                    <Icon name="uedit-take-back.svg" width="38px" height="38px"/>
                    <EditorTooltip width={120} text={`${t('UEdit.TakeBack')}`}/>
                </Button>
            </div>
        </div>
    </div>
}

export default ShapeControlsSection
