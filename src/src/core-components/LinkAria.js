import React from 'react'
import { Link } from 'react-aria-components'
import location from '$ustoreinternal/services/locationProvider'

/**
 * Renders a Link component with ARIA attributes for accessibility.
 *
 * @param {React.ReactNode} children - The content to be rendered inside the Link component.
 * @param {string} to - The URL to navigate to when the Link is clicked.
 * @param {boolean} reloadDocument - Whether to reload the document when the Link is clicked.
 * @param {boolean} disabled - Whether the Link is disabled.
 * @param {Object} restProps - Additional properties to be spread onto the Link component, excluding `to`, `reloadDocument`, and `children`.
 * @return {ReactElement} The rendered Link component.
 */

const LinkAria = ({ children, to, reloadDocument, disabled, ...restProps }) => {

  const navigateWithReloading = () => {
    location.href = to
  }

  return (
    <Link
      href={to}
      onPress={reloadDocument ? navigateWithReloading : undefined}
      isDisabled={disabled}
      {...restProps}
    >
      {children}
    </Link>
  )
}

export default LinkAria
