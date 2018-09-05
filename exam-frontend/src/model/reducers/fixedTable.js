import { SET_FIXED_TABLE, INIT_FIXED_TABLE } from '../action/actionType';
const table = (state = {}, action) => {
  switch (action.type) {
    case SET_FIXED_TABLE:
      return {
        ...action.data
      }
    case INIT_FIXED_TABLE:
      return{

      }
    default:
      return{
        ...state
      }
  }
}
export default table