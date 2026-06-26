import "./PageToggleButton.scss"
import { t } from '$themelocalization'

// TODO: it's no longer used. If we don't plan to use in the nearest future. We could remove it
export const PageToggleButton = ({ setPage, pageNumber, doubleSidedPrinting }) => {
    return (
        <div className="paginator-wrapper-toggle-button">
            <div className="toggle-btn-wrapper">
                <button onClick={() => setPage(1)} className={`${pageNumber === 1 && 'active'} left-btn`}>
                    {doubleSidedPrinting > 1 ? t('UploadDocument.Front') : t('UploadDocument.PageNumber', {number: 1})}
                </button>
                <button onClick={() => setPage(2)} className={`${pageNumber === 2 && 'active'} right-btn`}>
                    {doubleSidedPrinting > 1 ? t('UploadDocument.Back') : t('UploadDocument.PageNumber', {number: 2})}
                </button>
            </div>
        </div>
    )
}
