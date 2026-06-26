/**
 * @function Gallery - a component which displays an array of items (childrens)
 * 
 * @param {String} [title] - The main title at the top of the component
 * @param {String} [seeAllUrl] - The link to the full gallery page
 * @param {Number} [gridRows] - The number of rows (default: 2)
 * @param {Component} children - The children components
 */

import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import memoize from "memoize-one"
import { t } from '$themelocalization'
import './Gallery.scss'

class Gallery extends Component {
	constructor(props){
    super(props)
    this.defaultGridRows = 2
    this.forceRender = false
    this.isUnmounted = false
  }

  updateRenderedChildren(){
    if(!this.isUnmounted){
      this.forceRender = true
      this.forceUpdate()
    }
  }

  componentDidMount() {
    this.updateRenderedChildren()
    window.addEventListener("resize", this.updateRenderedChildren.bind(this))
  }

  componentWillUnmount() {
    this.isUnmounted = true
    window.removeEventListener("resize", this.updateRenderedChildren.bind(this))
  }

  getItemsInRow() {
    if (!this.gallery) {
      return 0
    }
    const basis = window.getComputedStyle(this.gallery).getPropertyValue('--flex-basis').replace('%','')
    return Math.floor(100/parseInt(basis))
  }

  filterChildren(children){
    const itemsInRow = this.getItemsInRow()
    const gridRows = this.props.gridRows || this.defaultGridRows
    const itemsToShow = parseInt(itemsInRow) * parseInt(gridRows)

    return React.Children.map(children, (child, i) => {
      if (i < itemsToShow) return child
      return null
    })
  }

  filter = memoize((children) => this.filterChildren(children))

  render() {
    const { title, seeAllUrl, children } = this.props

    if (!children){
      return null
    }

    let filteredChildren = null

    if(this.forceRender){
      this.forceRender = false
      filteredChildren = this.filterChildren(children)
    }
    else{
      filteredChildren = this.filter(children)
    }

    const showSeeAll = seeAllUrl && React.Children.count(filteredChildren) < React.Children.count(children)

    return (
      <div className="gallery" ref={(ref)=>{this.gallery = ref}}>
        <div className="top">
          {
            title && <div className='main-title'>{title}</div>
          }
          {
            showSeeAll &&
            <Link className="see-all" to={seeAllUrl}>{t('Gallery.See_all_products')}</Link>
          }
        </div>
        <div className="main">
          { filteredChildren }
        </div>
        {
          showSeeAll &&
          <div className="bottom">
            <Link className="button-secondary" to={seeAllUrl}>{t('Gallery.See_all_products')}</Link>
          </div>
        }
      </div>
    )
  }
}

export default Gallery
