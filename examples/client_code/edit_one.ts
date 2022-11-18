/// <reference lib="dom" />

import Swal from 'https://esm.sh/sweetalert2'
// @link https://htmx.org/extensions/disable-element/
import "https://unpkg.com/htmx.org@1.8.4/dist/ext/disable-element.js"

export const onClickEdit = (elm: HTMLElement, event: Event) => {
  const tbody = elm.closest('tbody')
  if (!tbody) return;
  const tbodyIsEditing = tbody.classList.contains('editing')
  if (tbodyIsEditing) {
    event.stopImmediatePropagation()
    Swal.fire({title: 'Already Editing',
      showCancelButton: true,
      confirmButtonText: 'Yep, Edit This Row!',
      text:'Hey!  You are already editing a row!  Do you want to cancel that edit and continue?'})
  } else {
    tbody.classList.add('editing')
  }
}

export const onClickCancel = (elm: HTMLElement) => {
  console.log('woof')
  elm.closest('tbody')?.classList.remove('editing')
}

export function cancelBubble(e: Event) {
  const evt = e || window.event
  if (evt.stopPropagation)    evt.stopPropagation();
  if (evt.cancelBubble!=null) evt.cancelBubble = true;
}
