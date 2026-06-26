import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '$core-components'
import './EmptyPage.scss'

const EmptyPage = ({
  title,
  text,
  buttonText = '',
  buttonUrl = '',
  shoppingCartText = '',
}) => {
  const navigate = useNavigate();

  return (
    <div className="no-results">
      <div className="top-section">
        <div className="title no-results-title">{title}</div>
        <div className="no-results-subtitle">{text}</div>
        {buttonText && buttonUrl ? (
          <Button className="cart-ng-empty-cart-button" text={buttonText} onClick={() => navigate('/')}/>
        ) : null}
        {shoppingCartText ? (
          <div className="shopping-cart-text" dangerouslySetInnerHTML={{__html: shoppingCartText}}/>
        ) : null}
      </div>
    </div>
  );
};

export default EmptyPage;
