import moment from 'moment'
import features from '$features'

export const productTypes =
{
  DYNAMIC: 1,
  STATIC: 2,
  COMPOSITE: 5,
  KIT: 14,
  EASY_UPLOAD: 16,
}

export const getIsNGProduct = (product) => {
  const { Type, Attributes } = product

  switch (Type) {
    case productTypes.KIT:
    case productTypes.EASY_UPLOAD:
      return true
    case productTypes.STATIC:
    case productTypes.DYNAMIC:
      const NGCompatible = Attributes.find(attribute => attribute.Name === 'NGCompatible')
      return NGCompatible && NGCompatible.Value.toLowerCase() === 'true'
    default:
      return false
  }
}

export const CART_MODE = {
  Aspx: 'Aspx',
  WishList: 'WishList',
  Lists: 'Lists',
  SingleList: 'SingleList',
}

export const getCartMode = (store) => {
  const { Attributes, StoreType } = store
  const NGCart = Attributes.find(attribute => attribute.Name === 'ForceCartAspx')
  const CartMode = Attributes.find(attribute => attribute.Name === 'CartMode')

  if (NGCart?.Value.toLowerCase() === 'true') {
    return CART_MODE.Aspx
  } else {
    if (StoreType === 4 && CartMode?.Value === CART_MODE.Lists) {
      return CART_MODE.Lists
    } else if (StoreType === 4 && CartMode?.Value === CART_MODE.SingleList) {
      return CART_MODE.SingleList
    } else if (CartMode?.Value === CART_MODE.WishList) {
      return CART_MODE.WishList
    }
  }
}

export const isDate = function (date) {
  if (typeof date === 'string') {
    const isTime = /\d{1,2}:\d{1,2}(:\d{1,2})?\s?([AP]M)?/.exec(date) !== null
    const parsedDate = moment(isTime ? `1/1/1970 ${date}` : date).toDate()
    return parsedDate !== 'Invalid Date'
  }

  return false
}

const convertDatesForState = (value, modes) => {
  const { showDateTime, showTime } = modes
  const date = moment(new Date()).format('YYYY-MM-DD')

  const dateFromProps =
    showDateTime && showTime
      ? value
      : showTime
        ? `${date}T${value}`
        : `${value}T00:00:00`

  return moment(dateFromProps).toDate()
}

export const convertDate = (str) => {
  if (features && features.newTimezoneModel) {
    // v14_1
    const showTime = str.includes(':')
    const showDate = str.includes('/') || str.includes('-')
    const dateAndTime = showTime && showDate

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

    const re = /[+-]\d{1,2}:?\d{1,2}$/
    const date = re.test(str) ? moment(str).format('DD/MM/YYYY HH:mm') : str

    const mDate = moment(date, 'DD/MM/YYYY')
    const mTime = moment(date, ['HH:mm', 'HH:mm:ss'], true)
    const mDateTime = moment(date, ['DD/MM/YYYY HH:mm', 'DD/MM/YYYYTHH:mm:ssZ'], true)

    const isDate = !showTime && mDate.isValid()
    const isTime = showTime && mTime.isValid()
    const isAndTime = dateAndTime && mDateTime.isValid()

    return {
      date: isDate || isAndTime ? mDate.format('YYYY-MM-DD') : '',
      time: isTime ? mTime.format('HH:mm:ss') : isAndTime ? mDateTime.format('HH:mm:ss') : '',
      timeZone
    }
  } else {
    // v14_0
    const showTime = str.includes(':')
    const showDateTime = str.includes('/') || str.includes('-')

    const nodes = { showTime, showDateTime }
    const strConverted = convertDatesForState(str, nodes)

    const date = moment(strConverted).format('YYYY-MM-DD')
    const time = moment(strConverted).format('HH:mm')

    const clientNow = moment().format('YYYY-MM-DDTHH:mm:ss')

    return { date, time, clientNow }
  }
}

export const convertProductPropertiesFormIntoArray = (currentProductProperties, excelPricingEnabled) => {
  const { formData = {}, JSONSchema: { definitions }, UISchema } = currentProductProperties

  return Object.keys(formData).map(propName => {
    const propertyDefinition = definitions[propName]
    const widget = UISchema[propName]['ui:widget']
    const toAPIValue = window.uStoreDucs.find(duc => duc.name === widget).component['toAPIValue']
    return {
      id: propertyDefinition.custom.id,
      value: toAPIValue ? toAPIValue(formData[propName]) : (formData[propName] || '')
    }
  })
}

function isObject (item) {
  return (item && typeof item === 'object' && !Array.isArray(item))
}
export const mergeDeep = (target, ...sources) => {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return mergeDeep(target, ...sources)
}

