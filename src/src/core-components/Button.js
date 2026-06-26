/**
 * Component for button in the system
 *
 * @param {string} text - the text on the button
 * @param {function} onClick - a function to call when the button was clicked
 * @param {string} [className] - a class name to place on button element
 * @param {boolean} [isLoading] - if true the ui will show LoadingDots instead of the text
 * @param {boolean} [disabled] - if true the ui will show a disabled button
 */
import LoadingDots from './LoadingDots'
import { forwardRef } from 'react'

const Button = forwardRef(({ text, onClick, className, isLoading, disabled, children }, ref) => {
  return (
    <div disabled={disabled}
      className={`${className} button truncate `}
      onClick={(e) => !disabled && onClick(e)}
      ref={ref}
    >
      {children ? children :
          <>
            <span className={`${isLoading ? 'text-hidden' : ''}`}>{text}</span>
            {isLoading && <LoadingDots/>

            }
          </>}
    </div>
  )
})

export default Button
