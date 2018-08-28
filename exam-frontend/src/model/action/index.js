import { SET_FIXED_TABLE, INIT_FIXED_TABLE } from '../action/actionType';

export const setFixedTable = (data) => {
  return {
    type: SET_FIXED_TABLE,
    data,
  }
}