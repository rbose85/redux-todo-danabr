import './styles.css'

import React, { PropTypes } from 'react'
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

const FilterLink = ({ filter, currentFilter, children, onClick }) => {
  const handler = e => {
    e.preventDefault()
    onClick(filter)
  }
  return currentFilter === filter ? (<span>{children}</span>) : (
    <a href="#" onClick={handler}>{children}</a>
  )
}
FilterLink.propTypes = {
  filter: PropTypes.string.isRequired,
  currentFilter: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired
}

const Footer = ({ visibilityFilter, onFilterClick }) => (
  <p>
    Show:
    {' '}
    <FilterLink
      filter="SHOW_ALL"
      currentFilter={visibilityFilter}
      onClick={onFilterClick}
    >
      All
    </FilterLink>
    {' '}
    <FilterLink
      filter="SHOW_ACTIVE"
      currentFilter={visibilityFilter}
      onClick={onFilterClick}
    >
      Active
    </FilterLink>
    {' '}
    <FilterLink
      filter="SHOW_COMPLETED"
      currentFilter={visibilityFilter}
      onClick={onFilterClick}
    >
      Completed
    </FilterLink>
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
    <Footer
      visibilityFilter={visibilityFilter}
      onFilterClick={filter =>
          store.dispatch({ type: 'SET_VISIBILITY_FILTER', filter })
        }
    />
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
