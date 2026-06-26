import {
  UEditBox,
  UEditText,
  XLIMColor,
  UXLIMAttribute,
  UEditTextProperties,
  UEditParagraphProperties,
  XLIMTextAlign,
  UEditBoxView,
  UEditImageView,
  UEditImage,
  XLIMFittingMode, UEditContentObject, LockFlags,
} from '@ustore/uedit'
import {  prependServerDomain } from '$themeservices'
import { UStoreProvider } from '@ustore/core'
import { debounce } from 'throttle-debounce'

const zoomStepsLimitation = 4

export class UEditProvider {

  constructor () {
    this._uEdit = null
    this._sections = { Text: false, Image: false }
    this._element = null
    this._loading = false
    this._savedSelection = null
    this._originalMaterials = { ImageResources: [], Fonts: [] }
    this._allowedAdors = {}
    this._locks = {}
    this._mZoomMin = 1
    this._zoomStep = 0
    this._setImageAction = false
    this._hexColorList = []
    this._undoStack = []
    this._redoStack = []
    this._currentUndoRedoState = null
    this._isUndoRedoTransactionLocked = true
    this._isUndoRedoTransactionTempLocked = false
  }

  set element (element) {
    this._element = element
  }

  get element () {
    return this._element
  }

  set uEdit (uEdit) {
    this._uEdit = uEdit
  }

  get uEdit () {
    return this._uEdit
  }

  get sections () {
    return this._sections
  }

  set sections (value) {
    this._sections = value
  }

  get allowedAdors () {
    return this._allowedAdors
  }

  set allowedAdors (value) {
    this._allowedAdors = value
  }

  get canZoomIn () {
    return this._zoomStep < zoomStepsLimitation
  }

  get canZoomOut () {
    return this._zoomStep > 0
  }

  get canUndo () {
    return this._undoStack.length > 1 || this._setImageAction
  }

  get canRedo () {
    return this._redoStack.length
  }

  get currentUndoRedoState () {
    return this._currentUndoRedoState
  }

  set currentUndoRedoState (newState) {
    this._currentUndoRedoState = newState
  }

  get isUndoRedoTransactionLocked () {
    return this._isUndoRedoTransactionLocked
  }

  set isUndoRedoTransactionLocked (value) {
    this._isUndoRedoTransactionLocked = value
  }

  get isUndoRedoTransactionTempLocked () {
    return this._isUndoRedoTransactionTempLocked
  }

  set isUndoRedoTransactionTempLocked (value) {
    this._isUndoRedoTransactionTempLocked = value
  }

  get locks () {
    return this._locks
  }

  get hexColorList () {
    return this._hexColorList
  }

  get fullyLocked () {
    if (this.uEdit?.getSelection()[0]?.type === UEditBox.eTypeText) {
      return this.locks.BACKGROUND_COLOR_LOCKED &&
          this.locks.STROKE_COLOR_LOCKED &&
          this.locks.STROKE_WEIGHT_LOCKED &&
          this.locks.TEXT_ATTRIBUTES_LOCKED
    }
    return false
  }

  dispose = () => {
    this._uEdit = null
    this._sections = { Text: false, Image: false }
    this._element = null
    this._loading = false
    this._originalMaterials = null
    this._setImageAction = false
    this._hexColorList = []
    this._undoStack = []
    this._redoStack = []
  }

  loadDocument = async (url) => {
    if (this._loading) {
      return
    }
    this._loading = true
    const res = await fetch(prependServerDomain(url))
    const doc = await res.text()
    this.uEdit.setupFromXLIM(doc)

    const regex = /<fo:external-graphic[\s\S]*?src="url\((Assets\/[^)]+)\)/igm
    const matches = doc.matchAll(regex)
    const images = []
    for (const match of matches) {
      if (match[1].includes('Assets/')) {
        const image = match[1]
        const asset = await UStoreProvider.state.assets.getAsset(image.replace('Assets/', ''))
        this.addImageMapping(image, prependServerDomain(asset.LowResolutionUrl))
      }
    }
    this.uEdit.showPreviewValues()

    this.uEdit.setupFromXLIM(doc, true)
    this._hexColorList =  getUsedColors(this.uEdit.getDocument().swatchList.mCustomSwatches, doc)
    return images
  }

