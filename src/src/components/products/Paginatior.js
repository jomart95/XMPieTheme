import { ReactComponent as LeftArrow } from '$assets/icons/dark_left_arrow.svg'
import { ReactComponent as RightArrow } from '$assets/icons/dark_right_arrow.svg'
import { ReactComponent as DoubleLeftArrow } from '$assets/icons/double-arrow-left.svg'
import { ReactComponent as DoubleRightArrow } from '$assets/icons/double-arrow-right.svg'
import { t } from '$themelocalization'
import { PageToggleButton } from './upload/PageToggleButton'
import { useEffect, useState } from 'react'
import { debounce } from 'throttle-debounce'
import './Paginator.scss'

export const Paginator = ({ viewerState, setPage, stickyPreview }) => {
  const { doubleSidedPrinting, totalPageNumber, pageNumber } = viewerState
  const [pageText, setPageText] = useState('1')
  const maxPage = doubleSidedPrinting > 1 && totalPageNumber % 2 !== 0 ? totalPageNumber + 1 : totalPageNumber

  useEffect(() => {
    const value = viewerState.pageNumber
    if (viewerState.doubleSidedPrinting > 1 && value < 2) {
      setPageText('1')
      return
    }
    if (viewerState.doubleSidedPrinting > 1 && value > 1 && !stickyPreview) {
      if (value % 2 !== 0) {
        setPageText(`${value - 1}-${value}`)
        return
      } else {
        if (value === viewerState.totalPageNumber || value === viewerState.totalPageNumber - 1) {
          viewerState.totalPageNumber % 2 ?
            setPageText(`${viewerState.totalPageNumber - 1}-${viewerState.totalPageNumber}`) :
            setPageText(`${viewerState.totalPageNumber}`)
          return
        }
        if (value === maxPage) {
          setPageText(`${value}`)
          return
        }
        setPageText(`${value}-${value + 1}`)
        return
      }
    }
    setPageText(`${value}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerState.pageNumber, viewerState.doubleSidedPrinting])

  const delta = () => (!stickyPreview && doubleSidedPrinting > 1 && pageNumber !== 1) ||
  (stickyPreview && pageNumber === 0) ? 2 : 1
  const nextPage = () => debounce(500, () => setPage(Math.min(maxPage, pageNumber + delta())))()
  const previousPage = () => debounce(500, () => setPage(Math.max(1, pageNumber - delta())))()
  const startPage = () => setPage(1)
  const endPage = () => setPage(maxPage)
  const jumpPage = (e) => {
    if (e.key === 'Enter' || e.pointerType === 'mouse') {
      blurHandler()
    }
  }

  const blurHandler = () => {
    const inputNumber = parseInt(pageText)
    if (!inputNumber) return
    let value = inputNumber
    if (inputNumber % 2 === 0 && inputNumber > 2 && viewerState.doubleSidedPrinting > 1 && inputNumber === maxPage) {
      setPageText(`${inputNumber}`)
      setPage(inputNumber)
    } else if (inputNumber % 2 && inputNumber > 2 && viewerState.doubleSidedPrinting > 1) {
      value = inputNumber - 1
      setPageText(`${value}-${value + 1}`)
    }
    if (value < 1 || value > viewerState.totalPageNumber) return
    setPage(value)
  }

  return (
    (totalPageNumber > 2 && <div id="paginator" className="controls">
      <div className={`control-button-wrapper ${viewerState.pageNumber === 1 && "disabled"}`} onClick={startPage}>
        <DoubleLeftArrow/>
      </div>
      <div className={`control-button-wrapper ${viewerState.pageNumber === 1 && "disabled"}`} onClick={previousPage}>
        <LeftArrow/>
      </div>
      <div className="page-number-control">
        <input className="pdf-page-number" type="text"
               onKeyDown={jumpPage}
               onChange={e => setPageText(e.target.value.replace(/(?!^)-{2,}|^-|[^0-9-]/g, ''))}
               value={pageText}
               onBlur={() => blurHandler()}/>
        <span>{t('UploadDocument.Of')}</span>
        <span className="pages-amount">{maxPage}</span>
      </div>
      <div className={`control-button-wrapper ${viewerState.pageNumber >= viewerState.totalPageNumber && "disabled"}`} onClick={nextPage}>
        <RightArrow/>
      </div>
      <div className={`control-button-wrapper ${viewerState.pageNumber >= viewerState.totalPageNumber && "disabled"}`} onClick={endPage}>
        <DoubleRightArrow/>
      </div>
    </div>) || (totalPageNumber === 2 &&
      <PageToggleButton doubleSidedPrinting={doubleSidedPrinting} totalPageNumber={totalPageNumber}
                        pageNumber={pageNumber} setPage={setPage}/>)
  )
}
