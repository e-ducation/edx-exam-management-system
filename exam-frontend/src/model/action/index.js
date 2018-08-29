import { SET_FIXED_TABLE, SET_RANDOM_TABLE } from '../action/actionType';

export const setFixedTable = (data) => {
  return {
    type: SET_FIXED_TABLE,
    data,
  }
}
export const setRandomTable = (data) => {
  return {
    type: SET_RANDOM_TABLE,
    data,
  }
}