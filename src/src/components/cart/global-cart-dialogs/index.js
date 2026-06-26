import React from 'react'
import {observer} from 'mobx-react-lite'
import RevertModificationDialog from './RevertModificationDialog'
import LoadingDialog from '../LoadingDialog'
import DuplicateProgressDialog from '../duplucate/DuplicateProgressDialog'


const CartDialogs = ({model}) => {

  if (!model) return null

  return (
    <>
      <LoadingDialog open={model?.loading ?? false}/>
      <DuplicateProgressDialog model={model}/>
      {model._cartDialogs.revertModifications && <RevertModificationDialog closeDialog={() => model._cartDialogs.setRevertModifications(false)}/>}
    </>
  )
}


export default observer(CartDialogs)