  setInitialScale () {
    this._mZoomMin = this.uEdit.zoom()
  }

  loadAssets = async (product) => {
    const { ImageResources, Fonts } = await UStoreProvider.api.products.getDocumentMaterials(product.ID)
    this._originalMaterials = { ImageResources, Fonts }
    this._originalMaterials.ImageResources.forEach(({ Key, Url }) => this.addImageMapping(Key, prependServerDomain(Url)))

    Fonts.forEach(({ Face, Family, Url }) => {
      const cssFontFamily = `${Family} ${Face}`
      this.addFontMapping({ fontFamily: Family, fontFace: Face },
        { fontFamily: cssFontFamily, fontFace: { fontFamily: cssFontFamily, src: `${prependServerDomain(Url)}&uedit=.` } })
    })
  }

  pushAdorValues = (adorNameAndValue) => {
    if (!this.uEdit) {
      return
    }
    const adorImageMappings = this.uEdit.getContent()?.contentObjectsList?.filter(obj => obj.type === UEditContentObject.eTypeImage)?.reduce((acc, obj) => {
      this.addImageMapping(obj.name, adorNameAndValue[obj.name]?.toLowerCase().indexOf('/ustorerestapi/') > -1 ? prependServerDomain(adorNameAndValue[obj.name]) : adorNameAndValue[obj.name])
      return { ...acc, [obj.name]: obj.name }
    }, {})
    this.uEdit.getPreviewValuesObject().values.unshift({ ...adorNameAndValue, ...adorImageMappings })
    this.uEdit.showPreviewValues()
  }

  addFontMapping = (font, css) => this.uEdit.addFontMapping(font, { css })

  addImageMapping = (name, url) => this.uEdit.addImageMapping(name, url)

  pushUndoStack = debounce(100, (newStack, force, onUndoRedoChange) => {
    if (((this.isUndoRedoTransactionLocked || this.isUndoRedoTransactionTempLocked) && !force)
        || newStack === this._undoStack[this._undoStack.length - 1]) return
    this._undoStack.push(newStack)
    this.currentUndoRedoState = newStack
    this._redoStack = []
    onUndoRedoChange && onUndoRedoChange()
  })

  undo = () => {
    if (this.canUndo && !this.isUndoRedoTransactionTempLocked) {
      this._redoStack.push(this._undoStack.pop())
      this.isUndoRedoTransactionTempLocked = true
      this.uEdit.setupFromXLIM(this._undoStack[this._undoStack.length - 1], true)
      this.uEdit.showPreviewValues()
    }
  }

  redo = () => {
    if (this.canRedo && !this.isUndoRedoTransactionTempLocked) {
      this._undoStack.push(this._redoStack.pop())
      this.isUndoRedoTransactionTempLocked = true
      this.uEdit.setupFromXLIM(this._undoStack[this._undoStack.length - 1], true)
      this.uEdit.showPreviewValues()
    }
  }

  clearStack = () => {
    this._undoStack = []
    this._redoStack = []
    this.pushUndoStack(this.getXLIM(), true)
  }


  setNewBoxSize = (newBox) => {
    const { pageHeight, pageWidth } = this.uEdit.getDocument().getPages()[this.uEdit.getPageInView()].parent.master
    const newBoxSide = Math.min(pageHeight, pageWidth) * 0.25
    if (newBox.type === 3) {
      newBox.x1 = 0
      newBox.x2 = newBoxSide
      newBox.y1 = 0
      newBox.y2 = newBoxSide
    }
    newBox.width = newBoxSide
    newBox.height = newBoxSide
  }

