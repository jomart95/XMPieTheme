import React from 'react'
import { UStoreProvider } from '@ustore/core'
import { useNavigate, useParams } from 'react-router-dom'
import { t } from '$themelocalization'

import urlGenerator from '$ustoreinternal/services/urlGenerator'

const Slot = (props) => {
    const { name, data, actions } = props
    const navigate = useNavigate()
    const { page } = useParams()

    const decode = (id) => {
      const binary = atob(window.uStoreWidgetsConfiguration[id]).split('');

      const binaryBuffer = new Uint8Array(binary.length);
      binary.forEach((_, index) => {
        binaryBuffer[index] = binary[index].charCodeAt(0);
      })

      const textDecoder = new TextDecoder("utf-8");
      return textDecoder.decode(binaryBuffer);
    }

    return window.xmpie_uStore_widgets.instances
      .filter(widget => widget.location === name )
      .map((widget, index) => {
        const context = {
          page,
          slot: widget.name,
          place: index,
          data,
          navigate,
          urlGenerator,
          t,
        }
          const WidgetComponent = window[widget.name]?.default;
          const widgetConfig = Object.keys(window.uStoreWidgetsConfiguration).length && window.uStoreWidgetsConfiguration[widget.id]
            ? decode(widget.id)
            : null

          return React.createElement(WidgetComponent, { key: widget.name, uStoreProvider: UStoreProvider, config: widgetConfig, context, actions, ...props })
      })
};

Slot.defaultProps = {
  data: {},
}

export default Slot;
