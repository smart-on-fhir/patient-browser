
import React from "react"
import            "./Header.less"
import {
    fetch,
    setGender,
    setAgeGroup,
    setMinAge,
    setMaxAge,
    setConditions,
    setTags,
    setParam,
    setQueryString,
    setQueryType,
    setSort
} from "../../redux/query"
import store       from "../../redux"
import TagSelector from "../TagSelector"
import AgeSelector from "../AgeSelector"
import SortWidget  from "../SortWidget"
import {
    parseQueryString,
    setHashParam
} from "../../lib"

export default class Header extends React.Component
{
    static propTypes = {
        settings : React.PropTypes.object.isRequired,
        query    : React.PropTypes.object.isRequired,
        location : React.PropTypes.object.isRequired,
        urlParams: React.PropTypes.object.isRequired
    };

    fetch(delay=500) {
        if (this.props.settings.submitStrategy == "automatic") {
            if (this.fetchDelay) {
                clearTimeout(this.fetchDelay);
            }
            this.fetchDelay = setTimeout(() => {
                store.dispatch(fetch())
            }, delay)
        }
        // else {
        //     store.dispatch(fetch())
        // }
    }

    renderAdvancedTabContents() {
        return (
            <div className="form-group">
                <p className="text-warning" style={{ padding: "0 5px 5px", margin: 0 }}>
                    <i className="fa fa-info-circle" /> In advanced mode, provide a
                    query string to browse and select from a list of matching
                    patients. <a target="_blank" href="http://hl7.org/fhir/patient.html#search">More Info...</a>
                </p>
                <form onSubmit={ e => {
                    e.preventDefault()
                    store.dispatch(fetch())
                }}>
                    <div className="input-group input-group-sm">
                        <span className="input-group-addon">/Patient?</span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Patient Search Query String"
                            name="query"
                            onChange={ e => store.dispatch(setQueryString(e.target.value)) }
                            value={ this.props.query.queryString }
                        />
                        <span className="input-group-btn">
                            <button className="btn btn-warning" type="submit">Go</button>
                        </span>
                    </div>
                </form>
            </div>
        )
    }