export const PriceNotUpdatedReason = {
  hiddenError: 'hidden error',
  visibleError: 'visible error',
  noUpdates: 'nothing was updated',
  notAffectPriceProperty: 'updated property does not affect price'
}
export const shouldPriceBeUpdatedDespiteErrors = (hiddenErrors = [], visibleErrors = [], excelPricingEnabled = false) => {
  if (visibleErrors && visibleErrors.length > 0 && !!visibleErrors.find((e) => e.affectPrice)) {
    return { result: false, error: PriceNotUpdatedReason.visibleError }
  }

  if (excelPricingEnabled) {
    return { result: true }
  }

  let hiddenErrorsAffectPrice = false
  if (hiddenErrors && hiddenErrors.length > 0) {
    hiddenErrorsAffectPrice = !!hiddenErrors.find((e) => e.affectPrice)
  }

  return !hiddenErrorsAffectPrice ? { result: true } : { result: false, error: PriceNotUpdatedReason.hiddenError }
}

let prevDefs = {}
export const shouldPriceBeUpdatedByUpdates = (newProps, prevProps, schema) => {
  const updatedProperties = Object.keys(newProps)
    .filter((propertyName) => newProps[propertyName] !== prevProps[propertyName])

  if (updatedProperties.length === 0) {
    return { result: false, error: PriceNotUpdatedReason.noUpdates }
  }
  const { definitions } = schema

  let shouldUpdatePrice = false
  const filteredDefs = Object.keys(schema.properties)
    .reduce((acc, next) => ({ ...acc, [next]: schema.definitions[next] }), {})

  if (Object.keys(prevDefs).length !== Object.keys(filteredDefs).length) {
    shouldUpdatePrice = true
  }
  prevDefs = filteredDefs
  for (const propertyName of updatedProperties) {
    if (definitions[propertyName].custom.affectPrice) {
      shouldUpdatePrice = true
      break
    }
  }

  if (!shouldUpdatePrice) {
    return { result: false, error: PriceNotUpdatedReason.notAffectPriceProperty }
  }

  return { result: true }
}

export const shouldPriceBeUpdated = (newProps, prevProps, schema, hiddenErrors = [], visibleErrors = [], excelPricingEnabled = false) => {
  const shouldPriceBeUpdatedByUpdatesResult = shouldPriceBeUpdatedByUpdates(newProps, prevProps, schema)
  const shouldPriceBeUpdatedDespiteErrorsResult = shouldPriceBeUpdatedDespiteErrors(hiddenErrors, visibleErrors, excelPricingEnabled)

  if (!shouldPriceBeUpdatedByUpdatesResult.result) {
    return shouldPriceBeUpdatedByUpdatesResult
  }

  return shouldPriceBeUpdatedDespiteErrorsResult
}

export const preparingFormDataToSendToServer = (newData, propertiesSchema) => {
  return Object.keys(newData).reduce((updatedProperties, key) => {
    const definition = propertiesSchema.JSONSchema.definitions[key]

    const widget = propertiesSchema.UISchema[key]['ui:widget']
    const toAPIValue = window.uStoreDucs.find(duc => duc.name === widget).component['toAPIValue']

    const isJsonString = (newData[key] ? newData[key].toString() : '').startsWith('___JSON___:')

    let newValue = !!newData[key] || newData[key] === 0
      ? isJsonString
        ? JSON.parse(newData[key].replace('___JSON___:', ''))
        : toAPIValue ? toAPIValue(newData[key]) : newData[key]
      : ''
    newValue = newValue === '__xmpie__error__'  ? '' : newValue
    updatedProperties.push({
      id: definition.custom.id,
      value: newValue
    })

    return updatedProperties
  }, [])
}

export const convertTimeByTimeZone = (properties) => {
  return Object.keys(properties.formData).reduce((acc, next) => {
    const isDatePicker = properties.formData[next] && properties.UISchema[next]['ui:widget'] === 'dateTimePicker'

    if (isDatePicker) {
      const isTime = moment(properties.formData[next], 'HH:mm:ss', true).isValid()
      const dateTime = isTime ? properties.formData[next] : moment(properties.formData[next]).format()
      return { ...acc, [next]: dateTime }
    }
    return { ...acc, [next]: properties.formData[next] }
  }, {})
}

export const cleanServerErrors = (serverErrors, uiSchema) => {
  let errorMessage = ''
  const errorsObject = serverErrors ? Object.keys(serverErrors).reduce((acc, next) => {
    if (!Object.keys(uiSchema[next]).includes('ui:errorMessages')) {
      errorMessage = serverErrors[next][0]
      return { ...acc, [next]: serverErrors[next] }
    }
    return acc
  }, {}) : {}
  return { errorsObject, errorMessage }
}

export const convertCustomFormat = (string, price = '', tax = '', priceIncludingTax = '') => {
  let convertedString = string;

  if (string.includes('{Price}')) {
    convertedString = convertedString.replace(/{Price}/g, price);
  };

  if (string.includes('{Tax}')) {
    convertedString = convertedString.replace(/{Tax}/g, tax)
  };

  if (string.includes('{PriceIncludingTax}')) {
    convertedString = convertedString.replace(/{PriceIncludingTax}/g, priceIncludingTax);
  }

  return convertedString;
};

export function getImageBlobFromCanvas(canvas, quality = 0.8) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Cant convert canvas to Blob'));
      }
    }, 'image/jpeg', quality);
  });
}
