export const assertFormEntriesString = (items: { [k: string]: FormDataEntryValue }): { [k: string]: string } => {
  return Object.fromEntries(Object.entries(items).map(([key, formValue]) => {
    if (typeof formValue === "string") {
      return [key, formValue]
    }
    return []
  }))
}

export const stringFormData = async (request: Request) => {
  const reqFormData = await request.formData()
  const entries = reqFormData.entries()
  const items = Object.fromEntries(entries)
  const stringItems = assertFormEntriesString(items)
  return stringItems
}