  addText = () => {
    const newBox = new UEditBox()
    newBox.type = UEditBox.eTypeText
    this.uEdit.getUndoService().pushUndoTransaction('add text box')
    if (this.attachNewBoxToCurrentPage(newBox)) {
      const newText = new UEditText()
      const font = this.getFontList(this.uEdit)[0]
      newText.textProperties.fontDescriptor = {
        fontFamily: font.familyName,
        fontFace: font.font[0].fontFace
      }
      newText.textProperties.fontSize = 16
      newText.paragraphProperties.textAlign = XLIMTextAlign.eStart
      this.uEdit.getDocument().appendText(newText)
      newText.appendFrame(newBox)
      this.uEdit.focusOnBox(newBox, true)
      this.uEdit.select(newBox)
      this.uEdit.getDocumentView().startTextEditModeOnSelection()
    }
    this.uEdit.getUndoService().popUndoTransaction()
  }

  addImage = () => {
    // create a new box
    const newBox = new UEditBox()
    newBox.type = UEditBox.eTypeGraphic
    this.uEdit.getUndoService().pushUndoTransaction('add graphic box')
    if (this.attachNewBoxToCurrentPage(newBox) && !newBox.isInline()) {
      this.uEdit.focusOnBox(newBox, true)
      this.uEdit.select(newBox)
    }
    this.uEdit.getUndoService().popUndoTransaction()
  }

  addLine = () => {
    const newBox = new UEditBox()
    this.setNewBoxSize(newBox)
    newBox.type = UEditBox.eTypeLine
    var theDocument = this.uEdit.getDocument()
    newBox.lineWeight = 1
    newBox.lineColor = theDocument.swatchList.findSwatchByID(XLIMColor.eBlackID)

    newBox.layer = this.getTopVisibleLayer(theDocument)

    if (this.uEdit.getPageViewData(theDocument.getPages()[this.uEdit.getActualPageInView()]).attachBox(newBox)) {
      this.uEdit.focusOnBox(newBox, true)
      this.uEdit.select(newBox)
    }
  }

  zoomAndCenter = (inZoomValue) => {
    this.uEdit.zoom(inZoomValue)
  }

  clearZoomSteps = () => {
    this._zoomStep = 0
  }

  zoomIn = () => {
    this.zoomAndCenter(this.uEdit.zoom() + 0.25)
    this._zoomStep += 1
  }

  zoomOut = () => {
    this.zoomAndCenter(this.uEdit.zoom() - 0.25)
    this._zoomStep -= 1
  }

  deleteSelection = () => this.uEdit.removeBoxOfSelection()

  saveTextSelection = () => this._savedSelection = this.uEdit.getTextSelection()

  clearSavedTextSelection = () => this._savedSelection = null

  fitToPage = () => this.uEdit.fitToPage()

  getBoxSelection = () => {
    const selection = this.uEdit.getSelection()

    if (selection?.length === 0) {
      return null
    }

    if (selection[0] instanceof UEditBox) {
      return selection[0]
    }

    return selection[0].parent
  }

  setShapeBackgroundColor = (color) => {
    const selection = this.getBoxSelection()
    this.uEdit.getUndoService().pushUndoTransaction('set background color')
    if (color === null && selection) {
      this.uEdit.getSelectionViewData().setProperty('backgroundColor', color)
      return
    }
    const rgbColor = new XLIMColor(UXLIMAttribute.eColor, toRGB(color), false)
    const swatch = this.uEdit.getDocument().swatchList.findOrCreateSwatchFromColors(rgbColor, null)
    if (selection && color) {
      const selectionViewData = this.uEdit.getSelectionViewData()
      if (selectionViewData instanceof UEditBoxView) {
        this.uEdit.getSelectionViewData().setProperty('backgroundColor', swatch)
      } else {
        this.uEdit.getSelectionViewData().$mBoxView.data('UEditBoxView').setProperty('backgroundColor', swatch)
      }
    }
    this.uEdit.getUndoService().popUndoTransaction()
  }

