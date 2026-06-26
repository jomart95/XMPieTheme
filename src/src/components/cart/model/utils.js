import { formatNumByLocale } from '$ustoreinternal/services/utils'
import moment from 'moment'
import themeContext from '$ustoreinternal/services/themeContext'
import {getLocaleDateString, getLocaleTimeString} from '$ustoreinternal/services/locale'

export const formatForCurrencyAndCulture = (amount, formatParams) => {
  const { currencyFormat, symbol, decimalPlaces, decimalSeparator } = formatParams
  // split the amount to Integer and floating, apply toFixed(decimalPlaces) to get correct amount of digits.
  const [intAmount, floating] = amount.toFixed(decimalPlaces).toString().split('.') // in case of decimalPlaces == 0, the 'floating' const will be undefined.

  return currencyFormat
    .replace(/{Symbol}/g, symbol)
    // format the given amount to a string according to passed culture definitions
    // apply the formatNumByLocale function only on the Integer part of the amount, and add the floating part only if exist.
    // only show decimalSeparator if floating exist  (in case of decimalPlaces == 0, the 'floating' const will be undefined)
    .replace(/{Amount}/g, formatNumByLocale(intAmount, formatParams.languageCode) + (floating ? decimalSeparator + floating : ''))
}

export const formatDate = (dateStr) => {
  const locale = themeContext.get('languageCode')
  return dateStr ? moment(dateStr).format(`${getLocaleDateString(locale)} ${getLocaleTimeString(locale)}`): null
}
