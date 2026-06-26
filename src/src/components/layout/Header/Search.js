import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { Input } from 'react-aria-components'
import { Icon, ButtonAria } from '$core-components'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import { useUStoreState } from '$ustoreinternal/services/hooks';
import { UStoreProvider } from '@ustore/core'
import { t } from '$themelocalization'
import './Search.scss'

const escapeValue = (value) => value ? value.replace(/[&:<>'"+*?\\/.%#|]/g, " ").trim() : ''

const Search = ({className, onClose}) => {
  const containerRef = useRef()
  const params = useParams()
  const { customState } = useUStoreState()
  const [searchValue, setSearchValue] = useState(params.page === 'search' ? params.id :  '')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (window.ga) {
      window.ga('send', 'pageview', location.pathname);
    }
  }, [location])

  useEffect(() => {
    if (className.endsWith('search-visible')) {
      containerRef?.current?.querySelector('input').focus()
    }
  },[className])

  const onSearchClicked = () => {
    let value = escapeValue(searchValue)
    if (value.length > 0) {
      UStoreProvider.state.customState.set('searchValue', value)
      navigate(urlGenerator.get({page: 'search', id: decodeURIComponent(value)}))
    }
  }

  const onKeyPress = (event) => {
    if (event.key === 'Enter') {
      onSearchClicked()
      event.preventDefault();
    }
    if (event.key === 'Escape') {
      UStoreProvider.state.customState.delete('searchValue')
      onClose && onClose()
    }
  }

  const onChange = (e) => {
    UStoreProvider.state.customState.delete('searchValue')
    setSearchValue(e.target.value)
  }

  return customState && <div className={`search ${className || ''}`} ref={containerRef}>
      <Input type="text" className="search-input form-control"
             value={searchValue}
             placeholder={t('Search.Search_Products')}
             onChange={onChange}
             onKeyUp={onKeyPress}
      />
      <ButtonAria className="search-button" onPress={onSearchClicked}>
        <div className="search-icon-container">
          <Icon name="homepage_header_search.svg" width="21px" height="21px" className="search-icon"/>
        </div>
      </ButtonAria>
  </div>

}

export default Search
