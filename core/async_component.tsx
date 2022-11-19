import { JSX } from 'preact'

type Props = Record<string, unknown>
type Context = Record<string, unknown>
type AsyncComponent<P extends Props, C extends Context> = (props: P, ctx: C) => Promise<JSX.Element> | JSX.Element
type SyncComponent<P extends Props, C extends Context> = (props: P, ctx: C) => JSX.Element

/** AsyncComponent allows for you to still call <Component/> without acknowledging it's a promise. */
export function asyncComponent <P extends Props, C extends Context>(component: AsyncComponent<P, C>): SyncComponent<P, C> {
  return component as SyncComponent<P, C>
}
