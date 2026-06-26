import React, { useEffect, useRef, useState } from 'react'
import { UEditBox } from '@ustore/uedit'
import { t } from '$themelocalization'
import { Button, Icon } from '$core-components'
import TextControlsSection from './TextControlsSection'
import ImageControlsSection from './ImageControlsSection'
import UEditProvider from './ueditProvider'

import './UEditControlsPanel.scss'
import ShapeControlsSection from './ShapeControlsSection'

const UEditControlsPanel = ({
                                onClose,
                                isMobile,
                                ueditSelectedBoxId,
                                uEditDisplayContentObjectList,
                                properties,
                                onChange,
                                locks,
                                product,
                                orderItem,
                                errors
                            }) => {
    const scrollAreaRef = useRef(null)
    const [scrolled, setScrolled] = useState(false)
    const theBox = UEditProvider.uEdit.getSelection()[0]

    useEffect(() => {
        const handleScroll = () => setScrolled(scrollAreaRef.current.scrollTop > 0)
        const container = scrollAreaRef.current
        container.addEventListener('scroll', handleScroll)
        document.body.style.overflow = 'hidden'

        return () => {
            container.removeEventListener('scroll', handleScroll)
            document.body.style.overflow = 'auto'
        }
    }, [])

    const sections = {
        Text: theBox.type === UEditBox.eTypeText,
        Image: !theBox.textContent && theBox.type !== UEditBox.eTypeLine,
        Shape: theBox.type === UEditBox.eTypeLine && !theBox.textContent,
    }

    const close = () => {
        UEditProvider.clearSelection()
        onClose()
    }

    const title = sections.Text ? t('UEdit.Text') : sections.Image ? t('UEdit.Image') : t('UEdit.ShapeControlSection.Line')
    return (
        <div className={`UEdit-controls-panel ${isMobile ? 'mobile' : ''}`}>
            {!locks.TEXT_ATTRIBUTES_LOCKED && <div className={`text-controls-title ${scrolled ? 'scrolled' : ''}`}>
                <div>{title}</div>
            </div>}
            <Button className="icon-btn uedit-close" onClick={() => close()}>
                <Icon name="uedit-close.svg" width="20px" height="20px"/>
            </Button>
            <div className="scroll-area" ref={scrollAreaRef}>
                {sections.Text && <TextControlsSection
                    product={product}
                    orderItem={orderItem}
                    ueditSelectedBoxId={ueditSelectedBoxId}
                    uEditDisplayContentObjectList={uEditDisplayContentObjectList} locks={locks}/>}
                {sections.Image && <ImageControlsSection ueditSelectedBoxId={ueditSelectedBoxId} properties={properties}
                                                         uEditDisplayContentObjectList={uEditDisplayContentObjectList}
                                                         locks={locks}
                                                         onChange={onChange}
                                                         product={product}
                                                         orderItem={orderItem}
                                                         customizationErrors={errors}
                />}
                {sections.Shape &&
                    <ShapeControlsSection product={product} orderItem={orderItem} ueditSelectedBoxId={ueditSelectedBoxId} isShape={true}/>}
            </div>
            <div className={`sticky-panel ${sections.Shape ? 'shape-edit' : ''}`}>
                <div className="general-controls">
                    <div className="undo-block">
                        <Button className="icon-btn uedit-undo" onClick={UEditProvider.undo}>
                            <Icon name="uedit-undo.svg" width="22px" height="22px"/>
                        </Button>
                        <Button className="icon-btn uedit-redo" onClick={UEditProvider.redo}>
                            <Icon name="uedit-redo.svg" width="22px" height="22px"/>
                        </Button>
                    </div>
                    {!locks.DELETE_LOCKED && <Button className="icon-btn" onClick={UEditProvider.deleteSelection}>
                        <Icon name="uedit-delete.svg" width="22px" height="22px"/>
                    </Button>}
                </div>
            </div>
        </div>)
}

export default UEditControlsPanel
