import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import { t } from '$themelocalization'
import { ReactComponent as ErrorIcon } from '$assets/icons/error.svg'
import { ReactComponent as PencilIcon } from '$assets/icons/Dynamicproduct_section_edit.svg'
import { ReactComponent as TickIcon } from '$assets/icons/Dynamicproduct_section_complete.svg'
import sanitizeHTML from 'sanitize-html'

export const Section = forwardRef(({
  number, section, children, isOpen, setOpenSection,
  isLastSection, onNext, changed, sectionToScrollTo, sectionErrors, isHidden, sectionDescription
}, sectionRef) => {
  const sectionContentRef = useRef(null)
  const [hasBeenOpened, setHasBeenOpened] = useState(isOpen)
  const [hasChanged, setHasChanged] = useState(changed)

  const contentObserver = new MutationObserver(useCallback(() => {
    if (sectionContentRef.current && sectionContentRef.current?.style?.overflow !== 'hidden') {
      sectionContentRef.current.style.setProperty('max-height', (sectionContentRef.current.scrollHeight + 50) + 'px')
    }
  }, [sectionContentRef]))

  useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true)
      sectionContentRef.current.style.setProperty('max-height', (sectionContentRef.current.scrollHeight + 50) + 'px')
    } else {
      sectionContentRef.current.style.setProperty('overflow', 'hidden')
      sectionContentRef.current.style.setProperty('max-height', '0px')
    }
  }, [isOpen])

  useEffect(() => {
    setHasChanged(changed)
  }, [changed])

  useEffect(() => {
    contentObserver.observe(sectionContentRef.current, { childList: true, subtree: true, attributes: true })
    return () => contentObserver.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onHeaderClick = () => setOpenSection(isOpen ? -1 : number)
  const onHeaderKeyPress = (e) => e.key === 'Enter' && onHeaderClick()
  const transitionEnd = () => {
    if (isOpen) {
      sectionContentRef.current.style.setProperty('overflow', 'unset')
    }
  }
  const hasErrors = sectionErrors.reduce((r, err) => r || err, false)
  const sanitizedDescription = !!sectionDescription?.description && sanitizeHTML(sectionDescription?.description, {
    allowedClasses: { '*': ['*'] },
    allowedAttributes: { '*': ['*'] },
    parseStyleAttributes: false
  }).replace(/\n/g, ' ').trim()

  return (
    <>
      <div
        className={`section ${isOpen ? 'section-open' : ''} ${hasErrors ? 'section-error' : ''} ${isHidden ? 'hidden' : ''}`}
        ref={sectionRef}>
        <div className="section-header" onClick={onHeaderClick} onKeyDown={onHeaderKeyPress} tabIndex="0">
          <div className="section-title">
            <span className="section-title-id">{number + 1}.&nbsp;</span>
            <span className="section-title-text">
           {section.name === 'xmpie_product_properties' ? t('xmpie_product_properties') : section.name}</span>
          </div>
          {hasErrors && !isOpen && <ErrorIcon width="15px" height="15px"/>}
          {!hasErrors && hasBeenOpened && hasChanged && !isOpen &&
            <TickIcon className="section-tick-icon" height="20px" width="20px"/>}
          {!hasErrors && (!hasBeenOpened || !hasChanged) && !isOpen &&
            <PencilIcon className="section-pencil-icon" height="20px" width="20px"
                        title={t('DynamicProduct.Section.Edit')}/>}
        </div>
        {isOpen && sanitizedDescription &&
          <div className="section-description" dangerouslySetInnerHTML={{ __html: sanitizedDescription }}/>}
        <div className={`section-content`} ref={sectionContentRef} onTransitionEnd={transitionEnd}>
          {children}
          <div className="button button-primary" onClick={onNext} onKeyDown={(e) => e.key === 'Enter' && onNext()}
               tabIndex="0">{isLastSection ? t('DynamicForm.Continue') : t('DynamicForm.Done')}</div>
        </div>
      </div>
      {
        ((!isOpen && hasErrors)) &&
        <div className="section-error-msg">
          {t('product.validation_error')}
        </div>
      }
    </>
  )
})
