import React  from "react"
import moment from "moment"
import PropTypes from "prop-types"
import "./AgeSelector.less"

export default class AgeSelector extends React.Component
{
    static propTypes = {
        min: PropTypes.shape({
            value: PropTypes.number,
            units: PropTypes.oneOf(["years", "months", "days"])
        }),
        max: PropTypes.shape({
            value: PropTypes.number,
            units: PropTypes.oneOf(["years", "months", "days"])
        }),
        group: PropTypes.string,
        onMinChange  : PropTypes.func,
        onMaxChange  : PropTypes.func,
        onGroupChange: PropTypes.func,
        update       : PropTypes.func
    };

    static defaultProps = {
        min: {
            value: 0,
            units: "years"
        },
        max: {
            value: 100,
            units: "years"
        },
        group: "",
        update: () => alert("No update function provided!")
    };

    constructor(...args) {
        super(...args)
        this.onChangeMinValue = this.onChangeMinValue.bind(this)
        this.onChangeMinUnits = this.onChangeMinUnits.bind(this)
        this.onChangeMaxValue = this.onChangeMaxValue.bind(this)
        this.onChangeMaxUnits = this.onChangeMaxUnits.bind(this)
        this.onGroupChange    = this.onGroupChange   .bind(this)
        this.state = this._propsToState(this.props);
    }

    _propsToState(props) {
        let state = {}
        if (props.min && typeof props.min == "object") {
            if (props.min.hasOwnProperty("value")) {
                state.minValue = isNaN(props.min.value) ? "" : props.min.value;
            }
            if (props.min.hasOwnProperty("units")) {
                state.minUnits = props.min.units;
            }
        }
        if (props.max && typeof props.max == "object") {
            if (props.max.hasOwnProperty("value")) {
                state.maxValue = isNaN(props.max.value) ? "" : props.max.value;
            }
            if (props.max.hasOwnProperty("units")) {
                state.maxUnits = props.max.units;
            }
        }

        return state;
    }

    componentWillReceiveProps(newProps) {
        let newState = this._propsToState(newProps);
        if (Object.keys(newState).length) {
            this.setState(newState);
        }
    }

    // Event handlers ----------------------------------------------------------

    /**
     * When the numeric value of the min-age changes
     * @param {Event} e
     */
    onChangeMinValue(e) {
        if (this.props.onMinChange) {
            let min = {
                value: e.target.valueAsNumber,
                units: this.props.min.units
            }

            if (this.canSet(min, this.props.max)) {
                this.props.onMinChange(min)
            }
            else {
                this.setState(this._propsToState({ min }));
            }
        }
    }

    /**
     * When the units of the min-age change
     * @param {Event} e
     */
    onChangeMinUnits(e) {
        if (this.props.onMinChange) {
            let min = {
                value: this.props.min.value,
                units: e.target.value
            };
            if (this.canSet(min, this.props.max)) {
                this.props.onMinChange(min)
            }
            else {
                this.setState(this._propsToState({ min }));
            }
        }
    }

    /**
     * When the numeric value of the max-age changes
     * @param {Event} e
     */
    onChangeMaxValue(e) {
        if (this.props.onMaxChange) {
            let max = {
                value: e.target.valueAsNumber,
                units: this.props.max.units
            };
            if (this.canSet(this.props.min, max)) {
                this.props.onMaxChange(max)
            }
            else {
                this.setState(this._propsToState({ max }));
            }
        }
    }

    /**
     * When the units of the max-age change
     * @param {Event} e
     */
    onChangeMaxUnits(e) {
        if (this.props.onMaxChange) {
            let max = {
                value: this.props.max.value,
                units: e.target.value
            };
            if (this.canSet(this.props.min, max)) {
                this.props.onMaxChange(max)
            }
            else {
                this.setState(this._propsToState({ max }));
            }
        }
    }

    /**
     * When the selected age group changes
     * @param {Event} e
     */
    onGroupChange(e) {
        if (this.props.onGroupChange) {
            this.props.onGroupChange(e.target.value)
        }
    }

    // Validators and helper methods -------------------------------------------

    /**
     * Given two dates (as value and units) returns true if min is before max.
     * This is used to validate inputs and prevent the user from entering
     * invalid ranges
     * @param {Object} min The min date as { value: number, units: string }
     * @param {Object} max The max date as { value: number, units: string }
     * @returns {Boolean}
     */
    canSet(min, max) {
        let maxDuration = moment.duration(max.value, max.units);
        let minDuration = moment.duration(min.value, min.units);
        return minDuration < maxDuration;
    }

    // Rendering methods -------------------------------------------------------

    render() {
        let valid = this.canSet({
            value: this.state.minValue,
            units: this.state.minUnits
        }, {
            value: this.state.maxValue,
            units: this.state.maxUnits
        });
        return (
            <div className={ "age-widget-wrap form-control input-sm" + (this.props.group == "**custom**" ? " custom" : "")}>
                <select
                    onChange={ this.onGroupChange }
                    value={ this.props.group || "" }
                >
                    <option value="">Any Age</option>
                    <option value="infant">Infants (0 - 12 months, Alive only)</option>
                    <option value="child">Children (1 - 18 years, Alive only)</option>
                    <option value="adult">Adults (18 - 65 years, Alive only)</option>
                    <option value="elderly">Elderly (65+ years, Alive only)</option>
                    <option value="**custom**">
                        {
                            this.props.group == "**custom**" ?
                            "Custom Age, Alive only:" :
                            "Custom Age, Alive only"
                        }
                    </option>
                </select>
                {
                    this.props.group == "**custom**" ?
                    <div className={ "age-widget" + (valid ? "" : " invalid") }>
                        <span>Min:</span>
                        <input
                            type="number"
                            value={ this.state.minValue }
                            onChange={ this.onChangeMinValue }
                            min={0}
                            step={1}
                        /><select
                            value={ this.state.minUnits }
                            onChange={ this.onChangeMinUnits }
                        >
                            <option value="years">Years</option>
                            <option value="months">Months</option>
                            <option value="days">Days</option>
                        </select>
                    </div> : null
                }
                {
                    this.props.group == "**custom**" ?
                    <div className={ "age-widget" + (valid ? "" : " invalid") }>
                        <span>Max:</span>
                        <input
                            type="number"
                            value={ this.state.maxValue }
                            onChange={ this.onChangeMaxValue }
                            min={0}
                            step={1}
                        /><select
                            value={ this.state.maxUnits }
                            onChange={ this.onChangeMaxUnits }
                        >
                            <option value="years">Years</option>
                            <option value="months">Months</option>
                            <option value="days">Days</option>
                        </select>
                    </div> : null
                }
            </div>
        )
    }
}