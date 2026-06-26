
export const Overlay = ({ type, children, props }) => {
  return <div className="overlay" data-overlay-type={type} {...props}>
    {children}
  </div>
}
