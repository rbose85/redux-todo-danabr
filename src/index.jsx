import './styles.css'

import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { combineReducers, createStore } from 'redux'
import * as reducers from './reducers'


// store

const todoApp = combineReducers({
  todos: reducers.todos,
  visibilityFilter: reducers.visibilityFilter
})
const store = createStore(todoApp)


// components
const Link = ({ isActive, children, onClick }) => {
  const handler = e => {
    e.preventDefault()
    onClick()
  }

  return isActive ? <span>{children}</span> : (
    <a href="#" onClick={handler}>{children}</a>
  )
}
Link.propTypes = {
  isActive: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired
}

class FilterLink extends Component {
  componentDidMount() {
    this.unsubscribe = store.subscribe(() => this.forceUpdate())
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    const props = this.props
    const state = store.getState()

    return (
      <Link
        isActive={props.filter === state.visibilityFilter}
        onClick={ () =>
          store.dispatch({
            type: 'SET_VISIBILITY_FILTER',
            filter: props.filter
          })
        }
      >
        {props.children}
      </Link>
    )
  }
}

const Footer = () => (
  <p>
    Show:
    {' '}<FilterLink filter="SHOW_ALL">All</FilterLink>
    {' '}<FilterLink filter="SHOW_ACTIVE">Active</FilterLink>
    {' '}<FilterLink filter="SHOW_COMPLETED">Completed</FilterLink>
  </p>
)
Footer.propTypes = {
  visibilityFilter: PropTypes.string.isRequired,
  onFilterClick: PropTypes.func.isRequired
}

const Todo = ({ onClick, completed, text }) => (
  <li
    onClick={onClick}
    style={{ textDecoration: completed ? 'line-through' : 'none' }}
  >
    {text}
  </li>
)
Todo.propTypes = {
  onClick: PropTypes.func.isRequired,
  completed: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired
}

const TodoList = ({ todos, onTodoClick }) => (
  <ul>
    {
      todos.map(todo =>
        <Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)}/>
      )
    }
  </ul>
)
TodoList.propTypes = {
  todos: PropTypes.array.isRequired,
  onTodoClick: PropTypes.func.isRequired
}

const AddTodo = ({ onAddClick }) => {
  let input
  const addClick = () => {
    onAddClick(input.value)
    input.value = ''
  }

  return (
    <div>
      <input ref={node => {input = node}}/>
      <button onClick={addClick}>Add Todo</button>
    </div>
  )
}
AddTodo.propTypes = {
  onAddClick: PropTypes.func.isRequired
}

const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos
    case 'SHOW_ACTIVE':
      return todos.filter(todo => !todo.completed)
    case 'SHOW_COMPLETED':
      return todos.filter(todo => !!todo.completed)
    default:
      return []
  }
}

let nextTodoId = 0
const TodoApp = ({ todos, visibilityFilter }) => (
  <div>
    <AddTodo
      onAddClick={text =>
          store.dispatch({ type: 'ADD_TODO', id: nextTodoId++, text })
        }
    />
    <TodoList
      todos={getVisibleTodos(todos, visibilityFilter)}
      onTodoClick={id => store.dispatch({ type: 'TOGGLE_TODO', id })}
    />
    <Footer/>
  </div>
)
TodoApp.propTypes = {
  todos: PropTypes.array.isRequired,
  visibilityFilter: PropTypes.string.isRequired
}


// render

const app = document.createElement('div')
document.body.appendChild(app)

const render = () => {
  ReactDOM.render(<TodoApp {...store.getState()}/>, app)
}

store.subscribe(render)
render()
