import React, { useState } from 'react'
import { Button, Icon } from '$core-components'
import { t } from '$themelocalization'
import GeneralTools from './GeneralTools'
import UEditProvider from './ueditProvider'
import './UEditMainControlsPanel.scss'
import EditorTooltip from './EditorTooltip'

const UEditMainControlsPanel = ({ hasSelection, uEditAdvancedMode, isMobile, mainControlPanelRef, canUndo, canRedo, onUndoRedoChange, isUEditReady }) => {

    const [addToolsHidden, setAddToolsHidden] = useState(true)
    const locks = UEditProvider.locks

    const buttonClickHandler = (handler) => {
        !addToolsHidden && setAddToolsHidden(true)
        UEditProvider.clearSelection()
        handler()
    }

    return (
        <div id="UEdit-main-controls-panel" ref={mainControlPanelRef}>
            <GeneralTools isMobile={isMobile} uEditAdvancedMode={uEditAdvancedMode} canUndo={canUndo} canRedo={canRedo} onUndoRedoChange={onUndoRedoChange} isUEditReady={isUEditReady}/>
            <div className="uEdit-object-controls">
                {uEditAdvancedMode && !UEditProvider.checkIfAddAndDeleteFunctionalityLocked() &&
                    <div className="advanced-mode-tools">
                        <div className="button-wrapper" onClick={() => buttonClickHandler(UEditProvider.addText)}>
                            <Button className="icon-btn uedit-add-text" onClick={() => {
                            }}>
                                <Icon name="uedit-add-text.svg" width="22px" height="22px"/>
                                <EditorTooltip width={110} text={`${t('UEdit.AddText')}`}/>
                            </Button>
                            {!addToolsHidden && <div className="icon-title">{t('UEdit.AddText')}</div>}
                        </div>
                        <div className="button-wrapper uedit-add-image"
                             onClick={() => buttonClickHandler(UEditProvider.addImage)}>
                            <Button className="icon-btn" onClick={() => {
                            }}>
                                <Icon name="uedit-add-image.svg" width="22px" height="22px"/>
                                <EditorTooltip width={120} text={`${t('UEdit.AddImage')}`}/>
                            </Button>
                            {!addToolsHidden && <div className="icon-title">{t('UEdit.AddImage')}</div>}
                        </div>
                        <div className="button-wrapper uedit-add-line"
                             onClick={() => buttonClickHandler(UEditProvider.addLine)}>
                            <Button className="icon-btn" onClick={() => {
                            }}>
                                <Icon name="uedit-add-line.svg" width="22px" height="22px"/>
                                <EditorTooltip width={110} text={`${t('UEdit.AddLine')}`}/>
                            </Button>
                            {!addToolsHidden && <div className="icon-title">{t('UEdit.AddLine')}</div>}
                        </div>
                    </div>}
                {!UEditProvider.checkIfAddAndDeleteFunctionalityLocked() && <Button disabled={!hasSelection || locks.DELETE_LOCKED} className="icon-btn delete"
                         onClick={UEditProvider.deleteSelection}>
                    <Icon name="uedit-delete.svg" width="22px" height="22px"/>
                    <EditorTooltip width={110} text={`${t('UEdit.Delete')}`}/>
                </Button>}
            </div>
        </div>)
}

export default UEditMainControlsPanel
