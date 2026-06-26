import { useRef} from 'react'
import {usePopover, useOverlayPosition} from 'react-aria'
import {useOverlayTriggerState} from 'react-stately';

export const PopoverAria = ({children, state, offset = 0, triggerRef,overlayRef, className,...props}) => {
 const popoverRef = useRef(null);

  let overlayState = useOverlayTriggerState(props);
  if (state) {
    overlayState = state;
  }

  let {overlayProps} = useOverlayPosition({
    targetRef: triggerRef,
    overlayRef,
    placement: 'bottom',
    offset: offset,
    isOpen: overlayState.isOpen,
  });


  let {popoverProps, underlayProps} = usePopover({
    ...props,
    offset,
    popoverRef,
    overlayRef,
    triggerRef,

  }, overlayState);

  let mergedProps = {
    ...overlayProps,
    ...popoverProps,
    style: {
      ...overlayProps.style,
      ...popoverProps.style
    }
  };

  if (!overlayState.isOpen) {
    return null;
  }
  return (
    <div className={className} {...mergedProps} ref={popoverRef}>
      <div className="underlay" {...underlayProps}/>
      {children}
    </div>

  );
}


