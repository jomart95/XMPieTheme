class Location {
  constructor () {
    this.location = window.location
    this._custom = null
  }

  set custom (location) {
    this._custom = location ? new URL(location) : null
  }

  get href () {
    return this._custom?.href || this.location.href
  }

  set href (value) {
    if (this._custom) {
      this._custom = new URL(value)
      return
    }
    this.location.href = value
  }

  get protocol () {
    return this._custom?.protocol || this.location.protocol
  }

  get host () {
    return this._custom?.host || this.location.host
  }

  get hostname () {
    return this._custom?.hostname || this.location.hostname
  }

  get port () {
    if (this._custom) {
      return this._custom?.port
    }
    return this.location.port
  }

  get pathname () {
    return this._custom?.pathname || this.location.pathname
  }

  get search () {
    return this._custom?.search || this.location.search
  }

  get hash () {
    return this._custom?.hash || this.location.hash
  }

  get origin () {
    return this._custom?.origin || this.location.origin
  }

  assign (url) {
    if (this._custom) {
      this._custom.assign(url)
      return
    }
    this.location.assign(url)
  }

  replace (url) {
    if (this._custom) {
      this._custom.href = url
      return
    }
    this.location.replace(url)
  }

  reload () {
    if (this._custom) {
      this._custom.reload()
      return
    }
    this.location.reload()
  }
}

const location = new Location()

export default location
