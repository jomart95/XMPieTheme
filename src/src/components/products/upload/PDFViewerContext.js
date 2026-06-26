import React, { createContext, useContext, useState } from 'react'

const PDFViewerContext = createContext();

const defaultState = {
    twoPages: false,
    pageNumber: 1,
    scale: 2,
    rotation: 0,
    corners: '',
    totalPageNumber: 1,
    previewUrl: null,
    metaData: null,
    realSize: '',
    pageSize: 'Auto'
}

export const PDFViewerProvider = ({children}) => {
    const [viewerState, setViewerState] = useState(defaultState)

    const [fileName, setFileName] = useState(null)
    const [isDocumentLoading, setIsDocumentLoading] = useState(false)
    const [uploadErrorMessage, setUploadErrorMessage] = useState('')

    const setDefault = () => {
        setViewerState({
            ...viewerState,
            pageNumber: 1,
            totalPageNumber: 1,
            previewUrl: '',
            metaData: '',
            realSize: ''
        })
        setFileName('')
        setIsDocumentLoading(false)
        setUploadErrorMessage('')
    }

    return (
        <PDFViewerContext.Provider value={{
            fileName,
            setFileName,
            viewerState,
            setViewerState,
            isDocumentLoading,
            setIsDocumentLoading,
            uploadErrorMessage,
            setUploadErrorMessage,
            setDefault
        }}>
            {children}
        </PDFViewerContext.Provider>
    )
}

export const usePDFViewer = () => {
    return useContext(PDFViewerContext)
}
