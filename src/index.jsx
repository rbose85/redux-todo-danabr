import './styles.css'

import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { combineReducers, createStore } from 'redux'
import { connect, Provider } from 'react-redux'
import * as reducers from './reducers'


// action creators

let nextTodoId = 0
const addTodo = text => ({
  type: 'ADD_TODO',
  id: nextTodoId++,
  text
})

const setVisibilityFilter = filter => ({
  type: 'SET_VISIBILITY_FILTER',
  filter
})

const toggleTodo = id => ({
  type: 'TOGGLE_TODO',
  id
})


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

const mapStateToLinkProps = (state, ownProps) => ({
  isActive: ownProps.filter === state.visibilityFilter
})
const mapDispatchToLinkProps = (dispatch, ownProps) => ({
  onClick: () => dispatch(setVisibilityFilter(ownProps.filter))
})
const FilterLink = connect(
  mapStateToLinkProps, mapDispatchToLinkProps
)(Link)

const Footer = () => (
  <p>
    Show:
    {' '}<FilterLink filter="SHOW_ALL">All</FilterLink>
    {' '}<FilterLink filter="SHOW_ACTIVE">Active</FilterLink>
    {' '}<FilterLink filter="SHOW_COMPLETED">Completed</FilterLink>
  </p>
)

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

let AddTodo = ({ dispatch }) => {
  let input

  const addClick = () => {
    dispatch(addTodo(input.value))
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
  dispatch: PropTypes.func.isRequired
}
AddTodo = connect()(AddTodo)

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

const mapStateToTodoListProps = state => ({
  todos: getVisibleTodos(state.todos, state.visibilityFilter)
})
const mapDispatchToTodoListProps = dispatch => ({
  onTodoClick: id => dispatch(toggleTodo(id))
})
const VisibleTodoList = connect(
  mapStateToTodoListProps, mapDispatchToTodoListProps
)(TodoList)

const TodoApp = () => (
  <div>
    <AddTodo/>
    <VisibleTodoList/>
    <Footer/>
  </div>
)


// store

const todoApp = combineReducers({
  todos: reducers.todos,
  visibilityFilter: reducers.visibilityFilter
})


// render

const app = document.createElement('div')
document.body.appendChild(app)

ReactDOM.render(
  <Provider store={createStore(todoApp)}>
    <TodoApp/>
  </Provider>,
  app
)
