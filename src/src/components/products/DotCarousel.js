import React, { useCallback, useEffect, useState } from 'react'
import './DotCarousel.scss'


const REGULAR = 'regular-dot'
const PADDING = 8
const REGULAR_WIDTH = 8
const SMALLEST = 'smallest-dot'

const DotCarousel = (props) => {
    const {images, active, onDotClick, disabled} = props
    const [currentDotsSet, setCurrentDotsSet] = useState([])

    const moveBack = (dots) => {
        if (active < 4) {
            setStartPosition(dots)
        } else {
            images.forEach((img, i) => {
                if (i > active - 4 && dots.length < 5) {
                    dots.push({
                        class: !dots.length || dots.length === 4 ? SMALLEST : REGULAR,
                        id: i,
                        active: i === active
                    })
                }
            })
        }
    }

    const moveForward = (dots) => {
            images.forEach((image, i) => {
                if (dots.length < 5 && i >= active - 1) {
                    dots.push({
                        class: ((i === active - 1) || (dots.length === 4 && i !== images.length - 1)) ? SMALLEST : REGULAR,
                        id: i,
                        active: i === active
                    })
                }
            })
    }

    const updateCurrentDotsSet = (dots) => {
        currentDotsSet.forEach((dot, i) => {
            dot.active = dot.id === active
            dots.push(dot)
        })
    }

    const setStartPosition = (dots) => {
        images.forEach((image, i) => {
            if (i < 4 && active < 4) {
                dots.push({class: REGULAR, id: i, active: i === active})
            }
            if (i === 4 && active < 4) {
                dots.push({class: images.length > 5 ? SMALLEST : REGULAR, id: i, active: i === active})
            }
        })
    }

    const setEndPosition = (dots) => {
        for (let i = images.length - 1; dots.length < 5; i--) {
            dots.unshift({class: dots.length === 4 ? SMALLEST : REGULAR, id: i, active: i === active})
        }
    }

    useEffect(() => {
        const dots = []
        if (active === 0) {
            setStartPosition(dots)
        }
        if (active > 0 && currentDotsSet.length) {
            const activePositionInSet = currentDotsSet.findIndex(dot => dot.id === active)
            if (activePositionInSet === 0) {
                moveBack(dots)
            }
            if (activePositionInSet === currentDotsSet.length - 1 && currentDotsSet[activePositionInSet].id !== images.length - 1) {
                moveForward(dots)
            }
            if (activePositionInSet > 0 && (activePositionInSet < currentDotsSet.length - 1 || currentDotsSet[activePositionInSet].id === images.length - 1)) {

                updateCurrentDotsSet(dots)
            }
            if (activePositionInSet === -1 && images.length - 1 === active) {
                setEndPosition(dots)
            }

        }
        setCurrentDotsSet(dots)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [images, active])

    const renderDots = useCallback(() => {
        if (images.length < 2) {
            return
        }

        return currentDotsSet.map((dot) => {
            const styles = {position: 'relative', margin: '0 4px'}

            return (
                <span
                    style={styles}
                    key={dot.id}
                    className={`dot-indicator ${dot.class} ${dot.active ? 'active' : ''}`}
                    onClick={() => {
                        if (disabled) return
                        onDotClick(dot.id)
                    }}
                />
            )
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDotsSet])

    return (
        <div className="dot-carousel-wrapper">
            <div className="dot-carousel" style={{
                height: `${REGULAR_WIDTH}px`,
                width: `${PADDING * 7 + REGULAR_WIDTH * 7}px`
            }}>
                {renderDots()}
            </div>
        </div>
    )
}

export default DotCarousel
