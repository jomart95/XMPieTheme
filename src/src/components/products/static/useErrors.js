import { useEffect, useState } from 'react'
import Ajv from 'ajv'
import { union } from 'lodash'
import { getDependenciesObject, getDependentSchema, removeEmptyValuesFromFormData } from './utils'

const useErrors = (initialPropertiesSchema) => {
  const [errors, setErrors] = useState({})
  const [errorsExist, setErrorsExist] = useState(false)
  const [visibleErrorsExist, setVisibleErrorsExist] = useState(false)
  const [initialSchemaLoaded, setInitialSchemaLoaded] = useState(false)
  const [excelPricingError, setExcelPricingError] = useState(false)

  useEffect(() => {
    if (Object.keys(initialPropertiesSchema).length && !initialSchemaLoaded) {
      setErrors(
        Object.keys(initialPropertiesSchema.JSONSchema.definitions)
          .reduce((acc, propertyId) => ({
            ...acc,
            [propertyId]: {
              errors: [],
              show: false,
            ...(initialPropertiesSchema.UISchema[propertyId]['ui:options']?.section && { section: initialPropertiesSchema.UISchema[propertyId]['ui:options'].section })
            }
          }), {})
      )
      setInitialSchemaLoaded(true)
    }
  }, [initialPropertiesSchema, initialSchemaLoaded])

  useEffect(() => {
    setErrorsExist(checkIfThereArePropertyErrors())
    setVisibleErrorsExist(checkIfThereAreVisiblePropertyErrors())
  // eslint-disable-next-line
  }, [errors])

  const checkIfThereArePropertyErrors = () => Object.values(errors)
    .some((property) => !!(property && property.errors && property.errors.length))

  const checkIfThereAreVisiblePropertyErrors = () => Object.values(errors)
    .some((property) => property.errors && property.errors.length && property.show)

  const checkIfThereAreDisabledAffectPricePropertiesWithErrors = (updatedProperties) => Object.keys(updatedProperties.UISchema)
    .some(propertyId =>
      updatedProperties.UISchema[propertyId]['ui:readonly'] &&
            updatedProperties.JSONSchema.definitions[propertyId].custom.affectPrice &&
            updatedProperties.errors &&
            Object.keys(updatedProperties.errors).includes(propertyId)
    )

  const processErrorsOnApiResponse = (propertiesFromApi, currentErrors = null, propertiesToShowErrors = []) => {
    const excelError = checkIfThereAreDisabledAffectPricePropertiesWithErrors(propertiesFromApi)
    setExcelPricingError(excelError)
    const updatedFormErrors = combineAjvErrorsWithUiSchema(propertiesFromApi)
    const updatedErrors = getErrorsObject(combineApiErrorsWithFormErrors(propertiesFromApi, excelError ? {} : updatedFormErrors, excelError), propertiesFromApi, currentErrors || errors)
    Object.keys(updatedErrors).forEach((propertyId) => {
      const showError = () => {
        if (excelError) {
          if (propertiesFromApi.errors && Object.keys(propertiesFromApi.errors).includes(propertyId)) return true
          return errors[propertyId] ? errors[propertyId].show : false
        } else {
          if (!propertiesToShowErrors.includes(propertyId)) {
            if (currentErrors) {
              return currentErrors[propertyId] ? currentErrors[propertyId].show : false
            }
            return errors[propertyId] ? errors[propertyId].show : false
          }
          return true
        }
      }
      updatedErrors[propertyId].show = showError()
    })

    setInitialSchemaLoaded(true)
    setErrors(updatedErrors)
    return updatedErrors
  }

  const processErrorsOnFormChange = (changedPropertyId, propertyErrors, propertiesSchema, changedPropertyValue = null) => {
    if (changedPropertyValue === '__xmpie__clear__') {
      return
    }
    const formErrors = combineAjvErrorsWithUiSchema(propertiesSchema)
    const updatedFormErrors = propertyErrors
      ? combineOnFormChangeErrorsWithFormErrors(propertyErrors, formErrors)
      : formErrors
    const errorsObject = getErrorsObject(updatedFormErrors, propertiesSchema, errors)
    if (Array.isArray(changedPropertyId)) {
      changedPropertyId.forEach((propertyId) => {
        errorsObject[propertyId].show = !!errorsObject[propertyId].errors.length
      })
      Object.keys(propertiesSchema.JSONSchema.definitions).forEach((propertyId) => {
        if (!changedPropertyId.includes(propertyId)) {
          errorsObject[propertyId].show = !errorsObject[propertyId].errors.length ? false : errorsObject[propertyId].show
        }
      })
    } else {
      if (changedPropertyValue === '__xmpie__error__' && propertyErrors) {
        errorsObject[changedPropertyId].show = true
      } else {
        errorsObject[changedPropertyId].show = !!errorsObject[changedPropertyId].errors.length
      }
      Object.keys(propertiesSchema.JSONSchema.definitions).forEach((propertyId) => {
        if (propertyId !== changedPropertyId) {
          errorsObject[propertyId].show = !errorsObject[propertyId].errors.length ? false : errorsObject[propertyId].show
        }
      })
    }

    // Before returning errorsObject, check if the parent field has dependencies and if so, clear errors of the other dependant fields of parent than the one clicked
    if (getDependenciesObject(propertiesSchema) && propertiesSchema.JSONSchema.dependencies && Object.keys(propertiesSchema.JSONSchema.dependencies).includes(changedPropertyId)) {
      const { dependenciesObjectWithValues } = getDependenciesObject(propertiesSchema)
      const dependentFields = Object.keys(dependenciesObjectWithValues)
        .filter(key => dependenciesObjectWithValues[key].dependant === changedPropertyId && dependenciesObjectWithValues[key].dependantValue[0] !== changedPropertyValue)
      dependentFields.forEach((field) => {
        errorsObject[field].errors = []
        errorsObject[field].show = false
      })
    }

    setErrors(errorsObject)
    return errorsObject
  }

  const processErrorsOnAddToCart = (propertiesSchema) => {
    if (propertiesSchema && Object.keys(propertiesSchema).length) {
      const formErrors = combineAjvErrorsWithUiSchema(propertiesSchema)
      const errorsObject = getErrorsObject(formErrors, propertiesSchema, errors)
      Object.keys(errorsObject).forEach((propertyId) => {
        errorsObject[propertyId].show = true
        if (propertiesSchema.UISchema[propertyId]['ui:options']?.custom?.section) {
          errorsObject[propertyId].section = propertiesSchema.UISchema[propertyId]['ui:options']?.custom?.section
        }
      })
      setErrors(() => errorsObject)
      return errorsObject
    }
    return errors
  }

  const getAjvErrors = (propertiesSchema) => {
    const ajv = new Ajv({ allErrors: true, strict: false, coerceTypes: true })
    const schemaWithDeps = getDependentSchema(propertiesSchema.JSONSchema, propertiesSchema.formData)
    ajv.validate(schemaWithDeps, removeEmptyValuesFromFormData(propertiesSchema.formData))
    return ajv.errors
  }


  const combineAjvErrorsWithUiSchema = (propertiesSchema) => {
    const isPropertyForError = (ajvError, propertyId) => {
      if (ajvError.keyword === 'required') {
        return ajvError.params.missingProperty === propertyId
      }
      return ajvError.instancePath.substring(1) === propertyId
    }
    const ajvErrors = getAjvErrors(propertiesSchema)

    if (ajvErrors) {
      return Object.keys(propertiesSchema.JSONSchema.definitions)
        .reduce((acc, propertyId) =>
          ({
            ...acc,
            [propertyId]: [
              ...ajvErrors
                .filter((ajvError) =>  isPropertyForError(ajvError, propertyId))
                .map((errorObj) => {
                  if (
                    propertiesSchema.UISchema[propertyId]['ui:errorMessages'] &&
                    Object.keys(propertiesSchema.UISchema[propertyId]['ui:errorMessages']).length
                  ) {
                    if (
                      propertiesSchema.UISchema[propertyId]['ui:errorMessages'][errorObj.keyword] &&
                      isPropertyForError(errorObj, propertyId)
                    ) {
                      return propertiesSchema
                        .UISchema[propertyId]['ui:errorMessages'][errorObj.keyword]
                    }
                  }

                  return undefined
                })
                .filter((error) => error !== undefined)
            ]
          }), {})
    }
    return Object.keys(errors).reduce((acc, propertyId) => ({
      ...acc,
      [propertyId]: []
    }), {})
  }

  const combineApiErrorsWithFormErrors = (propertiesSchema, formErrors, excelPricingError) => {
    const apiErrors = excelPricingError ? propertiesSchema.errors : formErrors
    if (propertiesSchema.errors) {
      return Object.keys(apiErrors).reduce((acc, propertyId) =>
        formErrors[propertyId] ? {
          ...acc,
          [propertyId]: union(propertiesSchema.errors[propertyId], formErrors[propertyId])
        } : {
          ...acc,
          [propertyId]: propertiesSchema.errors[propertyId]
        }, {})
    } else {
      return formErrors
    }
  }

  const getErrorsObject = (newErrors, propertiesSchema, currentErrors) => {
    return Object.keys(propertiesSchema.JSONSchema.definitions).reduce((acc, propertyId) => newErrors[propertyId] ? {
      ...acc,
      [propertyId]: {
        errors: newErrors[propertyId],
        show: currentErrors[propertyId] ? currentErrors[propertyId].show : false,
        ...(propertiesSchema.UISchema[propertyId]['ui:options'].section && { section: propertiesSchema.UISchema[propertyId]['ui:options'].section })
      }
    } : {
      ...acc,
      [propertyId]: {
        errors: [],
        show: false
      }
    }, {})
  }

  const checkIsPriceAffectedWithErrors = (properties, errors) => {
    const propertiesCanAffectPrice = Object.values(properties).filter((property) => property.custom.affectPrice)
    return propertiesCanAffectPrice.some((property) => errors[property.id].errors.length)
  }

  const combineOnFormChangeErrorsWithFormErrors = (propertyErrors, formErrors) => {
    return Object.keys(errors).reduce((acc, propertyId) =>
      (propertyErrors[propertyId] && propertyErrors[propertyId].length)
        ? {
          ...acc,
          [propertyId]: union(propertyErrors[propertyId], formErrors[propertyId])
        }
        : {
          ...acc,
          [propertyId]: formErrors[propertyId] || []
        }, {})
  }

  const showErrors = (propertiesToShowErrors, currentErrors = null) => {
    const errorsToUse = currentErrors || errors
    const showAll = propertiesToShowErrors.length === 0
    const updatedErrors = Object.keys(errorsToUse).reduce((acc, propertyId) => ({
      ...acc,
      [propertyId]: {
        errors: errorsToUse[propertyId].errors,
        show: showAll ? true : propertiesToShowErrors.includes(propertyId)
      }
    }), {})
    setErrors(updatedErrors)
  }

  const showAllErrors = (updatedErrors = null) => {
    const errorsObject = updatedErrors || errors
    Object.keys(errorsObject).forEach((propertyId) => {
      errorsObject[propertyId].show = !!errorsObject[propertyId].errors.length
    })
    setErrors(() => errorsObject)
  }

  const hideErrors = (propertiesToHideErrors) => {
    const updatedErrors = Object.keys(errors).reduce((acc, propertyId) => ({
      ...acc,
      [propertyId]: {
        errors: errors[propertyId].errors,
        show: !propertiesToHideErrors.includes(propertyId)
      }
    }), {})
    setErrors(updatedErrors)
  }

  return ({
    errors,
    errorsExist,
    visibleErrorsExist,
    processErrorsOnApiResponse,
    processErrorsOnFormChange,
    processErrorsOnAddToCart,
    showErrors,
    hideErrors,
    showAllErrors,
    excelPricingError,
    checkIsPriceAffectedWithErrors
  })
}

export default useErrors
