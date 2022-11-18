export const alice = (location: string) => {
  const message = `alice goes to ${location}`
  console.log(message)
  alert(message)
}

export const bob = (location: string) => {
  const message = `bob goes to ${location}`
  console.log(message)
  alert(message)
}

export const nested = {
  meow: (name: string) => {
    const message = `cat goes to ${name}`
    console.log(message)
    alert(message)
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