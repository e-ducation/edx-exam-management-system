import { SET_RANDOM_TABLE } from '../action/actionType';
const table = (state = [], action) => {
  switch (action.type) {
    case SET_RANDOM_TABLE:
      return [
        ...action.data
      ]
    default:
      return [
        ...state
      ]
  }
}
export default table