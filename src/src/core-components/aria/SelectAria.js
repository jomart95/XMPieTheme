import React, {useState, useEffect, forwardRef, useRef} from 'react';
import {useSelectState} from 'react-stately';
import {useSelect} from 'react-aria';
import {PopoverAria} from './PopoverAria';
import {ListBoxAria} from './ListBoxAria';

export const SelectAria = forwardRef((props, ref) => {
  const {children, isOpen, onSelectionChange, className, onOpenChange} = props
  const [open, setOpen] = useState(isOpen)
  const onPressRef = useRef(null);
  let state = useSelectState({isOpen});
  const {triggerProps, menuProps} = useSelect({isOpen,}, state, ref)

  useEffect(() => {
    setOpen(isOpen)
  }, [isOpen])

  const onClick = (e) => {
    const key = e.target.closest('[role="option"]')?.getAttribute('data-key')
    if (key) {
      onSelectionChange && onSelectionChange(key)
      setOpen(!open)
      onOpenChange && onOpenChange(!open)
    }
  }

  const onKeyDown = (e) => {
    onPressRef.current = e.target
  }

  const onKeyUp = (e) => {
    if (e.key === 'Escape') {
      setOpen(false)
      onOpenChange && onOpenChange(!open)
    }
    if (e.key === 'Enter' && onPressRef.current === e.target) {
      onClick(e)
    }
  }


  return <div {...menuProps} {...triggerProps} className={className} onTouchEnd={onClick} onClick={onClick} onKeyUp={onKeyUp} onKeyDown={onKeyDown} ref={ref}>
    {React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) {
        return null;
      }
      const needsState = child.type === PopoverAria || child.type === ListBoxAria;
      return React.cloneElement(child, {
        ...(needsState ? {state} : {}), ...child.props,
      });

    })}
  </div>
})
