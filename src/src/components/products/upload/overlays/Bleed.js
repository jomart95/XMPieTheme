import { Overlay } from './Overlay'
import './Bleed.scss'
import scissors from '$assets/icons/Scissors.svg'

export const Bleed = ({ viewerState }) => {
  const { metaData } = viewerState
  const { DocumentBoxes, Height, Width } = metaData
  const { Trim, Media } = DocumentBoxes

  const showBleed = !(Trim && (Trim.Top === Media.Top || Trim.Bottom === Media.Bottom || Trim.Left === Media.Left || Trim.Right === Media.Right))

  const wrapperStyles = () => ({
    bottom: `${(Math.abs(Trim.Bottom - Media.Bottom)) / Height * 100}%`,
    left: `${Math.abs((Trim.Left - Media.Left )) / Width * 100}%`,
    top: `${(Math.abs(Trim.Top - Media.Top)) / Height * 100}%`,
    right: `${(Math.abs(Trim.Right - Media.Right)) / Width * 100}%`,
  })

  const getScissorsStyles = () => {
    const borderPosition = wrapperStyles()
    return {
      bottom: {
        bottom: `calc(${borderPosition.bottom} - 9px`,
        transform: 'rotate(180deg)',
      },
      left: {
        left: `calc(${borderPosition.left} - 12px`,
        transform: 'rotate(270deg)'
      },
      top: {
        top: `calc(${borderPosition.top} - 9px`,
      },
      right: {
        right: `calc(${borderPosition.right} - 12px`,
        transform: 'rotate(90deg)'
      }

    }
  }

  return showBleed && <Overlay type="bleed">
    <img className="scissors-top" alt="scissors" src={scissors} style={getScissorsStyles().top}/>
    <img className="scissors-righ" alt="scissors" src={scissors} style={getScissorsStyles().right}/>
    <img className="scissors-bottom" alt="scissors" src={scissors} style={getScissorsStyles().bottom}/>
    <img className="scissors-left" alt="scissors" src={scissors} style={getScissorsStyles().left}/>
    <div className="bleed-wrapper" style={wrapperStyles()}/>
  </Overlay>

}
