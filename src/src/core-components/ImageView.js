import React, {useState} from 'react'
import './ImageLoader.scss'
import {TransformComponent, TransformWrapper} from "react-zoom-pan-pinch";
import {ImageLoader} from "./index";
import Zoom from "./Zoom";

const ImageView = ({zoomAllowed = false, className, src, activeImage, index, isImageZoomed, setIsImageZoomed}) => {
    const [showLoading, setShowLoading] = useState(true)
    return (
        zoomAllowed ? <div className={`image-loader ${className ? className : ''}`}>
                {showLoading && <div className="animated loading"/>}
                <TransformWrapper panning={{disabled: !isImageZoomed}} initialScale={1} wheel={{smoothStep: 0.02}}>
                        <TransformComponent>
                            <Zoom
                                className={className}
                                setShowLoading={setShowLoading}
                                src={src}
                                activeImage={activeImage}
                                index={index}
                                setIsImageZoomed={setIsImageZoomed}
                            />
                        </TransformComponent>
                </TransformWrapper>
            </div> :
            <ImageLoader
                className={className}
                setShowLoading={setShowLoading}
                src={src}
                activeImage={activeImage}
            />
    )
}
export default ImageView
