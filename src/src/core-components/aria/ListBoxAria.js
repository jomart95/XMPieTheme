import React, {useRef} from 'react'
import {useListState} from 'react-stately'
import {mergeProps, useFocusRing, useListBox, useOption} from 'react-aria'

export function OptionAria({item, state, children, className}) {
  const ref = useRef(null)
  const keyPressRef = useRef('none')
  const {optionProps} = useOption({key: item.id}, state, ref)

  const {isFocusVisible, focusProps} = useFocusRing()
  return (
    <div
      {...mergeProps(optionProps, focusProps)}
      ref={ref}
      data-focus-visible={isFocusVisible}
      className={className}
      onClick={() => {
        state.selectionManager.select(item.id)
      }}
      onTouchEnd={(e) => {
        state.selectionManager.select(item.id)
        optionProps.onClick(e)
      }}
      onKeyDown={(e) => {
        keyPressRef.current = e.target
      }}
      onKeyUp={(e) => {
        if (e.key === 'Enter' && keyPressRef.current === e.target) {
          state.selectionManager.select(item.id)
        }
      }}
    >
      {children}
    </div>
  )
}

OptionAria.getCollectionNode = () => {
  return {
    type: 'option',
    props: {
      className: 'option',
    },
  }
}

OptionAria.getCollectionNode = function* getCollectionNode(props) {
  let {children} = props;

  yield {
    type: 'item',
    props: props,
    rendered: children,
    'aria-label': props['aria-label'],
    hasChildNodes: false,
    textValue: ''
  };
};


export const ListBoxAria = (props) => {
  const {children, ...restProps} = props
  let state = useListState({...restProps, children})

  let ref = useRef(null)
  let {listBoxProps, labelProps} = useListBox({...props,},
    state,
    ref
  )


  return (
    <>
      <div {...labelProps}>{props.label}</div>
      <div {...listBoxProps} ref={ref} className={props.className}>
        {React.Children.map(children, (child) => {
          return React.cloneElement(child, {
            state,
            ...child.props,
          })
        })}
      </div>
    </>
  )
}