  setLineColor = (color, lockPushUndoRedo) => {
    const selection = this.getBoxSelection()
    !lockPushUndoRedo && this.uEdit.getUndoService().pushUndoTransaction('set line color')
    if (color === null && selection) {
      if (selection.type === UEditBox.eTypeLine) {
        this.uEdit.getSelectionViewData().setProperty('lineColor', color)
      }
      this.uEdit.getSelectionViewData().setProperty('borderColor', color)
      return
    }
    const rgbColor = new XLIMColor(UXLIMAttribute.eColor, toRGB(color), false)
    const swatch = this.uEdit.getDocument().swatchList.findOrCreateSwatchFromColors(rgbColor, null)
    if (selection) {
      selection.borderShade = 100
      if (selection.type === UEditBox.eTypeLine) {
        this.uEdit.getSelectionViewData().setProperty('lineColor', swatch)
      }
      this.uEdit.getSelectionViewData().setProperty('borderColor', swatch)
    }
    !lockPushUndoRedo && this.uEdit.getUndoService().popUndoTransaction()
  }

  setLineWidth = (width, lockPushUndoRedo) => {
    const selection = this.getBoxSelection()
    !lockPushUndoRedo && this.uEdit.getUndoService().pushUndoTransaction('set line width')
    if (selection) {
      if (selection.type === UEditBox.eTypeLine) {
        this.uEdit.getSelectionViewData().setProperty('lineWeight', width)
        return
      }
      this.uEdit.getSelectionViewData().setProperty('borderWeight', width)
    }
    !lockPushUndoRedo && this.uEdit.getUndoService().popUndoTransaction()
  }

  bringToFront = () => {
    this.uEdit.getUndoService().pushUndoTransaction('bring to front')
    this.getBoxSelection()?.bringToFront()
    this.uEdit.getUndoService().popUndoTransaction()
  }

  bringForward = () => {
    this.uEdit.getUndoService().pushUndoTransaction('bring forward')
    this.getBoxSelection()?.bringForward()
    this.uEdit.getUndoService().popUndoTransaction()
  }

  sendBackward = () => {
    this.uEdit.getUndoService().pushUndoTransaction('send backward')
    this.getBoxSelection()?.sendBackward()
    this.uEdit.getUndoService().popUndoTransaction()
  }

  sendToBack = () => {
    this.uEdit.getUndoService().pushUndoTransaction('send to back')
    this.getBoxSelection()?.sendToBack()
    this.uEdit.getUndoService().popUndoTransaction()
  }

  getShapeProps = () => {
    const selectedBox = this.uEdit.getSelectionViewData().getBox()
    if (selectedBox) {
      const result = {}
      const rgbFill = selectedBox.backgroundColor?.rgb()?.seps()
      result.fillColor = rgbFill ? rgbToHex(...rgbFill) : null
      if (selectedBox.type === UEditBox.eTypeLine) {
        const rgbLine = selectedBox.lineColor?.rgb()?.seps()
        result.lineColor = rgbLine ? rgbToHex(...rgbLine) : null
        result.lineWidth = selectedBox.lineWeight
      } else {
        result.lineColor = selectedBox.borderColor?.rgb()?.seps()
        result.lineWidth = selectedBox.borderWeight
      }

      return result

    }
  }

  setViewMode = (mode) => {
    this.uEdit.setViewMode(mode)
    this.uEdit.highlightDynamicObjects(mode === 'normal')
  }

  getFontList = () => {
    const fonts = this.uEdit.getDocumentView().fontRepository.fonts
    const missingDocumentFonts = this.uEdit.getDocumentView().calculateDocumentMissingFonts()
    return Object.entries(fonts).filter(([familyName, font]) =>
      !missingDocumentFonts[familyName] && this.uEdit.getDocumentView().fontRepository.doesHaveUsableFaces(familyName))
      .map(([familyName, font]) => ({ familyName, font }))
  }

  applyTextOverridesOnSelection = (overrides) => {
    if (this._savedSelection) {
      this.uEdit.selectText(this._savedSelection.start, this._savedSelection.length)
    }
    const tp = new UEditTextProperties()
    for (const key in overrides) {
      if (key === 'color') {
        const rgbColor = new XLIMColor(UXLIMAttribute.eColor, toRGB(overrides['color']), false)
        tp[key] = this.uEdit.getDocument().swatchList.findOrCreateSwatchFromColors(rgbColor, null)
      } else {
        tp[key] = overrides[key]
      }
    }
    this.uEdit.applyTextOverridesOnSelection(tp)
  }

