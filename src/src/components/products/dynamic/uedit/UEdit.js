import React, {useContext, useEffect, useRef, useState} from 'react'
import moment from 'moment'
import { UStoreProvider } from '@ustore/core'
import { createUEdit } from '@ustore/uedit'
import { useClickOutside } from '$themehooks'
import { RootDocumentContext } from '$themeservices'
import { debounce } from "throttle-debounce"

import UEditProvider from './ueditProvider'
import UEditMainControlsPanel from './UEditMainControlsPanel'
import { Paginator } from '../../Paginatior'

import theme from '$styles/theme'
import './UEdit.scss'
import './UEditNoSelection.scss'

let currentCustomizationValues = {}

const UEditProduct = ({
  isControlsOpen,
  product,
  onElementClicked,
  properties,
  uEditAdvancedMode,
  orderItem,
  setUeditSelectedBoxId,
  setUEditLocks,
  isMobile
}) => {
  const {documentRoot, rootElement} = useContext(RootDocumentContext)()
  const [, setSelectedPage] = useState(0)
  const [hasSelection, setHasSelection] = useState(false)
  const ueditContainerRef = useRef()
  const mainControlPanelRef = useRef()
  const [viewerState, setViewerState] = useState({})
  const [initialScale, setInitialScale] = useState(1)
  const [documentHasMultiplePages, setDocumentHasMultiplePages] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [isUEditReady, setUEditReady] = useState(false)
  const hasBeenReady = useRef(false)
  const containerRef = useRef(null)

  const onUndoRedoChange = () => {
    if (!UEditProvider.isUndoRedoTransactionLocked) {
      setCanUndo(!!UEditProvider.canUndo)
      setCanRedo(!!UEditProvider.canRedo)
    }
  }

  const onSelection = () => {
    UEditProvider.clearSavedTextSelection()
    const isSelected = UEditProvider.uEdit.getSelection().length > 0
    if (UEditProvider?.uEdit?.getSelection()[0]) {
      setUeditSelectedBoxId(UEditProvider?.uEdit?.getSelection()[0]?.id)
      UEditProvider.setLocks()
      setUEditLocks(UEditProvider.locks)
    }
    setHasSelection(isSelected)

    onElementClicked && onElementClicked(isSelected)
  }
  const clearSelection = (e) => {
    if (!e.target.closest('.button') && e.target.closest('.left')) {
      e.stopPropagation()
      UEditProvider.clearSelection()
    }
  }
  const onDocumentLoaded = () => {
    window.queueMicrotask(onResizeWindow)
    UEditProvider.fitToPage()
    setDocumentHasMultiplePages(UEditProvider.getPageCount() > 1)
    setViewerState({
      pageNumber: UEditProvider.uEdit.getPageInView() + 1,
      totalPageNumber: UEditProvider.getPageCount()
    })
    setInitialScale(UEditProvider.uEdit.zoom())
  }
  const onEnterPage = (e, inPageInView) => setSelectedPage(inPageInView)

  const onResizeWindow = () => onResize(ueditContainerRef, mainControlPanelRef, documentRoot)
  useClickOutside(ueditContainerRef, clearSelection, rootElement)

  const pushNewCommand = () => !UEditProvider.isUndoRedoTransactionLocked && UEditProvider.pushUndoStack(UEditProvider.getXLIM(), false, onUndoRedoChange)

  useEffect(() => {
    if (orderItem?.DocumentUrl) {
      const newDocumentUrl = orderItem.DocumentUrl
      const loadUEdit = async (stop) => {
        if (!stop) {
          return
        }
        if (!ueditContainerRef.current && !UEditProvider.uEdit) {
          window.queueMicrotask(() => loadUEdit(stop - 1))
          return
        }
        UEditProvider.uEdit = createUEdit(ueditContainerRef.current, {
          width: '100%',
          height: '100%',
          showProgressOnRead: false,
          resizeDefaultProportional: false,
          resizeDefaultScale: false,
          openMode: 'FlatDesign',
          uEditPICssClass: 'uedit-main-container-flat-design',
          uEditMarginClass: 'UEdit-document-margin-flat-design'
        })
        UEditProvider.element = ueditContainerRef.current
        UEditProvider.setViewMode('preview')

        UEditProvider.registerEvent('documentLoaded.UEdit.data-api', onDocumentLoaded)
        UEditProvider.registerEvent('enterPage.uEditStoreView.xmpie', onEnterPage)
        UEditProvider.registerEvent('itemSelected.uEditStoreView.xmpie', onSelection)
        await UEditProvider.loadAssets(product)
        await UEditProvider.loadDocument(newDocumentUrl)

      }
      loadUEdit(10)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderItem])

  useEffect(() => {
    if (!UEditProvider?.uEdit) {
      return
    }
    if (!properties) return;

    (async () => {
      const customizationValues = Object.keys(properties).length === 0 ? [] :
        Object.values(properties).filter(prop => prop.custom?.affectProof).map((property) => ({
            ID: property.custom.id,
            Value: property.uiSchema['ui:widget'] === 'dateTimePicker' ? createDateObject(property.value, property) : property.value || '',
          })
        )

      UEditProvider.allowedAdors = Object.values(properties)
        .filter(prop => prop.custom?.affectProof)
        .reduce((r, { custom, uiSchema }) => ({ ...r, [custom?.code]: uiSchema['ui:widget'] }), {})

      if (areCustomizationValuesEqua(customizationValues, currentCustomizationValues) && Object.keys(properties).length !== 0) {
        return
      }
      UEditProvider.isUndoRedoTransactionTempLocked = true
      currentCustomizationValues = customizationValues
      const proofSetData = await UStoreProvider.api.products.generateProofSet(orderItem.ID, customizationValues)
      UEditProvider.uEdit && refetchProofSet(orderItem, proofSetData, UEditProvider, UEditProvider.uEdit.zoom(), true)

    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties])

  useEffect(() => {
    window.addEventListener('resize', onResizeWindow, true)
    window.addEventListener('popUndoTransaction', pushNewCommand)
    onResizeWindow()
    return () => {
      UEditProvider.unregisterEvent('documentLoaded.UEdit.data-api', onDocumentLoaded)
      UEditProvider.unregisterEvent('enterPage.uEditStoreView.xmpie', onEnterPage)
      UEditProvider.unregisterEvent('itemSelected.uEditStoreView.xmpie', onSelection)
      UEditProvider.dispose()
      currentCustomizationValues = {}
      window.removeEventListener('resize', onResizeWindow)
      window.removeEventListener('popUndoTransaction', pushNewCommand)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

   useEffect(() => {
    if (!containerRef.current) return

    const debouncedCallback = debounce(1000, () => {
      UEditProvider.clearStack()
      onUndoRedoChange()
      setUEditReady(true)
      hasBeenReady.current = true
    })

    const observer = new MutationObserver(() => {
      if (hasBeenReady.current) return
      debouncedCallback()
    })

    observer.observe(containerRef.current, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      debouncedCallback.cancel()
    }
  }, [])

  const setPage = (newPage) => {
    const currentPage = UEditProvider.uEdit.getPageInView() + 1
    const { totalPageNumber } = viewerState
    const documentView = UEditProvider.uEdit.getDocumentView()
    if (newPage !== currentPage && newPage > 0 && newPage <= totalPageNumber) {
      const pageDifference = newPage - currentPage
      const navigationMethod = pageDifference > 0
        ? documentView.goToNextPage
        : documentView.goToPreviousPage
      for (let i = 0; i < Math.abs(pageDifference); i++) {
        navigationMethod.call(documentView)
      }
      setViewerState({ ...viewerState, pageNumber: newPage })
      UEditProvider.uEdit.zoom(initialScale)
      onResizeWindow(ueditContainerRef)
    }
    UEditProvider.clearZoomSteps()
    UEditProvider.uEdit.showPreviewValues()
  }

  const enableSelection =  () => {
    const documentView = UEditProvider.uEdit.getDocumentView()
    if (documentView) {
      setTimeout(() => {
        documentView.activateSelectionDetection()
      }, 100)
    }
  }

  const disableSelection = () => {
    const documentView = UEditProvider.uEdit.getDocumentView()
    if (documentView) {
      documentView.mSelectionDetectionLevel = -1
      documentView.blockSelectionDetection()
    }
  }

  const isMobileBreakpoint = document.body.clientWidth < parseInt(theme.md.replace('px', ''))

  return <div id="uedit-wrapper" className="uedit-wrapper">
    <div className="uedit-control-panel-and-preview">
      {UEditProvider.element &&
        <UEditMainControlsPanel isMobile={isMobileBreakpoint} mainControlPanelRef={mainControlPanelRef}
                                hasSelection={hasSelection} uEditAdvancedMode={uEditAdvancedMode} canUndo={canUndo}
                                canRedo={canRedo} onUndoRedoChange={onUndoRedoChange} isUEditReady={isUEditReady}/>}
      <div className="uedit-editor-preview">
        <div id="uEdit" ref={containerRef}>
          <div id="uEditControl" onScroll={disableSelection}
               onTouchEnd={enableSelection} ref={ueditContainerRef} data-controls-open={`${isControlsOpen}`} />
        </div>
      </div>
    </div>
    {documentHasMultiplePages && <Paginator
      viewerState={viewerState}
      setPage={setPage}
    />}
  </div>
}

export default UEditProduct

function refetchProofSet (orderItem, proofSetData, ueditProvider, initialScale) {
  if (ueditProvider.uEdit) {
    UStoreProvider.api.products.getProofSet(orderItem.ID, proofSetData?.ProofSetID).then((checkProofSetData) => {
      if (checkProofSetData?.Data) {
        const handler = () => {
          ueditProvider.uEdit?.getUndoService().clear()
          ueditProvider.unregisterEvent('documentReady.uEditStoreView.xmpie', handler)
        }
        ueditProvider.registerEvent('documentReady.uEditStoreView.xmpie', handler)
        ueditProvider.pushAdorValues(checkProofSetData?.Data)
        ueditProvider.uEdit?.zoom(initialScale)
      } else {
        if (checkProofSetData?.Status === 1) {
          setTimeout(() => refetchProofSet(orderItem, proofSetData, ueditProvider, initialScale), 1000)
        }
      }
    })
  }
}

function createDateObject (str, property) {
  const mDate = moment(str, true)
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  return {
    date: str ? mDate.format('YYYY-MM-DD') : '',
    time: property.uiSchema['ui:options'].custom.timePickerParams ? mDate.format('HH:mm') : '',
    timeZone
  }
}

function onResize (ueditContainerRef, mainControlPanelRef, documentRoot) {
  if (!ueditContainerRef?.current || !mainControlPanelRef?.current) {
    return
  }
  const isMobileBreakpoint = document.body.clientWidth < parseInt(theme.md.replace('px', ''))
  const uEditResize = () => {
      const container = documentRoot.querySelector('#uEditControl')
      container.style.width = '100%'
      const height = isMobileBreakpoint ? container.parentElement.offsetHeight : container.parentElement.parentElement.offsetHeight
      container.style.height = `${height}px`
      UEditProvider.fitToPage()
  }
  uEditResize()
}

function areCustomizationValuesEqua (a, b) {
  const aMap = a.reduce((r, { ID, Value }) => ({ ...r, [ID]: Value }), {})
  return a.length === b.length && b.every(({ ID, Value }) => aMap[ID] === Value)
}
