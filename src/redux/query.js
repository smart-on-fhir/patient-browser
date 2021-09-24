import { createAction, handleActions } from "redux-actions"
import PatientSearch from "../lib/PatientSearch"
import {
    parseQueryString,
    getBundleURL
} from "../lib"

export const queryBuilder = new PatientSearch(
    parseQueryString(window.location.hash.split("?")[1] || "")
);

/**
 * The initial state is just an empty object that will be filled
 * with query parameters.
 */
const INITIAL_STATE = {
    ...queryBuilder.getState(),
    loading: false,
    error  : null,
    bundle : null
}

// Private action constants
const SET_LOADING      = "app/search/SET_LOADING"
const SET_ERROR        = "app/search/SET_ERROR"
const SET_DATA         = "app/search/SET_DATA"
const SET_MIN_AGE      = "app/search/SET_MIN_AGE"
const SET_MAX_AGE      = "app/search/SET_MAX_AGE"
const SET_AGE_GROUP    = "app/search/SET_AGE_GROUP"
const ADD_CONDITION    = "app/search/ADD_CONDITION"
const DEL_CONDITION    = "app/search/DEL_CONDITION"
const ADD_TAG          = "app/search/ADD_TAG"
const DEL_TAG          = "app/search/DEL_TAG"
const SET_CONDITIONS   = "app/search/SET_CONDITIONS"
const SET_GENDER       = "app/search/SET_GENDER"
const SET_PARAM        = "app/search/SET_PARAM"
const SET_QUERY_STRING = "app/search/SET_QUERY_STRING"
const SET_QUERY_TYPE   = "app/search/SET_QUERY_TYPE"
const SET_SORT         = "app/search/SET_SORT"
const SET_TAGS         = "app/search/SET_TAGS"
const SET_LIMIT        = "app/search/SET_LIMIT"


// Create (and export) the redux actions ---------------------------------------
export const setLoading     = createAction(SET_LOADING)
export const setError       = createAction(SET_ERROR)
export const setData        = createAction(SET_DATA)
export const setMinAge      = createAction(SET_MIN_AGE)
export const setMaxAge      = createAction(SET_MAX_AGE)
export const setAgeGroup    = createAction(SET_AGE_GROUP)
export const addCondition   = createAction(ADD_CONDITION)
export const delCondition   = createAction(DEL_CONDITION)
export const setConditions  = createAction(SET_CONDITIONS)
export const setGender      = createAction(SET_GENDER)
export const setParam       = createAction(SET_PARAM)
export const setQueryString = createAction(SET_QUERY_STRING)
export const setQueryType   = createAction(SET_QUERY_TYPE)
export const setSort        = createAction(SET_SORT)
export const addTag         = createAction(ADD_TAG)
export const delTag         = createAction(DEL_TAG)
export const setTags        = createAction(SET_TAGS)
export const setLimit       = createAction(SET_LIMIT)


export const fetch = function() {
    return (dispatch, getState) => {
        dispatch(setLoading(true))
        dispatch(setError(null))
        const { settings } = getState()
        queryBuilder.fetch(settings.server).then(
            bundle => {
                dispatch(setData(bundle))
                dispatch(setLoading(false))
            },
            function(error) {
                dispatch(setError(error))
                dispatch(setLoading(false))
            }
        )
    }
}

export const goNext = function() {
    return (dispatch, getState) => {
        const { bundle } = getState().query;
        let url = getBundleURL(bundle, "next");
        if (url) {
            url = parseQueryString(url);
            queryBuilder.setOffset(url._getpages, +url._getpagesoffset);
            queryBuilder.setPage(url._page);
            dispatch(fetch());
        }
    }
}

export const goPrev = function() {
    return (dispatch, getState) => {
        const { bundle } = getState().query;
        let url = getBundleURL(bundle, "previous");
        if (url) {
            url = parseQueryString(url);
            queryBuilder.setOffset(url._getpages, +url._getpagesoffset);
            queryBuilder.setPage(url._page);
            dispatch(fetch());
        }
    }
}




// Export the reducer as default
export default handleActions({

    [SET_SORT]: (state, action) => {
        queryBuilder.setSort(action.payload)
        return { ...state, ...queryBuilder.getState() }
    },

    [SET_QUERY_STRING]: (state, action) => {
        queryBuilder.setQueryString(action.payload)
        return { ...state, ...queryBuilder.getState() }
    },

    [SET_QUERY_TYPE]: (state, action) => {
        queryBuilder.setQueryType(action.payload)
        return { ...state, ...queryBuilder.getState() }
    },

    [SET_PARAM]: (state, action) => {
        queryBuilder.setParam(action.payload.name, action.payload.value)
        return { ...state, ...queryBuilder.getState() }
    },

    [SET_MIN_AGE]: (state, action) => {
        queryBuilder.setMinAge(action.payload)
        return { ...state, ...queryBuilder.getState() }
    },

    [SET_MAX_AGE]: (state, action) => {
        queryBuilder.setMaxAge(action.payload)
        return { ...state, ...queryBuilder.getState() }
    },

    [SET_AGE_GROUP]: (state, action) => {
        queryBuilder.setAgeGroup(action.payload)
        return { ...state, ...queryBuilder.getState() }
    },

    [ADD_CONDITION]: (state, action) => {
        queryBuilder.addCondition(action.payload.key, action.payload.value)
        return { ...state, ...queryBuilder.getState() }
    },

    [SET_CONDITIONS]: (state, action) => {
        queryBuilder.setConditions(action.payload)
        return { ...state, ...queryBuilder.getState() }
    },

    [DEL_CONDITION]: (state, action) => {
        queryBuilder.removeCondition(action.payload)
        return { ...state, ...queryBuilder.getState() }
    },

    [ADD_TAG]: (state, action) => {
        queryBuilder.addTag(action.payload)
        return { ...state, ...queryBuilder.getState() }
    },

    [DEL_TAG]: (state, action) => {
        queryBuilder.removeTag(action.payload)
        return { ...state, ...queryBuilder.getState() }
    },

    [SET_TAGS]: (state, action) => {
        queryBuilder.setTags(action.payload)
        return { ...state, ...queryBuilder.getState() }
    },

    [SET_GENDER]: (state, action) => {
        queryBuilder.setGender(action.payload)
        return { ...state, ...queryBuilder.getState() }
    },

    [SET_LIMIT]: (state, action) => {
        queryBuilder.setLimit(action.payload)
        return { ...state, ...queryBuilder.getState() }
    },

    /**
     * Sets the loading state of the query
     */
    [SET_LOADING]: (state, action) => ({
        ...state,
        ...queryBuilder.getState(),
        loading: !!action.payload
    }),

    /**
     * Sets the error state of the query
     */
    [SET_ERROR]: (state, action) => ({
        ...state,
        ...queryBuilder.getState(),
        error: action.payload
    }),

    /**
     * Sets the data fetched by the query
     */
    [SET_DATA]: (state, action) => ({
        ...state,
        ...queryBuilder.getState(),
        bundle: action.payload
    })

}, INITIAL_STATE)
