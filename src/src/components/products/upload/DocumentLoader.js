import React from 'react'
import "./DocumentLoader.scss"
import { t } from '$themelocalization'
import { Slot } from '$core-components'
import { ReactComponent as DesktopUploadDocumentIcon } from '$assets/icons/EasyUpload_desktop.svg'
import { ReactComponent as MobileUploadDocumentIcon } from '$assets/icons/EasyUpload_mobile.svg'
import { ReactComponent as DownloadDocumentIcon } from '$assets/icons/download.svg'
import { UploadDocumentButton } from './UploadDocumentButton'
import { uploadEasyUploadFile } from './easyUploadUtils'
import { Tooltip } from '$core-components'

const EasyUploadSizeLimit = '50MB'

const DocumentLoader = ({
                            errorMessage,
                            setErrorMessage,
                            viewerState,
                            setViewerState,
                            setFileName,
                            fileName,
                            properties,
                            orderItem,
                            product,
                            setIsDocumentLoading,
                            onFormChange,
                            documentLoaded,
                            setDocumentLoaded,
                            setUploadError,
                            forceInputFile,
}) => {
    const propertyKey = Object.keys(properties).find(key => properties[key].custom?.code === 'FileAttachment')
    const propertyID = properties && properties[propertyKey]?.custom?.id
    const propertyDescription = properties[propertyKey]?.description || ""
    const templateUrl = properties[propertyKey]?.uiSchema['ui:options'].custom.templateUrl
    const allowedExtensionsList = properties[propertyKey]?.uiSchema['ui:options'].custom.allowedExtensions
    const allowedExtensionsString = allowedExtensionsList?.map(ext => `*.${ext}`).join(', ');
    const sizeLimit = properties[propertyKey]?.propertySchema?.custom?.validation?.find((e)=> e.validationType === "FileAttachmentMaxSize")?.parameters?.maximumValue


    const handleDrop = async (event) => {
        event.preventDefault();
        const uploadedFile = event.dataTransfer.files[0];
        setIsDocumentLoading(true)
        await uploadEasyUploadFile(setIsDocumentLoading, fileName, orderItem, propertyID, setUploadError, setDocumentLoaded, setErrorMessage, uploadedFile, setFileName, setViewerState, viewerState, product)
        onFormChange(propertyKey, [], [])
        setIsDocumentLoading(false)
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    return (
        <div
            className="drop-zone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <div className="drop-zone-title-wrapper">
                <MobileUploadDocumentIcon className="mobileUploadIcon"/>
                <DesktopUploadDocumentIcon className="desktopUploadIcon"/>
                <div className="drop-zone-title">
                    <p>{t('UploadDocument.DragAndDropTitle')}</p>
                    <p>{t('UploadDocument.Or')}</p>
                </div>
                <UploadDocumentButton
                    viewerState={viewerState}
                    setViewerState={setViewerState}
                    setFileName={setFileName}
                    fileName={fileName}
                    onFormChange={onFormChange}
                    setIsDocumentLoading={setIsDocumentLoading}
                    product={product}
                    orderItem={orderItem}
                    properties={properties}
                    upload={true}
                    errorMessage={errorMessage}
                    setErrorMessage={setErrorMessage}
                    setDocumentLoaded={setDocumentLoaded}
                    setUploadError={setUploadError}
                    forceInputFile={forceInputFile}
                />
                {allowedExtensionsString && <p className="restriction-hint">
                    {`${t('UploadDocument.SupportedFiles', {
                        allowedExtensions: allowedExtensionsString,
                        maxFileSize: sizeLimit ? `${sizeLimit}MB` : EasyUploadSizeLimit
                    })}`.split('. ').map((line, i, arr) => <span key={i}>{line}{i !== arr.length - 1 && '. '}</span>)}
                </p>}
                {errorMessage && !documentLoaded && <div className="upload-error-block">
                    <p className="upload-error" dangerouslySetInnerHTML={{__html:errorMessage}}></p>
                </div>}
                <Slot name="ng_product_easy_upload_document_upload_button"
                      data={{product, properties, errorMessage, fileName, orderItem} }
                      actions={{
                        onFormChange, setIsDocumentLoading, setUploadError,
                        setFileName, setErrorMessage,setDocumentLoaded}}
                />
            </div>
            {((templateUrl && templateUrl.length) || propertyDescription) && <div className="download-instructions-wrapper">
                {propertyDescription && <div className={`download-instructions-wrapper-title ${templateUrl && templateUrl.length ? 'template-exist' : ""}`}>
                    <Tooltip className="description" forceTooltip={true} text={propertyDescription}/>
                </div>}
                {templateUrl && templateUrl.length && <span className="download-instructions">
                    <a className="download-instructions-title" download="template" href={templateUrl}>
                        <DownloadDocumentIcon/>
                        {t('UploadDocument.DownloadInstruction')}
                    </a>
                    </span>}
            </div>}
        </div>
    );
};

export default DocumentLoader;
