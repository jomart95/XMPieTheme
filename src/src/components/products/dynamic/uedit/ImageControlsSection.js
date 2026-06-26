import React, { useEffect, useState } from 'react'
import { Button, Icon, Dropdown, SelectorArrow } from '$core-components'
import UEditProvider from './ueditProvider'
import { AdorDropDown } from './AdorDropDown'
import { UEditContentObject, UEditImage, XLIMFittingMode } from '@ustore/uedit'
import { UStoreProvider } from '@ustore/core'
import Hashids from 'hashids'
import { t } from '$themelocalization'
import features from '$features'
import EditorTooltip from './EditorTooltip'
import './ImageControlsSection.scss'
import ShapeControlsSection from './ShapeControlsSection'

const percentList = [25, 50, 75, 90, 100, 110, 125, 150, 175, 200].map(i => ({ name: `${i}%`, value: i }))

function findClosest (numbers, target) {
  return numbers.reduce((closest, num) =>
    Math.abs(num - target) < Math.abs(closest - target) ? num : closest
  )
}

const withCustomProps = (WrappedComponent = {}) => {
  return (props) => {
    const regex = new RegExp(/[!$%^&*()+|~=`{}[\]:";'<>?,./]/, 'g')
    const id = props.id ? props.id.replace('root_', '').replace(regex, '') : 'null'
    const hashids = new Hashids(id)
    const hashedID = hashids.encode(1, 2, 3)

    const onDucChange = (value, errors = [], skipValidation = false) => {
      value = value || '__xmpie_error__'
      const newDucValue =  value === 'default' ? undefined : value
      const schemaErrors = !value && props.uiSchema['ui:errorMessages']
        ? Object.values(props.uiSchema['ui:errorMessages']).map((err) => err)
        : []
      const errSchema = { [props.id]: { __errors: [...schemaErrors, ...errors] } }
      props.onChange(props.id || value, newDucValue === '__xmpie__clear__' ? '' : newDucValue, errSchema, skipValidation)
    }

    return (
      <div className={`a${hashedID}`}>
        <WrappedComponent
          {...props}
          id={id}
          disabled={props.readonly}
          onChange={onDucChange}
        />
      </div>
    )
  }

}

const loadWidgets = () =>window.uStoreDucs?.reduce((r, duc) => ({ ...r, [duc.name]: withCustomProps(duc.component) }), {})
let WidgetComponent = loadWidgets()['gallerySelector']

const imageSelectorDefaultAssetProperty = {
  propertySchema: {
    custom: {
      validation: []
    }
  },
  uiSchema: {
    'ui:readonly': false,
    'ui:options': {
      custom: {
        allowedExtensions: ['JPG', 'JPEG', 'TIFF', 'TIF', 'PDF', 'PNG'],
        allowUpload: true,
        libraryAssetsAllowEditing: true,
      },
    }
  },
  required: false,
}

const ImageControlsSection = ({
  uEditDisplayContentObjectList,
  properties,
  ueditSelectedBoxId,
  locks,
  onChange,
  product,
  orderItem,
  customizationErrors
}) => {
  const items = Object.entries(UEditProvider.getOriginalMaterials().ImageResources)
    .filter((e => e[0].match(/.*\.(png|jpg|jpeg|gif|bmp)$/)))
    .map(([name, value]) => ({ name, value }))

  const fittingModes = [
    {
      name: t("UEdit.NoFitting"),
      value: XLIMFittingMode.eMaintainTransformation,
      description: t("UEdit.NoFitting"),
    },
    {
      name: t("UEdit.FIt&Center"),
      value: XLIMFittingMode.eProportionalAndCentered,
      description: t("UEdit.FIt&Center.Description")
    },
    {
      name: t("UEdit.StretchToFrame"),
      value: XLIMFittingMode.eFitContentToFrame,
      description:t("UEdit.StretchToFrame.Description")
    }
  ]

  const [width, setWidth] = React.useState(percentList.find(i => i.value === 100))
  const [height, setHeight] = React.useState(percentList.find(i => i.value === 100))
  const [linked, setLinked] = React.useState(true)
  const [widthSelectedText, setWidthSelectedText] = React.useState(null)
  const [heightSelectedText, setHeightSelectedText] = React.useState(null)
  const [selectedImage, setSelectedImage] = React.useState(null)
  const [selectedAdor, setSelectedAdor] = React.useState('')
  const [selectionProps, setSelectionProps] = React.useState(null)
  const [errors, setErrors] = React.useState([])
  const [fittingMode, setFittingMode] = useState(fittingModes[0])

  const defaultAssets =
    UEditProvider.getOriginalMaterials().ImageResources.filter(({Key}) => !/(^Assets\/)|(indx_.*)|\.eps$/i.test(Key)).map(item => ({
      AssetID: item.Key,
      DisplayName: item.DisplayName,
      FileName: item.DisplayName,
      IsUploaded: false,
      isUeditAsset: true,
      ModificationDate: new Date().toDateString(),
      ThumbnailUrl: item.Url
    }))

  useEffect(() => {
    UEditProvider.uEdit.getDocumentView().selection[0]?.imageContent?.listen('imageScaleTransform_propertyChanged.imagescaleTracking', (e) => {
      const imageScaleTransform = UEditProvider.uEdit.getDocumentView().selection[0]?.imageContent?.imageScaleTransform
      if (imageScaleTransform) {
        const wScaleValue = imageScaleTransform ? Math.round(imageScaleTransform[0] * 100) : 100
        const hScaleValue = imageScaleTransform ? Math.round(imageScaleTransform[3] * 100) : 100
        const correctedWidth = wScaleValue && findClosest(percentList.map(e => e.value), wScaleValue)
        const correctedHeight = findClosest(percentList.map(e => e.value), hScaleValue)

        setWidth(percentList.find(e => e.value === correctedWidth) || null)
        setHeight(percentList.find(e => e.value === correctedHeight) || null)
        setWidthSelectedText(`${correctedWidth}%`)
        setHeightSelectedText(`${correctedHeight}%`)
      }

      window.queueMicrotask(() => {
        UEditProvider.refreshFitImage()
      })
    })

    const setNoFittingAfterImageRisize = () => {
      const selection = UEditProvider.uEdit.getSelection()[0]
      if (selection instanceof UEditImage) {
        setFittingMode(fittingModes[0])
      }
    }

    window.addEventListener('startResizeUEditEvent', setNoFittingAfterImageRisize)

    const image = items.find(i => i.name === UEditProvider.uEdit.getDocumentView().selection[0]?.imageContent?.imageURLSource)
    setSelectedImage(image)

    return () => {
      if (UEditProvider.uEdit?.getDocumentView().selection[0]){
        UEditProvider.uEdit.getDocumentView().selection[0].imageContent?.unlisten('imageScaleTransform_propertyChanged.imagescaleTracking')
      }
      window.removeEventListener('startResizeUEditEvent', setNoFittingAfterImageRisize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const ducErrors = Object.keys(customizationErrors).find(key => key.includes(selectionProps?.custom?.id))
    if (ducErrors && !errors.length && customizationErrors[ducErrors]?.errors.length) {
      setErrors(customizationErrors[ducErrors].errors)
    }
  }, [selectionProps])

  useEffect(() => {
    const adorName = UEditProvider.getBoxSelection().imageContent?.adorName || ''
    const imageURLSource = UEditProvider.getBoxSelection().imageContent?.imageURLSource || ''
    setErrors([])

    if (adorName) {
      UEditProvider.setImageAdor(adorName)
      setSelectedAdor(adorName)
      setSelectionProps(Object.values(properties).find(p => p.custom.code === adorName))
      setSelectedImage(null)
    } else if (imageURLSource) {
      setSelectedAdor(null)
      setSelectionProps(null)
      setSelectedImage(defaultAssets.find(i => i.AssetID === imageURLSource) || {
        AssetID: imageURLSource
      })
    } else {
      setSelectionProps(null)
      setSelectedImage(null)
      setSelectedAdor('')
    }
    updateFittingMode()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ueditSelectedBoxId, properties])

  const onWidthChange = (item) => {
    UEditProvider.uEdit.getDocumentView().selection[0].width *= item.value / 100
    if (linked) {
      UEditProvider.uEdit.getDocumentView().selection[0].height *= item.value / 100
    }
    UEditProvider.refreshFitImage()
  }

  const updateFittingMode = () => {
    const imageFittingMode = UEditProvider?.uEdit?.getSelection()[0]?.imageContent?.fittingMode
    if (imageFittingMode && imageFittingMode !== fittingMode.value) {
      setFittingMode(fittingModes.find(mode => mode.value === imageFittingMode) || fittingModes[0])
    }
  }

  const onHeightChange = (item) => {
    UEditProvider.uEdit.getDocumentView().selection[0].height *= item.value / 100
    if (linked) {
      UEditProvider.uEdit.getDocumentView().selection[0].width *= item.value / 100
    }
    UEditProvider.refreshFitImage()
  }

  const onGalleryChange = async (assetId, propValue, errs) => {
    if (propValue === '') {
      UEditProvider.setImage({ name: null })
      setSelectedImage(null)
      setSelectedAdor('')
      return
    }

    const selectionErrors = errs ? Object.values(errs).flatMap(v => v.__errors) : []
    if (selectionErrors.length > 0) {
      setErrors(selectionErrors)
      return
    }
    setErrors([])
    const image =  await window.UStoreProvider.state.assets.getAsset(propValue.replace('Assets/', ''))
    setSelectedImage(image)
    UEditProvider.setImageAction({ ...image, AssetID: `Assets/${propValue}` })
    if (selectionProps) {
      onChange(selectionProps.id, propValue, errors)
    }
    setFittingMode({
      name: t("UEdit.FIt&Center"),
      value: XLIMFittingMode.eProportionalAndCentered
    })
  }

  const onFittingChange = (mode) => {
    setFittingMode(mode)
    UEditProvider.fitImage(mode)
  }

  if (!WidgetComponent) {
    WidgetComponent = loadWidgets()['gallerySelector']
  }



  return <div className="image-section">
    {uEditDisplayContentObjectList && (!locks.ADD_AND_REMOVE_CONTENT_OBJECTS_LOCKED && !locks.REPLACE_CONTENT_LOCKED) &&
        <div className="ador-list">
          <div className="dropdown-wrapper">
            <AdorDropDown filterBy={opt => opt.type === UEditContentObject.eTypeImage}
                          onChange={(value) => {
                            setSelectionProps(Object.values(properties).find(p => p.custom.code === value.name))
                            UEditProvider.setImageAdor(value.value)
                            setSelectedAdor(value.value)
                            setSelectedImage(null)
                          }}
                          selectedValue={selectedAdor}/>
            <EditorTooltip width={220} text={`${t('UEdit.ContentObjectTooltip')}`}/>
          </div>
        </div>}
    {!locks.REPLACE_CONTENT_LOCKED && (properties[selectionProps?.id] || !selectedAdor) &&
        <div className={`duc-wrapper ${errors && errors.length ? 'errors' : ''}`}>
          <div className="image-controls-row image-gallery-duc">
            <WidgetComponent
                features={features}
                formContext={{UStoreProvider, defaultAssets, noProps: true}}
                id={selectionProps?.custom?.id || ''}
                onChange={onGalleryChange}
                onBlur={() => {
                }}
                additionalCropperClass={'cropper-wrapper'}
                options={(selectionProps || imageSelectorDefaultAssetProperty).uiSchema['ui:options']}
                readonly={(selectionProps || imageSelectorDefaultAssetProperty).uiSchema['ui:readonly']}
                required={(selectionProps || imageSelectorDefaultAssetProperty).required}
                schema={(selectionProps || imageSelectorDefaultAssetProperty).propertySchema}
                t={t}
                uiSchema={(selectionProps || imageSelectorDefaultAssetProperty).uiSchema}
                value={(selectedAdor && selectionProps?.value) || selectedImage?.AssetID?.replace('Assets/', '') || ''}
            />
            {errors.length > 0 && errors.map((error, idx) => (
                <div className="duc-error" key={idx}>
                  <div className="error-text">{error}</div>
                </div>
            ))}
          </div>
        </div>}
    <div className="image-controls-row">
      <div className="width-height-controls">
        <div className="image-controls-row">
          <label>{t('UEdit.ImageControlSection.Width')}</label>
          <Dropdown customArrow={<SelectorArrow/>} items={percentList} selectedValue={width} onChange={onWidthChange}
                    selectedText={widthSelectedText}/>
        </div>
        <div className="image-controls-row">
          <label>{t('UEdit.ImageControlSection.Height')}</label>
          <Dropdown customArrow={<SelectorArrow/>} items={percentList} selectedValue={height} onChange={onHeightChange}
                    selectedText={heightSelectedText}/>
        </div>
      </div>
      <div className="lock-aspect-ratio">
        <Button onClick={() => setLinked(!linked)}>
          {!linked ? <Icon name="uedit-unlink.svg" width="24px" height="24px"/> :
            <Icon name="uedit-link.svg" width="32px" height="52px"/>}
          {linked ? <EditorTooltip width={200} text={`${t('UEdit.Locked')}`}/> :
              <EditorTooltip width={200} text={`${t('UEdit.Unlocked')}`}/>}
        </Button>
      </div>
    </div>
    <div className="image-controls-row fitting">
      <label>{t('UEdit.ImageControlSection.Fitting')}</label>
      <div className="dropdown-wrapper">
        <Dropdown customArrow={<SelectorArrow/>} items={fittingModes} selectedValue={fittingMode} onChange={onFittingChange}/>
        <EditorTooltip width={150} text={fittingMode.description}/>
      </div>
    </div>
    <div className="horizontal-line"/>
    <ShapeControlsSection orderItem={orderItem} product={product} ueditSelectedBoxId={ueditSelectedBoxId}/>
  </div>

}

export default React.memo(ImageControlsSection)
