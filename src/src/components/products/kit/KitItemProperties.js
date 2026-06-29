/**
 * KitItemProperties
 *
 * Renders a kit item's VDP properties as native inline fields (Option B, Steps 0-3),
 * replacing the legacy ProductProperties.aspx iframe for property capture.
 *
 * This is a COMPOSITION of pieces the theme already ships and uses for static/dynamic
 * products — nothing here is a from-scratch input renderer:
 *   - DynamicForm  -> renders each property as a native DUC widget
 *   - useErrors    -> Ajv validation -> the { [id]: { errors, show } } shape DynamicForm wants
 *   - convertPropertiesFromApiToPropertiesObject / getDependenciesObject -> read
 *   - preparingFormDataToSendToServer + updatePropertiesState -> per-change write-back
 *
 * On first load it logs the raw schema (Step 0 instrumentation) so we can confirm the
 * price field's type/key/validation against a real VDP tag item.
 *
 * @param {string}   orderItemID       - the kit *item* order-item id (not the parent kit)
 * @param {function} [onValidityChange] - (orderItemID, isValid) => void, to feed kit view model
 * @param {string}   [productType]      - the kit item's own product Type (defaults to STATIC)
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { UStoreProvider } from '@ustore/core'
import { LoadingDots } from '$core-components'
import { preparingFormDataToSendToServer, productTypes } from '$themeservices'
import { convertPropertiesFromApiToPropertiesObject, getDependenciesObject } from '../static/utils'
import useErrors from '../static/useErrors'
import DynamicForm from '../DynamicForm'
import theme from '$styles/theme'
import './KitItemProperties.scss'

const depsObjOf = (api) => {
  const deps = getDependenciesObject(api)
  return deps ? deps.dependenciesObject : null
}

const KitItemProperties = ({ orderItemID, onValidityChange, productType = productTypes.STATIC }) => {
  const [properties, setProperties] = useState({})        // raw propertiesFromApi (formData/JSONSchema/UISchema)
  const [propertiesObject, setPropertiesObject] = useState({})
  const [loading, setLoading] = useState(true)
  const [isMobile] = useState(document.body.clientWidth < parseInt(theme.md.replace('px', ''), 10))

  const inFlight = useRef(false)
  const debounceRef = useRef()

  const {
    errors,
    visibleErrorsExist,
    processErrorsOnApiResponse,
    processErrorsOnFormChange
  } = useErrors(properties)

  // Report validity up to the kit (replaces the iframe @PRODUCT_PROPERTIES_STATUS message).
  useEffect(() => {
    if (loading) return
    onValidityChange && onValidityChange(orderItemID, !visibleErrorsExist)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleErrorsExist, loading])

  // Initial read.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)

        if (!window.uStoreDucs || !window.uStoreDucs.length) {
          // DynamicForm renders widgets out of this global registry. If it isn't loaded on
          // the kit route, fields won't render — surface it loudly rather than failing silent.
          // eslint-disable-next-line no-console
          console.warn('[KitItemProperties] window.uStoreDucs not loaded on kit route', orderItemID)
        }

        const api = await UStoreProvider.api.orders.getProperties(orderItemID)
        if (cancelled) return

        // --- Step 0 instrumentation: schema dump for the price field ---
        // eslint-disable-next-line no-console
        console.log('[KitItemProperties] getProperties', orderItemID, api)
        const obj = convertPropertiesFromApiToPropertiesObject(api, depsObjOf(api))
        // eslint-disable-next-line no-console
        console.log('[KitItemProperties] propertiesObject', orderItemID, obj)

        setProperties(api)
        setPropertiesObject(obj)
        processErrorsOnApiResponse(api, null)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[KitItemProperties] load failed', orderItemID, e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderItemID])

  // Per-change write-back. Mirrors StaticProduct.updateProperties: push form data via
  // updatePropertiesState, take the refreshed schema back, re-derive object + errors.
  const writeBack = useCallback(async (nextSchema, changedIds) => {
    if (inFlight.current) return
    inFlight.current = true
    try {
      const formDataForApi = preparingFormDataToSendToServer(nextSchema.formData, nextSchema)
      const response = await UStoreProvider.api.orders.updatePropertiesState(orderItemID, formDataForApi)
      if (response) {
        setProperties(response)
        setPropertiesObject(convertPropertiesFromApiToPropertiesObject(response, depsObjOf(response)))
        processErrorsOnApiResponse(response, errors, Array.isArray(changedIds) ? changedIds : [changedIds])
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[KitItemProperties] write failed', orderItemID, e)
    } finally {
      inFlight.current = false
    }
  }, [orderItemID, errors, processErrorsOnApiResponse])

  // DynamicForm onChange contract: (idOrIds, value, updatedErrors, sectionChanges, skipValidation)
  const onFormChange = useCallback((idOrIds, value, updatedErrors, sectionChanges = {}, skipValidation = false) => {
    const applied = Array.isArray(idOrIds)
      ? { ...properties.formData, ...sectionChanges }
      : { ...properties.formData, [idOrIds]: value }
    const nextSchema = { ...properties, formData: applied }
    setProperties(nextSchema)

    // Immediate inline feedback before the server round-trip.
    processErrorsOnFormChange(idOrIds, updatedErrors, nextSchema, value)

    if (skipValidation) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => writeBack(nextSchema, idOrIds), 400)
  }, [properties, processErrorsOnFormChange, writeBack])

  if (loading) {
    return <div className="kit-item-properties is-loading"><LoadingDots /></div>
  }
  if (!Object.keys(propertiesObject).length) return null

  return (
    <div className="kit-item-properties">
      <DynamicForm
        errors={errors}
        excelPricingEnabled={false}
        formData={properties.formData}
        onChange={onFormChange}
        properties={propertiesObject}
        sectionsDescription={(properties.JSONSchema && properties.JSONSchema.sections) || {}}
        productType={productType}
        isMobile={isMobile}
        isUEdit={false}
      />
    </div>
  )
}

export default KitItemProperties
