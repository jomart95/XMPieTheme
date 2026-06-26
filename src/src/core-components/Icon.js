import React, {useEffect, useRef, useContext, useState} from 'react'
import { RootDocumentContext } from '$themeservices'

export const Icon = ({ name, width, height, size, wrapperClassName, className, title, ...args }) => {
  const {documentRoot} = useContext(RootDocumentContext)()
  const [importedIcon, setImportedIcon] = useState(null)
  const w = width || size
  const h = height || size
  const iconRef = useRef(null)

  useEffect(() => {
    const setCssClass = () => {
      // adding className to all <g> and <path> nodes under svg to allow stroke coloring
      if (documentRoot.querySelectorAll(`svg.${className}`).length) {
        documentRoot.querySelectorAll(`svg.${className}`).forEach((svg) => {
          svg.querySelectorAll('g').forEach((element) =>
              element.classList.add(className)
          )
          svg.querySelectorAll('path').forEach((element) =>
              element.classList.add(className)
          )
        })
      }
    }

    const importIcon = async () => {
      const { ReactComponent } = await import(`$assets/icons/${name}`)
      setImportedIcon(<ReactComponent width={w} height={h} className={className} title={title} {...args} />)
    }
    importIcon()
    setCssClass()
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, width, height, className, title])

  if (!name || (!size && (!height || !width))) {
    return null
  }

  return (
    <div
        ref={iconRef}
        className={`icon icon-holder${wrapperClassName ? ` ${wrapperClassName}` : ''}`}
        style={{ width: `${w}`, height: `${h}`, 'backgroundSize': `${w} ${h}` }}
    >
        {importedIcon ? importedIcon : null}
    </div>
  )
}

export default Icon
