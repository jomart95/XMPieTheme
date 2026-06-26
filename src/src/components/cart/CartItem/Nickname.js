import React, { useState, useRef, useEffect } from 'react'
import { t } from '$themelocalization'
import { Icon, ClickOutside } from '$core-components'
import { PromptDialog } from './PromptDialog'
import './Nickname.scss'

export const Nickname = ({ nickname, setNickname, onEditStart, onEditEnd }) => {
  const [nicknameInput, setNicknameInput] = useState(nickname)
  const [isEditing, setIsEditing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current.focus()
    }
  }, [isEditing])

  useEffect(() => {
    setNicknameInput(nickname)
  }, [nickname])

  const save = () => {
    setIsEditing(false)
    setNickname(nicknameInput)
    onEditEnd && onEditEnd()
  }

  const onClickOutside = (e) => {
    e.stopPropagation()
    if (e.target.id !== 'Shape' && e.target.tagName !== 'svg') {
      save()
    }
  }
  const onEnter = (e) => {
    if (e.key === 'Enter') {
      save()
    }
  }

  const handleEditNickname = () => {
    setIsEditing(true)
    onEditStart && onEditStart()
  }

  const onDelete = () => {
    setNicknameInput('')
    setIsEditing(false)
    setNickname('')
    onEditEnd && onEditEnd()
  }

  return (
    <>
      {nickname === '' && !isEditing &&
        <>
          <div onClick={handleEditNickname} className="nickname-edit-desktop">
            <Icon id="nickname-edit-button-icon" name="cart_nickname.svg" width="20px" height="20px" title={t('Cart.Dialog.Nickname.Add')}/>
          </div>
          <div className="nickname-edit-mobile" onClick={() => setIsDialogOpen(true)}>
            <Icon id="nickname-edit-button-icon" name="cart_nickname.svg" width="20px" height="20px"/>
          </div>
        </>
      }
      {isEditing && (
        <ClickOutside trigger={onClickOutside} className="nickname-box">
          <input
            ref={inputRef}
            className="nickname-input"
            placeholder={t('Cart.NicknamePlaceholder')}
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            onKeyDown={onEnter}
          />
          <div className="nickname-delete-desktop" onClick={onDelete}>
            <Icon name="delete.svg" width="14px" height="14px" title={t('Cart.Dialog.Nickname.Delete')}/>
          </div>
        </ClickOutside>
      )}
      {!isEditing && nickname && (
        <div className="nickname-box">
          <p className="nickname" onDoubleClick={handleEditNickname}>{nickname}</p>
          <div className="nickname-edit-desktop" onClick={handleEditNickname}>
            <Icon name="cart_edit.svg" width="14px" height="14px" title={t('Cart.Dialog.Nickname.Edit')}/>
          </div>
          <div className="nickname-edit-mobile" onClick={() => setIsDialogOpen(true)}>
            <Icon name="cart_edit.svg" width="14px" height="14px"/>
          </div>
        </div>
      )}
      {isDialogOpen && <PromptDialog
        onClose={() => {
          setIsDialogOpen(false)
        }}
        nickname={nicknameInput}
        onChange={(newNickname) => {
          setNickname(newNickname)
        }}/>}
    </>
  )
}
