
type Identifier = number | string | FormDataEntryValue
type Loop<T extends Record<string, unknown>> = {
  [K in keyof T]: T[K]
}

export class DummyDb<T extends Record<string, unknown>> {
  data: Record<number, T>
  snapshot: Record<number, T>
  constructor (
    data: Record<number, T> | T[]
  ) {
    this.data = Array.isArray(data) ? data.reduce((acc, value, index) => ({ ...acc, [index + 1]: value }), {}) : data
    this.snapshot = Object.assign({}, this.data)
  }
  reset () {
    this.data = this.snapshot
    return this.snapshot
  }
  cleanId (id: Identifier) {
    if (id instanceof File) throw new Error('id cannot be a file')
    return typeof id === 'number' ? id : parseInt(id)
  }
  remove (id: Identifier) {
    const numberId = this.cleanId(id)
    delete this.data[numberId]
    return numberId
  }
  find (id: Identifier) {
    const numberId = this.cleanId(id)
    const value = this.data[numberId]
    if (value) {
      return { id: numberId, ...value }
    }
    throw new Error(`Not found ${id}`)
  }
  update (id: Identifier, payload: Loop<T>) {
    const numberId = this.cleanId(id)
    if (numberId in this.data) {
      this.data[numberId] = payload as T
      return {id: numberId, ...payload}
    } 
    throw new Error(`Not found ${id}`)
  }
  updateOrFind (id: Identifier, payload?: Loop<T> | null) {
    const numberId = this.cleanId(id)
    if ((numberId in this.data) && payload) {
      return this.update(numberId, payload)
    } 
    return this.find(id)
  }
  all () {
    return Object.entries(this.data).map(([id, value]) => ({ id: parseInt(id), ...value }))
  }
  setValue (id: Identifier, key: keyof T, value: T[keyof T]) {
    const numberId = this.cleanId(id)
    if (this.data[numberId]) {
      this.data[numberId][key] = value
      return this.data[numberId]
    }
    throw new Error(`Not found ${id}`)
  }
}
