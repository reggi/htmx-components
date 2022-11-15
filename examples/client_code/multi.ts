export const alice = (location: string) => {
  return console.log(`alice goes to ${location}`)
}

export const bob = (location: string) => {
  return console.log(`bob goes to ${location}`)
}

export const nested = {
  meow: (name: string) => {
    return console.log(`cat goes to ${name}`)
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