import React, { useEffect, useState } from 'react'
import { t } from '$themelocalization'
import { UEditBox, XLIMTextAlign, UEditContentObject } from '@ustore/uedit'
import { Button, Icon, Dropdown, SelectorArrow } from '$core-components'
import UEditProvider from './ueditProvider'
import { AdorDropDown } from './AdorDropDown'
import { UEditDropDown } from './UEditDropDown'
import EditorTooltip from './EditorTooltip'
import ShapeControlsSection from './ShapeControlsSection'
import ColorSelector from './ColorSelector'

const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72].map(size => ({
    name: `${size} pt`,
    value: size,
}))

const TextControlsSection = ({ueditSelectedBoxId, uEditDisplayContentObjectList, locks, product, orderItem}) => {
    const leadings = [{name: t('UEdit.DropDown.Auto'), value: 'Auto'}, ...fontSizes]
    const [fontList, setFontList] = useState([])
    const [fontFaces, setFontFaces] = useState([])
    const [fontFamily, setFontFamily] = useState(null)
    const [fontFace, setFontFace] = useState(null)
    const [fontSize, setFontSize] = useState(fontSizes[0])
    const [leading, setLeading] = useState(leadings[0])
    const [selectedAdor, setSelectedAdor] = useState('')
    const isTextBox = UEditProvider.uEdit.getSelection()[0].type === UEditBox.eTypeText
    const [isTextEditStarted, setIsTextEditStarted] = useState(false)

    const onTextSelection = () => UEditProvider.saveTextSelection()
    const onDocumentTextSelection = () => document.getSelection().toString().length > 0 && onTextSelection()
    const onTextEditStarted = () => setIsTextEditStarted(true)
    const onTextSelected = () => {
        const selection = UEditProvider.uEdit.getTextSelection()
        UEditProvider.saveTextSelection()
        const affectiveTextProperties = UEditProvider.uEdit.getTextPropertiesOnRange(selection.start, selection.length)
        if (affectiveTextProperties) {
            const selectedFont = fontList.find(f => {
                return f.name === affectiveTextProperties.properties.fontDescriptor.fontFamily
            })
            if (selectedFont) {
                setFontFamily(selectedFont)
            }
        }
        if (selection.length > 0) {
            const marks = UEditProvider.uEdit.getSelection()[0].textContent?.getMarksInRange(selection.start, selection.length)
            const adorMarkers = marks.find(m => !!m.hasADOR)
            setSelectedAdor(adorMarkers?.ador || '')
        } else {
            setSelectedAdor('')
        }
    }

    useEffect(() => {
        if (!isTextBox) return
        const fonts = UEditProvider.getFontList().map(font => ({
            name: font.familyName,
            value: font.familyName,
            data: font,
        }))
        const faces = fonts[0]?.data?.font?.map(face => ({name: face.fontFace, value: face.fontFace}))
        setFontList(fonts)
        setFontFamily(fonts[0])
        setFontFaces(faces)
        setFontFace(faces[0])
        setIsTextEditStarted(false)
        const textProperties = UEditProvider.uEdit.getTextPropertiesOnRange(0)
        if (textProperties) {
            const {properties: {fontDescriptor, fontSize}} = textProperties

            setFontSize(fontSizes.find(({value}) => value === fontSize) || {name: `${fontSize} pt`, value: fontSize})
            setLeading(textProperties?.properties?.autoLeading ? leadings[0] :
                leadings.find(({value}) => value === textProperties?.properties.leading) || {
                    name: `${textProperties?.properties.leading} pt`,
                    value: textProperties?.properties.leading,
                })

            const currentFont = fonts.find(font => font.value === fontDescriptor?.fontFamily)
            const fontFaces = currentFont?.data?.font?.map(face => ({name: face.fontFace, value: face.fontFace}))
            const currentFontFace = fontFaces.find(face => face.value === fontDescriptor?.fontFace)
            setFontFamily(currentFont)
            setFontFaces(fontFaces)
            setFontFace(currentFontFace)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ueditSelectedBoxId])

    useEffect(() => {
        UEditProvider.registerEvent('textEditStarted.uEditStoreView.xmpie', onTextEditStarted)
        UEditProvider.registerEvent('userTextSelected.UEdit.data-api', onTextEditStarted)
        UEditProvider.registerEvent('textSelected.uEditStoreView.xmpie', onTextSelected)
        UEditProvider.registerEvent('userTextSelected.UEdit.data-api', onTextSelection)
        document.addEventListener('selectionchange', onDocumentTextSelection)

        return () => {
            UEditProvider.unregisterEvent('userTextSelected.UEdit.data-api', onTextEditStarted)
            UEditProvider.unregisterEvent('textEditStarted.uEditStoreView.xmpie', onTextEditStarted)
            UEditProvider.unregisterEvent('textSelected.uEditStoreView.xmpie', onTextSelected)
            UEditProvider.unregisterEvent('userTextSelected.UEdit.data-api', onTextSelection)
            document.removeEventListener('selectionchange', onDocumentTextSelection)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const changeFontFamily = (fontFamily) => {
        if (fontList.length === 0 || !fontFamily) return
        const faces = fontFamily?.data?.font?.map(face => ({name: face.fontFace, value: face.fontFace}))
        setFontFaces(faces)
        setFontFace(faces[0])
        UEditProvider.applyTextOverridesOnSelection({
            fontDescriptor: {
                fontFamily: fontFamily.value,
                fontFace: faces[0].value,
            },
        })
        setFontFamily(fontFamily)
    }

    const changeFontFace = (fontFace) => {
        setFontFace(fontFace)
        UEditProvider.applyTextOverridesOnSelection({
            fontDescriptor: {
                fontFamily: fontFamily.value,
                fontFace: fontFace.value,
            },
        })
    }

    const onFontSizeChange = (fontSize) => {
        setFontSize(fontSize)
        UEditProvider.applyTextOverridesOnSelection({fontSize: fontSize.value})
    }

    const onAdorChange = (ador) => {
        if (ador.value) {
            setSelectedAdor(ador.value)
            UEditProvider.applyTextADOROnTextSelection(ador.value)
        }
    }

    const onLeadingChange = (leading) => {
        if (leading.value === 'Auto') {
            UEditProvider.applyTextOverridesOnSelection({autoLeading: true})
        } else {
            UEditProvider.applyTextOverridesOnSelection({leading: parseFloat(leading.value), autoLeading: false})
        }
        setLeading(leading)
    }


    return <div className="text-section">
        <div className="line-wrapper">
            {uEditDisplayContentObjectList && isTextEditStarted && !locks.ADD_AND_REMOVE_CONTENT_OBJECTS_LOCKED &&
                <div className="ador-list">
                    <div className="dropdown-wrapper">
                        <AdorDropDown onChange={onAdorChange}
                                      filterBy={opt => opt.type !== UEditContentObject.eTypeImage && opt.type !== UEditContentObject.eTypeVisibility}
                                      selectedValue={selectedAdor}
                        />
                        <EditorTooltip width={220} text={`${t('UEdit.ContentObjectTooltip')}`}/>
                    </div>
                </div>}
        </div>
        {!locks.TEXT_ATTRIBUTES_LOCKED && <>
            <div className="icon-row-section">
                <div className="dropdown-wrapper">
                    <Dropdown customArrow={<SelectorArrow/>} items={fontList}
                              selectedValue={fontFamily}
                              onChange={(font) => changeFontFamily(font)}/>
                    <EditorTooltip width={120} text={`${t('UEdit.Font')}`}/>
                </div>
            </div>
            <div className="icon-row-section">
                <div className="font-face">
                    <div className="dropdown-wrapper">
                        <Dropdown customArrow={<SelectorArrow/>} items={fontFaces} selectedValue={fontFace}
                                  onChange={(fontFace) => changeFontFace(fontFace)}/>
                        <EditorTooltip width={120} text={`${t('UEdit.FontsType')}`}/>
                    </div>
                </div>
                <div className="font-size">
                    <div className="dropdown-wrapper">
                        <Icon name="uedit-file-size.svg" width="16px" height="41px" className="file-size-icon"/>
                        <UEditDropDown items={fontSizes} selectedValue={fontSize} onChange={onFontSizeChange}/>
                        <EditorTooltip width={120} text={`${t('UEdit.FontSize')}`}/>
                    </div>
                </div>
            </div>
            <div className="icon-row-section">
                <ColorSelector orderItem={orderItem} product={product} tooltip={t('UEdit.ColorPicker.TextTitle')} type="Text" icon="uEdit_color_text.svg"
                               iconWidth={16} iconHeight={16}/>
                <div className="leading-picker">
                    <Icon name="uedit-leading-icon.svg" width="24px" height="38px"/>
                    <div className="dropdown-wrapper">
                        <UEditDropDown items={leadings} selectedValue={leading} onChange={onLeadingChange}/>
                        <EditorTooltip width={120} text={`${t('UEdit.LineSpacing')}`}/>
                    </div>
                </div>
            </div>
            <div className="text-alignment">
                <div className="text-alignment-group">
                    <Button className="icon-btn" onClick={() => UEditProvider.align(XLIMTextAlign.eStart)}>
                        <Icon name="uedit-text-align-left.svg" width="38px" height="38px"/>
                        <EditorTooltip width={110} text={`${t('UEdit.LeftAlignment')}`}/>
                    </Button>
                    <Button className="icon-btn" onClick={() => UEditProvider.align(XLIMTextAlign.eCenter)}>
                        <Icon name="uedit-text-align-center.svg" width="38px" height="38px"/>
                        <EditorTooltip width={110} text={`${t('UEdit.CenterAlignment')}`}/>
                    </Button>
                    <Button className="icon-btn" onClick={() => UEditProvider.align(XLIMTextAlign.eEnd)}>
                        <Icon name="uedit-text-align-right.svg" width="38px" height="38px"/>
                        <EditorTooltip width={110} text={`${t('UEdit.RightAlignment')}`}/>
                    </Button>
                </div>
                <div className="text-alignment-group">
                    <Button className="icon-btn" onClick={() => UEditProvider.valign(XLIMTextAlign.eStart)}>
                        <Icon name="uedit-text-valign-top.svg" width="38px" height="38px"/>
                        <EditorTooltip width={110} text={`${t('UEdit.TopAlignment')}`}/>
                    </Button>
                    <Button className="icon-btn" onClick={() => UEditProvider.valign(XLIMTextAlign.eCenter)}>
                        <Icon name="uedit-text-valign-center.svg" width="38px" height="38px"/>
                        <EditorTooltip width={110} text={`${t('UEdit.MiddleAlignment')}`}/>
                    </Button>
                    <Button className="icon-btn" onClick={() => UEditProvider.valign(XLIMTextAlign.eEnd)}>
                        <Icon name="uedit-text-valign-bottom.svg" width="38px" height="38px"/>
                        <EditorTooltip width={110} text={`${t('UEdit.BottomAlignment')}`}/>
                    </Button>
                </div>
            </div>
            <div className="horizontal-line"/>
        </>}
        <ShapeControlsSection orderItem={orderItem} product={product} ueditSelectedBoxId={ueditSelectedBoxId}/>

    </div>
}

export default TextControlsSection
