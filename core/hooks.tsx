import { useContext } from "preact/hooks";
import { createContext } from "preact";

export const RequestContext = createContext(new Request('http://localhost:8000/'));
export const useRequest = () => useContext(RequestContext);

export const ComponentIdContext = createContext({ collectiveClass: '', placementId: ''});
export const useComponentId = () => {
  const { collectiveClass, placementId } = useContext(ComponentIdContext);
  const id = `${collectiveClass}${placementId}`;
  const target = `#${id}`
  const classTarget = `.${collectiveClass}`
  return { id, target, collectiveClass, classTarget, placementId }
}
