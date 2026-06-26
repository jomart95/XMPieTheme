import { Overlay } from './Overlay'

export const BindingSide = (property, key) => <Overlay key={key} type="binder" props={{ 'data-binder-side': property.value }}/>
