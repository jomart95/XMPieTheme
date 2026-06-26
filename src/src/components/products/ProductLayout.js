import './ProductLayout.scss'
import { PDFViewerProvider } from './upload/PDFViewerContext'

/**
 * A component that is loaded for displaying a product of type Kit
 *
 * @param {string} className -the class name to be added to the main container
 *
 * @param children
 */

const ProductLayout = ({ className, children, dynamic, upload, isUEdit }) => {
  if (!children) {
    return null
  }

  return <div className={`${className} product-layout`}>
    <div className={`main-wrapper ${dynamic || upload ? 'dynamic' : 'static'} ${isUEdit ? 'uedit' : ''} ${upload ? 'easy-upload' : ''}`}>
      <PDFViewerProvider>
      <div className='left'>
        {children.find((child) => { return child.type === 'left' })}
      </div>
      <div className='right'>
        {children.find((child) => { return child.type === 'right' })}
      </div>
      </PDFViewerProvider>
    </div>
  </div>
}

export default ProductLayout
