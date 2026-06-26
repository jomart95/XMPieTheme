import {UStoreProvider} from '@ustore/core';

export const useUStoreState = () => {
  return  UStoreProvider ? UStoreProvider.state.get() : {}
}