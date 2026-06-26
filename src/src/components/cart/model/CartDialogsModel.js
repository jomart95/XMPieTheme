import {
  action,
  makeObservable,
  observable
} from 'mobx'

class CartDialogsModel {
  constructor() {
    this.revertModifications = false

    makeObservable(this, {
      revertModifications: observable,
      setRevertModifications: action
    })

  }
  setRevertModifications(value){
    this.revertModifications = value
  }

}

export default CartDialogsModel
