import { createAction, handleActions } from "redux-actions"
import INITIAL_STATE                   from "../config.default.js"
import mixinDeep from "mixin-deep";

// Private action constants
const MERGE                = "app/settings/MERGE"
const REPLACE              = "app/settings/REPLACE"
const RENDER_SELECTED_ONLY = "app/settings/RENDER_SELECTED_ONLY"

// Create (and export) the redux actions
export const merge            = createAction(MERGE)
export const replace          = createAction(REPLACE)
export const showSelectedOnly = createAction(RENDER_SELECTED_ONLY)

// Export the reducer as default
export default handleActions({

    [MERGE]: (state, action) => mixinDeep(state, action.payload, { loaded: true }),

    [RENDER_SELECTED_ONLY]: (state, action) => ({
        ...state,
        renderSelectedOnly: !!action.payload
    }),

    // Replace the entire state (useful for testing)
    [REPLACE]: (_, action) => ({ ...action.payload })
}, INITIAL_STATE)
