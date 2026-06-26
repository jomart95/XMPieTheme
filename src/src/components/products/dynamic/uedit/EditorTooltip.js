import './EditorTooltip.scss'
import React from 'react'

const EditorTooltip = ({text, position, width}) => {

    return (
        <div style={{width: width}} className={'uedit-tooltip'}>
            <span>
            {text}
          </span>
        </div>
    )
}
export default EditorTooltip
