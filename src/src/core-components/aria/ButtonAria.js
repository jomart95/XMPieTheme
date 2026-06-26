import LoadingDots from '../LoadingDots'
import React, {useRef, forwardRef, useEffect} from 'react';

const ButtonAria = forwardRef((props, ref) => {
  const {text, onClick, className = '', isLoading, disabled, onPress, noTruncate} = props
  const buttonRef = useRef(null);
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(buttonRef.current);
      } else {
        ref.current = buttonRef.current;
      }
    }
  }, [ref]);

  const buttonProps = {
    onClick: () => {
      if (onClick) {
        onClick()
        return
      }
      if (onPress) {
        onPress()
      }
    }
  }


  return (
    <button {...{...buttonProps, className: `${className} button ${noTruncate ? '' : 'truncate'}`}} ref={buttonRef}
            disabled={disabled}>
      {props.children ? props.children :
        <>
          <span className={`${isLoading ? 'text-hidden' : ''}`}>{text}</span>
          {isLoading && <LoadingDots/>}
        </>
      }
    </button>
  )
})


export default ButtonAria
