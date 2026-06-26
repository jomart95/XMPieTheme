import deepcopy from 'deepcopy'
import {UStoreProvider} from '@ustore/core'

export const convertPropertiesFromApiToPropertiesObject = (propertiesFromApi, dependenciesObject = null) => {
  // We create a sorted properties array according
  const propertiesOrder = Object
    .keys(propertiesFromApi.JSONSchema.definitions)
    .sort((a, b) => propertiesFromApi.JSONSchema.definitions[a].custom.displayOrder - propertiesFromApi.JSONSchema.definitions[b].custom.displayOrder)

  // We create a dependent properties array to check which property has dependencies

  // Array of property objects, sorted
  const sortedPropertiesObject = propertiesOrder.map((propertyId) => {
    return {
      ...propertiesFromApi.JSONSchema.definitions[propertyId],
      id: propertyId,
      pattern: propertiesFromApi.JSONSchema.definitions[propertyId].pattern,
      custom: propertiesFromApi.JSONSchema.definitions[propertyId].custom,
      depended: dependenciesObject && Object.keys(dependenciesObject).includes(propertyId) ? createNestedDependencyTree(propertiesFromApi, dependenciesObject, propertyId) : null,
      required: propertiesFromApi.JSONSchema.required.includes(propertyId),
      order: propertiesFromApi.JSONSchema.definitions[propertyId].custom.displayOrder,
      uiSchema: {
        ...propertiesFromApi.UISchema[propertyId],
        'ui:errorMessages': propertiesFromApi.UISchema[propertyId]['ui:errorMessages']
      },
      propertySchema: dependenciesObject &&
      Object
        .keys(dependenciesObject)
        .includes(propertyId)
        ? {
          ...propertiesFromApi
            .JSONSchema
            .dependencies[Object.values(dependenciesObject)[Object.keys(dependenciesObject).indexOf(propertyId)]]
            .oneOf
            .filter((dependees) => Object.keys(dependees.properties).includes(propertyId))[0]
            .properties[propertyId],
          ...propertiesFromApi.JSONSchema.definitions[propertyId]
        }
        : {
          ...propertiesFromApi.JSONSchema.properties[propertyId],
          ...propertiesFromApi.JSONSchema.definitions[propertyId]
        },
      value: propertiesFromApi.formData[propertyId] === '' || propertiesFromApi.formData[propertyId] === '[]' ? undefined : propertiesFromApi.formData[propertyId]
    }
  })

  const propertiesObject = {}
  // Convert array back to object
  sortedPropertiesObject.forEach((property) => {
    propertiesObject[property.id] = {
      ...property
    }
  })

  return propertiesObject
}

export const pushOrderItem = async (orderId, orderItem) => {
  return UStoreProvider.api.orders.updateOrderItem(orderId, orderItem)
}

export const pushPropertiesState = async (orderItemId, dataToPush) => {
  return UStoreProvider.api.orders.updatePropertiesState(orderItemId, dataToPush)
}

export const getPriceOrderItem = (orderItemId, obj) => {
  return UStoreProvider.api.orders.getPriceOrderItem(orderItemId, obj)
}

export const pushCart = async (orderId) => {
  await UStoreProvider.api.orders.addToCart(orderId)
}

export const pushSavedForLater = async (orderId) => {
  await UStoreProvider.api.orders.saveForLater(orderId)
}

export const getReorder = async (lastOrderId) => {
  return UStoreProvider.api.orders.reorder(lastOrderId)
}

export const pushProperties = async (orderId, properties) => {
  await UStoreProvider.api.orders.updateProperties(orderId, properties)
}

export const removeEmptyValuesFromFormData = (formData) => Object
  .keys(formData)
  .map((propertyId) => (
    {
      [propertyId]: formData[propertyId] === '' || formData[propertyId] === '[]'
        ? undefined
        : formData[propertyId]
    }))
  .reduce((acc, value) => (
    {
      ...acc,
      [Object.entries(value)[0][0].toString().replace(',', '')]: Object.entries(value)[0][1] }
  ), {})

export const getDependentSchema = (schema, formData) => {
  if (schema.dependencies) {
    const depTree = Object.entries(schema.dependencies).reduce((r, [key, dep]) => {
      const allDeps = dep.oneOf.map(({ properties }) => {
        const parentKey = `${key}|${properties[key].enum.join('|')}`
        const depProps = { ...properties }
        delete depProps[key]

        return { parentKey, depProps }
      }).reduce((acc, deps) => ({ ...acc, [deps.parentKey]: deps.depProps }), {})

      return { ...r, ...allDeps }
    }, {})
    const schemaWithDeps = deepcopy(schema)

    const getProperty = (propSchema) => {
      return Object.keys(propSchema).map(key => {
        if (depTree[`${key}|${formData[key]}`]) {
          return [{ [key]: propSchema[key] }, ...getProperty(depTree[`${key}|${formData[key]}`])]
        } else {
          return { [key]: propSchema[key] }
        }
      }).flat()
    }

    schemaWithDeps.properties = getProperty(schema.properties).reduce((r, prop) => ({ ...r, ...prop }), {})

    const propsMap = Object.keys(schemaWithDeps.properties).reduce((r, d) => ({ ...r, [d]: 1 }), {})
    schemaWithDeps.required = schemaWithDeps.required.filter(d => propsMap[d])
    schemaWithDeps.dependencies = {}

    return schemaWithDeps
  } else {
    return schema
  }
}

export const getDependenciesObject = (properties, excelPricing) => {
  if (properties.JSONSchema.dependencies) {
    const dependenciesObject = {}
    const dependenciesObjectWithValues = {}

    Object
      .keys(properties.JSONSchema.dependencies)
      .forEach((propertyId) => {
        properties
          .JSONSchema
          .dependencies[propertyId]
          .oneOf
          .forEach((dependees) => {
            Object.keys(dependees.properties)
              .forEach((dependentPropertyId) => {
                if (propertyId !== dependentPropertyId) {
                  dependenciesObject[dependentPropertyId] = propertyId
                  dependenciesObjectWithValues[dependentPropertyId] = {
                    dependant: propertyId,
                    dependantValue: dependees.properties[propertyId].enum
                  }
                }
              })
          })
      })
    return { dependenciesObject, dependenciesObjectWithValues }
  }
  return null
}

const createNestedDependencyTree = (propertiesFromApi, dependenciesObject, propertyId) => {
  if (Object.keys(dependenciesObject).includes(propertyId)) {
    return {
      parent: dependenciesObject[propertyId],
      condition: propertiesFromApi.JSONSchema.dependencies[dependenciesObject[propertyId]].oneOf
        .filter((dependees) => Object.keys(dependees.properties).includes(propertyId))
        .map((dependees) => dependees.properties[dependenciesObject[propertyId]])[0],
      depended: createNestedDependencyTree(propertiesFromApi, dependenciesObject, dependenciesObject[propertyId]) || null
    }
  }
}