  align = (align) => {
    if (this._savedSelection) {
      this.uEdit.selectText(this._savedSelection.start, this._savedSelection.length)
    }
    const pp = new UEditParagraphProperties()
    pp.textAlign = align
    if (pp.textAlign === XLIMTextAlign.eJustify) {
      pp.textAlignLast = XLIMTextAlign.eJustify
    }
    this.uEdit.applyParagraphPropertiesOnSelection(pp)
  }

  valign = (align) => {
    const box = this.getBoxSelection()
    if (box) {
      this.uEdit.getUndoService().pushUndoTransaction('valign')
      box.verticalTextAlignment = align
      this.uEdit.getUndoService().popUndoTransaction()
    }
  }

  getPageCount = () => {
    return this.uEdit.getDocument()?.getPages()?.length
  }

  getPageInView = () => this.uEdit.getPageInView()

  attachNewBoxToCurrentPage = (inBox) => {
    const theDocument = this.uEdit.getDocument()
    this.setNewBoxSize(inBox)

    if (this.uEdit.isEditingText()) {
      this.uEdit.insertInlineBoxInSelection(inBox)
      return true
    } else if (this.uEdit.getPageViewData(theDocument.getPages()[this.uEdit.getActualPageInView()]).attachBox(inBox)) {
      // regular graphic box
      inBox.left = 0
      inBox.top = 0
      inBox.layer = this.getTopVisibleLayer(theDocument)
      return true
    } else
      return false
  }

  getTopVisibleLayer = (inDocument) => {
    let result = null

    for (let i = inDocument.layers.length - 1; i >= 0 && !result; --i) {
      if (inDocument.layers[i].visible)
        result = inDocument.layers[i]
    }
    return result
  }

  clearSelection = () => this.uEdit.getDocumentView().select(null)

  getImageList = () => this.uEdit.getDocumentView().images

  getOriginalMaterials = () => this._originalMaterials

  setImageAction = (image) => {
    this.addImageMapping(image.AssetID, prependServerDomain(image.LowResolutionUrl))
    this.getOriginalMaterials().ImageResources.push({
      Key: image.AssetID,
      DisplayName: image.DisplayName,
      Url: prependServerDomain(image.ThumbnailUrl)
    })
    this.setImage({ name: image.AssetID, url: image.LowResolutionUrl })
    this._setImageAction = true
  }

  setImage = ({ name, url }) => {
    const selection = this.getBoxSelection()
    if (selection) {
      this.uEdit.getUndoService().pushUndoTransaction('set image')
      if (!selection.imageContent) {
        this.uEdit.getSelectionViewData().setProperty('imageContent', new UEditImage(selection))
      }
      const imageView = this.getSelectionImageViewData()
      const img = imageView.$element[0].querySelector('img')
      img.onload = () => {
        const checkRenderedImageSize = setInterval(() => {
          const imageRect = img.getBoundingClientRect()
          if (imageRect.width > 0 && imageRect.height > 0) {
            this.fitImage({value: imageView.mImage.fittingMode || XLIMFittingMode.eProportionalAndCentered})
            this.refreshFitImage()
            clearInterval(checkRenderedImageSize)
          }
        }, 50)
      }
      imageView.setProperty('imageURLSource', name)
    }
    this.uEdit.getUndoService().popUndoTransaction()
  }

