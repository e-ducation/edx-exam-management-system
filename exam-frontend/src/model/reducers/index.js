import { combineReducers } from 'redux'
import fixedTable from './fixedTable'
import randomTable from './randomTable'
// import visibilityFilter from './visibilityFilter'

const reducer = combineReducers({
  fixedTable,
  randomTable,
})
// console.log(todoApp)
export default reducer