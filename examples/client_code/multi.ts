export const alice = (location: string) => {
  return `alice goes to ${location}`
}

export const bob = (location: string) => {
  return `bob goes to ${location}`
}

export const nested = {
  meow: (name: string) => {
    return `cat goes to ${name}`
  }
}

export class Dog {
  constructor (
    public name: string
  ) {}
}

export default function hello () {
  return true
}