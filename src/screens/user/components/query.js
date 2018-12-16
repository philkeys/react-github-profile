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
  // Note - useEffect is called every time our component is updated.
  useEffect(() => {
    if (isEqual(previousInputs.current, [query, variables])) {
      return
    }
    setState({fetching: true})
    client
      .request(query, variables)
      .then(res =>
        setState({
          data: normalize(res),
          error: null,
          loaded: true,
          fetching: false,
        }),
      )
      .catch(error =>
        setState({
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