  setImageAdor = (adorName) => {
    const selection = this.getBoxSelection()
    if (selection && selection.type === UEditBox.eTypeGraphic) {
      const hasImageContent = selection.imageContent

      !selection.imageContent && this.uEdit.getUndoService().pushUndoTransaction('set image content')
      if (!selection.imageContent)
        this.uEdit.getSelectionViewData().setProperty('imageContent', new UEditImage(selection))
      if (selection.imageContent) {
        var imageView = this.getSelectionImageViewData()
        if (imageView.canSetProperty('adorName', adorName)) {
          /*
              the behavior here is that if there is an ADOR name to be set
              the the image with this ADOR value, and create an image object if needed.
              if the selected value is empty, destroy the image object, and present an empty graphic box.
          */

          if (adorName === '') {
            this.uEdit.getSelectionViewData().setProperty('imageContent', null)
          } else {
            imageView.mImage.imageURLSource !== adorName &&  imageView.setProperty('imageURLSource', adorName)

            // important! fitting mode is set BEFORE ador name, to avoid
            // racing conditions in loading an image and trying to fit to it (which)
            // may end up fitting to the old image.
            // setting fitting before ADOR will be a null action, and later when ADOR is set
            // the fitting will kick in once image is loaded
            if (hasImageContent) {
              if (!selection.imageContent.fittingMode) {
                imageView.setProperty('fittingMode', XLIMFittingMode.eFitContentToFrame)
              }
            } else {
              imageView.fitContentToFrame()
              imageView.setProperty('fittingMode', XLIMFittingMode.eFitContentToFrame)
            }
            imageView.setProperty('adorName', adorName)
          }
        }
        !selection.imageContent && this.uEdit.getUndoService().popUndoTransaction()
      }
    }
  }

  getSelectionImageViewData = () => {
    const selectionView = this.uEdit.getSelectionViewData()
    if (selectionView) {
      let imageViewData = null
      if (selectionView instanceof UEditBoxView) {
        const $imageView = selectionView.$element.find('.UEdit-image-view')
        if ($imageView.length !== 0)
          imageViewData = $imageView.data('UEditImageView')
      } else if (selectionView instanceof UEditImageView) {
        imageViewData = selectionView
      }

      return imageViewData
    } else
      return null
  }

  clearTransformation (needReset = false) {
    const imageView = this.getSelectionImageViewData()
    imageView.mImage.transformation = [1,0,0,1,0,0]
  }

  fitImage = (mode) => {
    const imageView = this.getSelectionImageViewData()
    if (imageView) {
      switch (mode.value) {
        case XLIMFittingMode.eMaintainTransformation:
          this.uEdit.getUndoService().pushUndoTransaction('remove fitting')
          imageView.setProperty('fittingMode', XLIMFittingMode.eMaintainTransformation)
          break
        case XLIMFittingMode.eProportionalAndCentered:
          this.clearTransformation()
          imageView.setProperty('fittingMode', XLIMFittingMode.eProportionalAndCentered)
          this.uEdit.getUndoService().pushUndoTransaction('fit proportionally and center')
          break
        case XLIMFittingMode.eFitContentToFrame:
          imageView.setProperty('fittingMode', XLIMFittingMode.eFitContentToFrame)
          this.uEdit.getUndoService().pushUndoTransaction('fit content to frame')
          break
        default: break
      }
      this.uEdit.getPreview().applyImageViewFitting(imageView)
      this.uEdit.getUndoService().popUndoTransaction()
    }
  }

  refreshFitImage = () => {
    const imageView = this.getSelectionImageViewData()
    if (imageView?.mImage && imageView.mImage.adorName) {
      imageView.saveRefPointAndScaleInImage()
      this.uEdit.getPreview().applyImageViewFitting(imageView)
    }
  }

