import React, { useEffect, useRef, useState } from 'react'
import sanitizeHTML from 'sanitize-html'
import { Section } from './Section'
import { Icon } from '$core-components'
import features from '$features'
import Hashids from 'hashids'
import { UStoreProvider } from '@ustore/core'
import { t } from '$themelocalization'
import { productTypes } from '$themeservices'
import './DynamicForm.scss'

const withCustomProps = (WrappedComponent = {}) => {
  class ConnectedComponent extends React.Component {
    constructor (props) {
      super(props)
      const regex = new RegExp(/[!$%^&*()+|~=`{}[\]:";'<>?,./]/, 'g')
      this.id = this.props.id.replace('root_', '').replace(regex, '')
    }

    onDucChange = (value, errors = [], skipValidation = false) => {
      const newDucValue = value === 'default' ? undefined : value
      const schemaErrors = !value && this.props.uiSchema['ui:errorMessages']
        ? Object.values(this.props.uiSchema['ui:errorMessages']).map((err) => err)
        : []
      const errSchema = { [this.props.id]: { __errors: [...schemaErrors, ...errors] } }
      this.props.onChange(this.props.id, newDucValue === '__xmpie__clear__' ? '' : newDucValue, errSchema, skipValidation)
    }

    render () {
      const hashids = new Hashids(this.id)
      const hashedID = hashids.encode(1, 2, 3)

      return (
        <div className={`a${hashedID}`}>
          <WrappedComponent
            {...this.props}
            id={this.id}
            disabled={this.props.readonly}
            onChange={this.onDucChange}
          />
        </div>
      )
    }
  }

  return ConnectedComponent
}

const loadWidgets = () => window.uStoreDucs?.reduce((r, duc) => ({ ...r, [duc.name]: withCustomProps(duc.component) }), {}) || {}

let widgets = loadWidgets()

const isSectionHidden = (section) => section.properties.every((property) => !property.uiSchema['ui:options'].visible)
export const sectionSplitter = (properties, nameOfSectionToKeepOpen, changedSections) => {
  const sections = Object.values(properties).reduce((r, property) => {
    if (property.uiSchema['ui:options'].sectionId !== r.lastSectionId) {
      r.sections.push({
        name: property.uiSchema['ui:options'].section,
        properties: [property],
        changed: changedSections[r.sections.length] || false,
      })
      r.lastSectionId = property.uiSchema['ui:options'].sectionId
    } else {
      r.sections[r.sections.length - 1].properties.push(property)
    }
    return r
  }, { sections: [], lastSectionId: null })
  return sections.sections.filter((section) => !isSectionHidden(section))
}

const checkIfPropertyDependersHaveDefaultValueSelected = (property, formData) =>
  property.depended !== null &&
  formData[property.parent] === property.condition.enum[0] ?
    checkIfPropertyDependersHaveDefaultValueSelected(property.depended, formData) :
    formData[property.parent] === property.condition.enum[0]

const Property = React.memo(({ property, errors, handlePropertyChange, internalFormData, productType, isUEdit }) => {
  if (productType === productTypes.EASY_UPLOAD && property.custom?.code === 'FileAttachment') {
    return null
  }

  if (Object.keys(widgets).length === 0) {
    widgets = loadWidgets()
  }

  if ((
      property.depended && checkIfPropertyDependersHaveDefaultValueSelected(property.depended, internalFormData)) ||
    !property.depended
  ) {

    const WidgetComponent = widgets[property.uiSchema['ui:widget']]
    return (
      <div key={property.id}
           className={`duc-wrapper 
                ${property.uiSchema['ui:options'].visible ? '' : 'hidden'}
                ${errors[property.id] && errors[property.id].errors.length && errors[property.id].show ? 'errors' : ''}
              `}>
        <div className="duc-head">
          <label htmlFor={property.id} className="duc-title">
            {property.title}
            {property.required
              ? <span className="required-field">*</span>
              : null
            }
          </label>
          {property.description &&
            <span className="duc-description">
                    <Icon name="info.svg" width="16px" height="16px" className="info-icon" title=""/>
                    <div className="duc-description-text">{property.description}</div>
                  </span>
          }
          {property.custom.info &&
            <span className="info-icon">(i)
                    <span className="tooltip-text" dangerouslySetInnerHTML={{ __html: property.custom.info }}/>
                  </span>
          }
        </div>
        <WidgetComponent
          features={features}
          formContext={{ UStoreProvider }}
          id={property.id}
          onChange={handlePropertyChange}
          onBlur={(id, value, errorsFromProperty, skipValidation) =>
            value && handlePropertyChange(id, value, errorsFromProperty || [], skipValidation)
          }
          options={property.uiSchema['ui:options']}
          readonly={property.uiSchema['ui:readonly']}
          required={property.required}
          schema={property.propertySchema}
          additionalCropperClass={`${isUEdit ? 'cropper-wrapper' : ''}`}
          t={t}
          uiSchema={property.uiSchema}
          value={internalFormData[property.id]}
        />
        {
          errors[property.id] &&
          errors[property.id].errors &&
          errors[property.id].show
            ? errors[property.id].errors.map((error) => {
              return (
                <div className="duc-error" key="err">
                  <div className="error-text">{error}</div>
                </div>
              )
            })
            : null
        }
      </div>
    )
  }
  return null
})

const getFirstSectionWithErrors = (sections, errors) => {
  const sectionWithErrors = sections.map((section) => {
    return section.properties.reduce((r, property) => r || (errors[property.id] && errors[property.id].show), false)
  })
  for (let i = 0; i < sectionWithErrors.length; i++) {
    if (sectionWithErrors[i]) {
      return i
    }
  }
  return -1
}

const DynamicForm = ({ errors, excelPricingEnabled, formData, onChange, properties, sectionToOpen, sectionsDescription, productType, isMobile, isUEdit }) => {
  const [internalFormData, setInternalFormData] = useState(formData || {})
  const [firstLoad, setFirstLoad] = useState(true)
  const [openSection, setOpenSection] = useState(0)
  const [sections, setSections] = useState([])
  const [changedSections, setChangedSections] = useState({})
  const sectionsRef = useRef({})


  useEffect(() => {
    if (firstLoad && formData && !isMobile) {
      setTimeout(() => {
        getFirstFocusableElement()?.focus()
        setFirstLoad(false)
      }, 0)
    }
  },[firstLoad, formData, isMobile])

  useEffect(() => formData && setInternalFormData(formData), [formData])

// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setSections(sectionSplitter(properties, openSection, changedSections)), [properties])

  useEffect(() => {
    if (sectionToOpen && sectionToOpen !== openSection) {
      if (sectionToOpen < -2) {
        const firstSectionWithErrors = getFirstSectionWithErrors(sections, errors)
        setOpenSection(firstSectionWithErrors)
        scrollToElement(sectionsRef.current[firstSectionWithErrors])
        return
      }
      setOpenSection(sectionToOpen)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionToOpen])
  const handlePropertyChange = (id, value, errorsFromProperty, skipValidation = false) => {
    const sectionIndex = sections.findIndex(section => section.properties.some(property => property.id === id))
    setChangedSections({ ...changedSections, [sectionIndex]: true })

    const updatedErrors = Object.keys(errors)
      .reduce((acc, propertyId) => ({
        ...acc,
        [propertyId]: (errorsFromProperty[propertyId] &&
          errorsFromProperty[propertyId].__errors) || errors[propertyId].errors
      }), {})
    setInternalFormData({
      ...internalFormData,
      [id]: value
    })

    onChange(id, value, updatedErrors, {}, skipValidation)
  }

  const onNextSection = () => {
    const sectionProps = sections[openSection].properties
    const sectionChanges = sectionProps.reduce((acc, prop) => ({ ...acc, [prop.id]: prop.value || '' }), {})
    const changedPropList = sectionProps.map(prop => prop.id)
    setInternalFormData({
      ...internalFormData, ...sectionChanges
    })
    setChangedSections({ ...changedSections, [openSection]: true })
    const currentErrors = Object.entries(errors).reduce((acc, [key, value]) => ({ ...acc, [key]: value.errors }), {})
    onChange(changedPropList, null, currentErrors, sectionChanges, false)
    setTimeout(() => getFirstFocusableElement()?.focus(), 0)
    const nextSectionIndex = openSection + 1
    if (nextSectionIndex < sections.length) {
      setOpenSection(nextSectionIndex)
      scrollToElement(sectionsRef.current[nextSectionIndex])
    } else {
      setOpenSection(-1)
    }
  }

  if (!Object.keys(properties).length) return null

  if (sections.length < 2) {
    const description = sectionsDescription[Object.values(properties)[0].uiSchema['ui:options'].sectionId]?.description
    const sanitizedDescription = sanitizeHTML(description, {
      allowedClasses: { '*': ['*'] },
      allowedAttributes: { '*': ['*'] },
      parseStyleAttributes: false
    })
    return (
        <>
          {description && <div className="section-description" dangerouslySetInnerHTML={{__html: sanitizedDescription}}/>}
          {Object.values(properties).map((property, index) => (
              <Property key={index} property={property} errors={errors} handlePropertyChange={handlePropertyChange}
                              internalFormData={internalFormData} productType={productType} isUEdit={isUEdit}/>
                )
          )}
        </>
    )
  }

  const getSectionErrors = (section, index) => {
    if (changedSections[index] && openSection !== index) {
      return section.properties.map((prop) => errors[prop.id].errors.length > 0)
    }
    return section.properties.map((prop) => errors[prop.id].show && errors[prop.id].errors.length > 0)
  }

  return sections.map((section, index) => (
    <Section key={section.name} number={index}
             setOpenSection={(sectionNumber) => setOpenSection(sectionNumber)}
             section={section} sections={sections}
             isOpen={openSection === index}
             isLastSection={sections.length - 1 !== index}
             onNext={onNextSection}
             changed={section.changed}
             sectionToScrollTo={openSection}
             sectionErrors={getSectionErrors(section, index)}
             ref={(ref) => sectionsRef.current[index] = ref}
             isHidden={isSectionHidden(section)}
             sectionDescription={sectionsDescription[section.properties[0].uiSchema['ui:options'].sectionId]}
    >
      {section.properties.map((property) => (
        <Property key={property.id} property={property} errors={errors} handlePropertyChange={handlePropertyChange}
                  internalFormData={internalFormData} productType={productType} isUEdit={isUEdit}/>
      ))}
    </Section>
  ))
}

export default DynamicForm

function smoothScroll (target, { duration = 100, offset = 0, container = document.body }) {
  const targetPosition = target.offsetTop - offset
  const startPosition = container.scrollTop
  const distance = targetPosition - startPosition

  let start = null

  const animation = (currentTime) => {
    if (!start) start = currentTime
    const timeElapsed = currentTime - start
    const run = ease(timeElapsed, startPosition, distance, duration)
    container.scrollTop = run
    if (timeElapsed < duration) {
      requestAnimationFrame(animation)
    }
  }

  const ease = (t, b, c, d) => {
    t /= d / 2
    if (t < 1) return c / 2 * t * t + b
    t--
    return -c / 2 * (t * (t - 2) - 1) + b
  }

  requestAnimationFrame(animation)
}

function scrollToElement (element) {
  setTimeout(() => {
    if (!element) return
    const header = document.querySelector('.header')
    const headerHeight = header ? header.offsetHeight + 20 : 20
    smoothScroll(element, { offset: headerHeight })

  }, 400)
}

function getFirstFocusableElement () {
  const elements = document.querySelectorAll('.section-open [data-xmpie-focusable]');
  return Array.from(elements).find(el => {
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && el.getBoundingClientRect().height > 0;
  });
}
