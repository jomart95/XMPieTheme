import { useEffect, useRef } from 'react'
import { useNavigate} from 'react-router-dom'
import { throttle } from 'throttle-debounce'
import location from '$ustoreinternal/services/locationProvider'
import theme from '$styles/theme'
import { prependServerDomain, prependThemePath, prependAssetsPath } from '$themeservices'
import './PromotionItem.scss'

const PromotionItem = ({ imageUrl, title, subTitle, buttonText, url, className }) => {
  const promotionItem = useRef()
  const navigate = useNavigate()

  const goTo = (url) => {
    if(!url){
      return
    }
    if (url.startsWith('http')) {
      location.href = url
    }
    else {
      navigate(prependThemePath(url))
    }
  }

  useEffect(() => {
    const setButtonSize = () => {
      if(!promotionItem) {
        return
      }

      const button = promotionItem.current.querySelector('.button')
      const width = document.body.clientWidth

      if (window.matchMedia(`(max-width: ${theme.md})`).matches) {
        button.style['max-width'] = `${width - (2 * 20)}px`
      } else {
        button.style['max-width'] = ''
      }
    }

    window.addEventListener('resize', setButtonSize)
    throttle(250,  setButtonSize)
    setButtonSize()

    return () =>  window.removeEventListener('resize', setButtonSize)
  }, [])

  return (
    <div className={`promotion-item ${className || ''}`} ref={promotionItem}>
      { imageUrl && <img className="promotion-image" src={`${prependServerDomain(prependAssetsPath(imageUrl))}`} alt=""/> }
      <div className="main">
        <div className="title-area">
          <div className="title text">{title}</div>
          <div className="subtitle text">{subTitle}</div>
          <div className="button button-primary truncate" onClick={() => goTo(url)}>{buttonText}</div>
        </div>
      </div>
    </div>
  )
}

export default PromotionItem
