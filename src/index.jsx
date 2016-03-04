import './styles.css'

import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { combineReducers, createStore } from 'redux'


// reducers

const todo = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      }
    case 'TOGGLE_TODO':
      if (state.id !== action.id) {
        return state
      }

      return {
        ...state,
        completed: !state.completed
      }
    default:
      return state
  }
}

export const todos = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        todo(undefined, action)
      ]
    case 'TOGGLE_TODO':
      return state.map((t) => todo(t, action))
    default:
      return state
  }
}

export const visibilityFilter = (state = 'SHOW_ALL', action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter
    default:
      return state
  }
}


// store

const todoApp = combineReducers({ todos, visibilityFilter })
const store = createStore(todoApp)


// components

const FilterLink = ({ filter, children }) => (
  <a href="#" onClick={
      e => {
        e.preventDefault()
        store.dispatch({ type: 'SET_VISIBILITY_FILTER', filter })
      }
    }
  >
    {children}
  </a>
)
FilterLink.propTypes = {
  filter: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
}

let nextTodoId = 0
class TodoApp extends Component {
  static propTypes = {
    todos: PropTypes.array.isRequired
  }

  render() {
    return (
      <div>
        <input ref={node => {this.input = node}}/>
        <button
          onClick={() => {
            store.dispatch({
              type: 'ADD_TODO',
              text: this.input.value,
              id: nextTodoId++
            })
            this.input.value = ''
          }}
        >
          Add Todo
        </button>
        <ul>
          {
            this.props.todos
              .filter(td => {
                switch (store.getState().visibilityFilter) {
                  case 'SHOW_COMPLETED':
                    return !!td.completed
                  case 'SHOW_ACTIVE':
                    return !td.completed
                  default:
                    return true
                }
              })
              .map(td =>
                <li
                  key={td.id}
                  onClick={() => store.dispatch({
                    type: 'TOGGLE_TODO',
                    id: td.id
                  })}
                  style={{
                    textDecoration: td.completed ? 'line-through' : 'none'
                  }}
                >
                  {td.text}
                </li>)
          }
        </ul>
        <p>
          Show:
          {' '}<FilterLink filter="SHOW_ALL">All</FilterLink>
          {' '}<FilterLink filter="SHOW_ACTIVE">Active</FilterLink>
          {' '}<FilterLink filter="SHOW_COMPLETED">Completed</FilterLink>
        </p>
      </div>
    )
  }
}


// render

const app = document.createElement('div')
document.body.appendChild(app)

const render = () => {
  ReactDOM.render(<TodoApp todos={store.getState().todos}/>, app)
}

store.subscribe(render)
render()
