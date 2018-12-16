import {useContext, useReducer, useEffect, useRef} from 'react'
import PropTypes from 'prop-types'
import isEqual from 'lodash/isEqual'
import {Context} from '../../../github-client'

function Query({query, variables, children, normalize = data => data}) {
  const client = useContext(Context)
  const [state, setState] = useReducer(
    (state, newState) => ({...state, ...newState}),
    {loaded: false, fetching: false, data: null, error: null},
  )

  const mountedRef = useRef(false)
  // Note - We only want to run this when the component is mounted, and when the component is unmounted
  useEffect(() => {
    // useEffect is called when mounted (and whenever component is updated)
    mountedRef.current = true
    // Cleanup function
    return () => (mountedRef.current = false)
  }, [])
  // Note - Above we pass in the input Array with NO INPUTS, thus they will never change and it will only be run ONCE

  // Using the above mountedRef, we'll determine when we should update State
  const safeSetState = (...args) => mountedRef.current && setState(...args)

  // Note - useEffect is called every time our component is updated.
  useEffect(() => {
    if (isEqual(previousInputs.current, [query, variables])) {
      return
    }
    setState({fetching: true})
    client
      .request(query, variables)
      .then(res =>
        safeSetState({
          data: normalize(res),
          error: null,
          loaded: true,
          fetching: false,
        }),
      )
      .catch(error =>
        safeSetState({
          error,
          data: null,
          loaded: false,
          fetching: false,
        }),
      )
  })

  const previousInputs = useRef()
  useEffect(() => {
    previousInputs.current = [query, variables]
  })

  return children(state)
}

Query.propTypes = {
  query: PropTypes.string.isRequired,
  variables: PropTypes.object,
  children: PropTypes.func.isRequired,
  normalize: PropTypes.func,
}

export default Query