  setLocks = () => {
    const lockLogic = this.uEdit.getLockLogic()
    const selection = this.uEdit.getSelection()[0]
    const lockKeys = ['kBoxDelete', 'kStrokeWeight', 'kStrokeColor', 'kBackgroundColor', 'kText', 'kTextAttributes', 'kAddContentObjects', 'kRemoveContentObjects']
    const locksSum = lockKeys.reduce((sum, elem) => {
      if (lockLogic.isLockedFor(selection, LockFlags[elem])) {
        return sum + LockFlags[elem]
      }
      return sum
    }, 0)
    const selectionFullLocks = selection.lockFlags
    this._locks = {
      DELETE_LOCKED: lockLogic.isLockedFor(selection, LockFlags.kBoxDelete),
      STROKE_WEIGHT_LOCKED: lockLogic.isLockedFor(selection, LockFlags.kStrokeWeight),
      STROKE_COLOR_LOCKED: lockLogic.isLockedFor(selection, LockFlags.kStrokeColor),
      BACKGROUND_COLOR_LOCKED: lockLogic.isLockedFor(selection, LockFlags.kBackgroundColor),
      TEXT_LOCKED: lockLogic.isLockedFor(selection, LockFlags.kText),
      TEXT_ATTRIBUTES_LOCKED: lockLogic.isLockedFor(selection, LockFlags.kTextAttributes),
      ADD_AND_REMOVE_CONTENT_OBJECTS_LOCKED: lockLogic.isLockedFor(selection, LockFlags.kAddContentObjects) || lockLogic.isLockedFor(selection, LockFlags.kRemoveContentObjects),
      REPLACE_CONTENT_LOCKED: (selectionFullLocks && selectionFullLocks - locksSum === LockFlags.kGraphic) || false
    }
  }
  checkIfAddAndDeleteFunctionalityLocked () {
    const lockLogic = this.uEdit?.getLockLogic()
    if (lockLogic) {
      const layer = this?.uEdit?.getDocument()?.spreads[0]
      return lockLogic.isLockedFor(layer, LockFlags['kBoxCreate']) && lockLogic.isLockedFor(layer, LockFlags['kBoxDelete'])
    }
    return false
  }

  getXLIM = () => this.uEdit.writeToXLIM(true)

  getAdorsList = () => {
    const adorsInDoc = this.uEdit
      .getContent()?.contentObjectsList
      .filter(item => item.name.length)
      .reduce((acc, obj) => ({ ...acc, [obj.name]: { name: obj.name, value: obj.name, type: obj.type } }), {})

    const allowedAdors = Object.entries(this.allowedAdors)
      .filter(([name, type]) => type === 'gallerySelector')
      .reduce((acc, [name]) => ({
        ...acc,
        [name]: { name: name, value: name, type: UEditContentObject.eTypeImage }
      }), {})

    return Object.values({ ...allowedAdors, ...adorsInDoc })
  }

  applyTextADOROnTextSelection = (adorName) => this.uEdit.applyTextADOROnTextSelection(adorName)

  registerEvent = (event, callback) => this.uEdit?.registerEvent(this._element, event, callback)
  unregisterEvent = (event, callback) => this.uEdit?.unregisterEvent(this._element, event, callback)
}

const uEditProvider = new UEditProvider()
export default uEditProvider

const toRGB = rgbStr => {
  const rgb = Number(rgbStr?.replace('#', '0x'))
  return [(rgb & 0xff0000) >> 16,
    (rgb & 0x00ff00) >> 8,
    (rgb & 0x0000ff)].map(x => (x / 255) * 100)
}

const rgbToHex = (r, g, b) => {
  const toHex = x => Math.round(x * 2.55).toString(16).padStart(2, '0');
  return '#' + [r, g, b].map(toHex).join('');
}

const getUsedColors = (colors, doc) => {
  const regex = /(border-color|background-color|color)="id\(#([^"]+)\)"/g
  let ids = new Set()
  let match
  while ((match = regex.exec(doc)) !== null) {
    ids.add(match[2].toUpperCase())
  }
  const recommendedColors = colors
      .filter(color => Array.from(ids).includes(color.mID.toString(16).toUpperCase()))
      .filter(color => color.mRGB?.mSeps)
      .map(color => rgbToHex(...color.mRGB?.mSeps))
      .filter(color => color.toUpperCase() !== '#000000' && color.toUpperCase() !== '#FFFFFF')
  const unUsedColors = colors
      .filter(color => color.mRGB?.mSeps)
      .map(color => rgbToHex(...color.mRGB?.mSeps))
      .filter(color => !recommendedColors.includes(color) && color.toUpperCase() !== '#000000' && color.toUpperCase() !== '#FFFFFF')

  return ['#000000', '#FFFFFF', ...recommendedColors, ...unUsedColors]
}
