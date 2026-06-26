import React, { useState, useEffect } from 'react';
import { useMenuTrigger } from 'react-aria';

export const MenuTrigger = ({ children, isOpen, onOpenChange }) => {
  const [open, setOpen] = useState(isOpen)
  const {menuTriggerProps ,menuProps} = useMenuTrigger({ trigger: 'press', type:'menu' },{ isOpen })

  useEffect(() => {
    setOpen(isOpen)
  }, [isOpen])

  return <div {...menuProps} {...menuTriggerProps} onClick={(e) => {
    onOpenChange(!open);
    setOpen(!open)
  }}>
    {children}
  </div>
}
