import { parseQueryString } from "../lib"

/**
 * The initial state is just an empty object that will be filled
 * with patient IDs as keys and booleans as values to indicate if
 * that patient is selected.
 */
const INITIAL_STATE = parseQueryString(
    location.hash.replace(/^.*\?/, "")
)


// Export the reducer as default
export default function() {
    return { ...INITIAL_STATE }
}