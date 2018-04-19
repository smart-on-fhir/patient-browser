import { createAction, handleActions } from "redux-actions"
import { setHashParam, parseQueryString, boolVal } from "../lib"

const PARAMS = parseQueryString(location.hash)
const SINGLE = boolVal(PARAMS["single-selection"])

/**
 * For the initial selection state parse the query portion of the URL hash (if
 * any). Note that this is not enough! The hash query can provide list of
 * patient IDs but we initialize them as true. Later they should be updated to
 * contain actual patient objects instead of true!
 */
let initialSelection = {};
(PARAMS._selection || "").split(/\s*,\s*/).forEach(k => {
    if (k) {

        // In single mode the last id will become the selected one!
        if (SINGLE) {
            initialSelection = {
                [k]: true
            };
        }
        else {
            initialSelection[k] = true;
        }
    }
})

/**
 * The initial state is just an empty object that will be filled
 * with patient IDs as keys and booleans as values to indicate if
 * that patient is selected.
 */
const INITIAL_STATE = { ...initialSelection }

// Private action constants
const TOGGLE  = "app/selection/TOGGLE"
const SET_ALL = "app/selection/SET_ALL"

// Create (and export) the redux actions
export const toggle = createAction(TOGGLE)
export const setAll = createAction(SET_ALL)

/**
 * Update the "_selection" hash parameter whenever the selection changes
 * @param {Object} selection The selection to set
 */
function setHashSelection(selection) {
    setHashParam(
        "_selection",
        Object.keys(selection).filter(
            k => selection.hasOwnProperty(k) && !!selection[k]
        ).join(",")
    )
}

// Export the reducer as default
export default handleActions({

    /**
     * Toggle the selected state of action.payload.id
     */
    [TOGGLE]: (state, action) => {
        let id = String(action.payload.id);
        let newState = {
            [id]: state[id] ? false : action.payload
        };

        if (!SINGLE) {
            newState = { ...state, ...newState }
        }
        setHashSelection(newState)
        return newState
    },

    /**
     * Set the entire selection. Useful if an initial selection
     * needs to be provided from the host application.
     */
    [SET_ALL]: (_, action) => {
        let newState = { ...action.payload }
        setHashSelection(newState)
        return newState
    }

}, INITIAL_STATE)
