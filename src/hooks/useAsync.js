import { useState, useEffect, useCallback } from 'react'
export default function useAsync(fn, deps = []) {
  const [s, set] = useState({ data: null, error: null, loading: true })
  const run = useCallback(() => {
    let live = true
    set((x) => ({ ...x, loading: true, error: null }))
    fn().then((data) => live && set({ data, error: null, loading: false })).catch((e) => live && set({ data: null, error: e.message, loading: false }))
    return () => { live = false }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => run(), [run])
  return { ...s, reload: run }
}
