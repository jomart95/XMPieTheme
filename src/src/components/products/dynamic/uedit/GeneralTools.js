import React, { useCallback, useEffect, useState } from 'react'
import { Button, Icon, ClickOutside } from '$core-components'
import { t } from '$themelocalization'
import UEditProvider from './ueditProvider'
import './GeneralTools.scss'
import EditorTooltip from './EditorTooltip'
import { debounce } from 'throttle-debounce'

const GeneralTools = ({ isMobile, uEditAdvancedMode, onUndoRedoChange, canUndo, canRedo, isUEditReady }) => {
    const [isPreviewMode, setIsPreviewMode] = useState(true)
    const [showInitialTooltip, setShowInitialTooltip] = useState(true)
    const [canZoomIn, setCanZoomIn] = useState(false)
    const [canZoomOut, setCanZoomOut] = useState(false)
    const [showHiddenTools, setShowHiddenTools] = useState(false)

    const onPreviewModeChange = () => {
        setIsPreviewMode(!isPreviewMode)
        UEditProvider.setViewMode(!isPreviewMode ? 'preview' : 'normal')
    }

    const updateZoom = () => {
        window.queueMicrotask(() => {
            setCanZoomIn(UEditProvider.canZoomIn)
            setCanZoomOut(UEditProvider.canZoomOut)
        })
    }



    const setInitialStack = () => {
        if (UEditProvider.isUndoRedoTransactionLocked) {
            UEditProvider.isUndoRedoTransactionLocked = false
            UEditProvider.clearStack()
            onUndoRedoChange()
        }
        if (UEditProvider.isUndoRedoTransactionTempLocked) {
            UEditProvider.isUndoRedoTransactionTempLocked = false
        }
    }

    // eslint-disable-next-line
    const debouncedDocumentReady = useCallback(
        debounce(500, setInitialStack),
        []
    )

    useEffect(() => {
        const onResize = () => {
            UEditProvider.clearZoomSteps()
            updateZoom()
        }
        const onDocumentReady = () => {
            updateZoom()
            debouncedDocumentReady()
        }
        if (UEditProvider.element) {
            UEditProvider.registerEvent('documentReady.uEditStoreView.xmpie', onDocumentReady)
        }
        window.addEventListener('resize', onResize, true)

        return () => {
            UEditProvider.unregisterEvent('documentReady.uEditStoreView.xmpie', onDocumentReady)
            window.removeEventListener('resize', onResize)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const UndoRedoTools = () => (
        <div className={`undo-redo-block ${uEditAdvancedMode && !UEditProvider.checkIfAddAndDeleteFunctionalityLocked() ? 'advanced-on' : 'advanced-off'}`}>
            <Button className="icon-btn uedit-undo" onClick={() => {
                UEditProvider.undo()
                onUndoRedoChange()
            }}
                    disabled={!canUndo || !isUEditReady}>
                <Icon name="uedit-undo.svg" width="22px" height="22px"/>
                <div className={`tool-title ${!canUndo || !isUEditReady  ? 'disabled' : ''}`}>{`${t('UEdit.Undo')}`}</div>
                <EditorTooltip width={80} text={`${t('UEdit.Undo')}`}/>
            </Button>
            <Button className="icon-btn uedit-redo" onClick={() => {
                UEditProvider.redo()
                onUndoRedoChange()
            }}
                    disabled={!canRedo}>
                <Icon name="uedit-redo.svg" width="22px" height="22px"/>
                <div className={`tool-title ${!canRedo ? 'disabled' : ''}`}>{`${t('UEdit.Redo')}`}</div>
                <EditorTooltip width={80} text={`${t('UEdit.Redo')}`}/>
            </Button>
        </div>
    )

    const ZoomTools = () => (
        <div className={`zoom-block ${uEditAdvancedMode && !UEditProvider.checkIfAddAndDeleteFunctionalityLocked() ? 'advanced-on' : 'advanced-off'}`}>
            <Button className="icon-btn uedit-zoom-out" onClick={() => {
                UEditProvider.zoomOut()
                updateZoom()
            }} disabled={!canZoomOut}>
                <Icon name="uedit-zoom-out.svg" width="22px" height="22px"/>
                <div className={`tool-title ${!canZoomOut ? 'disabled' : ''}`}>{`${t('UEdit.ZoomOut')}`}</div>
                <EditorTooltip width={110} text={`${t('UEdit.ZoomOut')}`}/>
            </Button>
            <Button className="icon-btn uedit-zoom-in" onClick={() => {
                UEditProvider.zoomIn()
                updateZoom()
            }} disabled={!canZoomIn}>
                <Icon name="uedit-zoom-in.svg" width="22px" height="22px"/>
                <div className={`tool-title ${!canZoomIn ? 'disabled' : ''}`}>{`${t('UEdit.ZoomIn')}`}</div>
                <EditorTooltip width={110} text={`${t('UEdit.ZoomIn')}`}/>
            </Button>
        </div>
    )

    const showTools = () => !showHiddenTools && setShowHiddenTools(true)
    const hideTools = () => {
        if (showHiddenTools) {
            setShowHiddenTools(false)
        }
    }

    return <div className="uEdit-general-controls">
        <div className={`hidden-tools-btn ${uEditAdvancedMode  && !UEditProvider.checkIfAddAndDeleteFunctionalityLocked() ? 'advanced-on' : 'advanced-off'}`}
             onMouseOver={() => !isMobile && showTools()}>
            <Button className="icon-btn " onClick={showTools}>
                <Icon name="uEdit_menu.svg" width="22px" height="22px"/>
            </Button>
        </div>
        <ClickOutside trigger={() => hideTools()} className="hidden-tools-mobile-wrapper">
            <div className={`hidden-tools ${showHiddenTools ? 'show' : ''}`}
                 onMouseLeave={() => !isMobile && hideTools()}
            >
                <div className="bridge"/>
                <UndoRedoTools/>
                <ZoomTools/>
            </div>
        </ClickOutside>
        <UndoRedoTools/>
        <ZoomTools/>
        <Button className="icon-btn uedit-preview-mode" onClick={onPreviewModeChange}>
            {isPreviewMode ? <Icon name="uedit-toggle-content-objects.svg" width="22px" height="22px"/>
                : <Icon name="uedit-toggle-content-objects-crossed.svg" width="22px" height="22px"/>}
            {showInitialTooltip &&
                <ClickOutside trigger={() => setShowInitialTooltip(false)}
                              className="uedit-preview-tooltip-click-wrapper">
                    <EditorTooltip className={'uedit-preview-tooltip'} width={200} text={`${t('UEdit.PreviewTooltip')}`}
                                   position={'top'}/>
                </ClickOutside>}
            {!showInitialTooltip && <EditorTooltip width={200}
                                                   text={isPreviewMode ? `${t('UEdit.PreviewTooltip')}` : `${t('UEdit.PreviewTooltipActive')}`}/>}
        </Button>
    </div>
}

export default GeneralTools