    renderDemographicsTabContents() {
        return (
            <form onSubmit={ e => {
                e.preventDefault()
                store.dispatch(fetch())
            }}>
                <div className="row">
                    <div className={ "**custom**" === this.props.query.ageGroup ? "col-sm-6" : "col-sm-12" }>
                        <div className="form-group">
                            {/*<label>Name:</label>*/}
                            <div className="input-group">
                                <span className="input-group-addon"><small>Name:</small></span>
                                <input
                                    type="text"
                                    className="form-control input-sm"
                                    placeholder="Search by name..."
                                    value={ this.props.query.params.name || "" }
                                    onChange={e => {
                                        store.dispatch(setParam({
                                            name : "name",
                                            value: e.target.value
                                        }))
                                        this.fetch()
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="form-group">
                            {/*<label>Gender:</label>*/}
                            <select
                                className="form-control input-sm"
                                onChange={ e => {
                                    store.dispatch(setGender(e.target.value))
                                    this.fetch()
                                }}
                                value={ this.props.query.gender || "" }
                            >
                                <option value="male">Males</option>
                                <option value="female">Females</option>
                                <option value="">Any Gender</option>
                            </select>
                        </div>
                    </div>
                    <div className={ "**custom**" === this.props.query.ageGroup ? "col-sm-12" : "col-sm-6" }>
                        <div className="form-group">
                            {/*<label>Age:</label>*/}
                            <AgeSelector
                                min={ this.props.query.minAge || { value: 0  , units: "years" } }
                                max={ this.props.query.maxAge || { value: 100, units: "years" } }
                                onMinChange={ age => {
                                    store.dispatch(setMinAge(age))
                                    //if ("**custom**" != this.props.query.ageGroup) {
                                    this.fetch()
                                    //}
                                }}
                                onMaxChange={ age => {
                                    store.dispatch(setMaxAge(age))
                                    //if ("**custom**" != this.props.query.ageGroup) {
                                    this.fetch()
                                    //}
                                }}
                                onGroupChange={ group => {
                                    store.dispatch(setAgeGroup(group))
                                    //if ("**custom**" != this.props.query.ageGroup) {
                                    this.fetch()
                                    //}
                                }}
                                //update={ () => this.fetch() }
                                group={ this.props.query.ageGroup }
                            />
                        </div>
                    </div>
                </div>
            </form>
        )
    }

    renderConditionsTabContents() {
        return (
            <div className="row">
                <div className="col-sm-12">
                    <div className="form-group">
                        <TagSelector
                            tags={
                                Object.keys(this.props.settings.server.conditions).map(key => {
                                    let condition = this.props.settings.server.conditions[key];
                                    return {
                                        key,
                                        label: condition.description,
                                        data : condition
                                    }
                                })
                            }
                            onChange={
                                selection => {
                                    let conditions = {}
                                    selection.forEach(tag => {
                                        conditions[tag.key] = tag.data
                                    })
                                    store.dispatch(setConditions(conditions))
                                    this.fetch()
                                }
                            }
                            label="condition code"
                            selected={ Object.keys(this.props.query.conditions) }
                        />
                    </div>
                </div>
            </div>
        )
    }

    renderTagsTabContents() {
        let selected = this.props.query.tags || this.props.settings.server.tags.filter(
            tag => !!tag.selected
        ).map(tag => !!tag.key);
        return (
            <div className="row">
                <div className="col-sm-12">
                    <div className="form-group">
                        <TagSelector
                            tags={ this.props.settings.server.tags }
                            selected={ selected }
                            onChange={
                                sel => {
                                    let tags = Object.keys(sel).map(k => sel[k].key)
                                    store.dispatch(setTags(tags))
                                    this.fetch()
                                }
                            }
                            label="tag"
                        />
                    </div>
                </div>
            </div>
        )
    }

    render() {
        let _query    = parseQueryString(this.props.location.search);
        let _advanced = this.props.query.queryType == "advanced";
        let conditionsCount   = Object.keys(this.props.query.conditions).length;
        let demographicsCount = 0;
        let tagsCount         = Object.keys(this.props.query.tags).length;

        // Compute which the active tab should be
        let tabs = ["demographics", "conditions"];
        if (!this.props.settings.hideTagSelector) {
            tabs.push("tags");
        }
        let _tab = _query._tab || "";
        if (tabs.indexOf(_tab) == -1) {
            _tab = "demographics";
        }

        // Manually increment the value for the demographics badge depending on
        // the state of the app

        if (this.props.query.gender) {
            demographicsCount += 1;
        }

        if (this.props.query.params.name) {
            demographicsCount += 1;
        }

        if (this.props.query.maxAge !== null || this.props.query.minAge !== null) {
            demographicsCount += 1;
        }

        return (
            <div className="app-header">
                <div style={{ flexDirection: "row" }}>
                    <label className="pull-right advanced-label text-warning">
                        Advanced Mode <input
                            type="checkbox"
                            checked={ _advanced }
                            onChange={ e => {
                                store.dispatch(setQueryType(e.target.checked ? "advanced" : "basic"))
                            }}
                        />
                    </label>
                {
                    _advanced ?
                    <ul className="nav nav-tabs"/> :
                    <ul className="nav nav-tabs">
                        <li className={ !_advanced && _tab == "demographics" ? "active" : null }>
                            <a href="" onClick={ e => {e.preventDefault(); setHashParam("_tab", "demographics")}}>
                                <b>Demographics</b>
                                {
                                    demographicsCount ?
                                    <span> <small className="badge">{ demographicsCount }</small></span> :
                                    null
                                }
                            </a>
                        </li>
                        <li className={ !_advanced && _tab == "conditions" ? "active" : null }>
                            <a href="" onClick={ e => {e.preventDefault(); setHashParam("_tab", "conditions")}}>
                                <b>Conditions</b>
                                {
                                    conditionsCount ?
                                    <span> <small className="badge">{ conditionsCount }</small></span> :
                                    null
                                }
                            </a>
                        </li>
                        {
                            (this.props.settings.hideTagSelector ||
                            this.props.query.params._id) ?
                            null :
                            <li className={ !_advanced && _tab == "tags" ? "active" : null }>
                                <a href="" onClick={ e => {e.preventDefault(); setHashParam("_tab", "tags")}}>
                                    <b>Tags</b>
                                    {
                                        tagsCount ?
                                        <span> <small className="badge">{ tagsCount }</small></span> :
                                        null
                                    }
                                </a>
                            </li>
                        }
                    </ul>
                }
                </div>
                <div className="tab-content">
                    <div className={ "tab-pane " + (_advanced ? "active" : "") }>
                        { this.renderAdvancedTabContents() }
                    </div>
                    <div className={ "tab-pane " + (!_advanced && _tab == "demographics" ? "active" : "") }>
                        { this.renderDemographicsTabContents() }
                    </div>
                    <div className={ "tab-pane " + (!_advanced && _tab == "conditions" ? "active" : "") }>
                        { this.renderConditionsTabContents() }
                    </div>
                    {
                        (this.props.settings.hideTagSelector ||
                            this.props.query.params._id) ?
                        null :
                        <div className={ "tab-pane " + (!_advanced && _tab == "tags" ? "active" : "") }>
                            { this.renderTagsTabContents() }
                        </div>
                    }
                    {
                        !_advanced && this.props.settings.submitStrategy == "manual" ?
                        <div className="text-right" style={{ height: 0 }}>
                            <button
                                type="button"
                                onClick={ () => store.dispatch(fetch()) }
                                className="btn btn-primary btn-submit"
                            >
                                <i className="fa fa-search"/> Search
                            </button>
                        </div> :
                        null
                    }
                </div>
                {
                    _advanced ?
                    null :
                    <SortWidget
                        sort={ this.props.query.sort }
                        onChange={ sort => {
                            store.dispatch(setSort(sort))
                            store.dispatch(fetch())
                        }}
                    />
                }
            </div>
        )
    }
}
