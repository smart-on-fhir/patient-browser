import React     from "react"
import PropTypes from "prop-types"
import "./SortWidget.less"


export default class SortWidget extends React.Component
{
    static propTypes = {
        /**
         * Fhir sort string like "status,-date,category"
         */
        sort: PropTypes.string,

        options: PropTypes.arrayOf(PropTypes.shape({
            name : PropTypes.string,
            value: PropTypes.string
        })),

        onChange: PropTypes.func
    };

    static defaultProps = {
        sort: "name,-birthdate",
        options: [
            {
                label: <span><span className="hidden-xs">Patient </span>ID</span>,
                name : "Patient ID",
                value: "_id"
            },
            {
                name : "Name",
                value: "given"
            },
            {
                name : "Gender",
                value: "gender"
            },
            {
                name : "DOB",
                value: "birthdate"
            }
        ]
    };

    change(name, value) {
        // console.log(name, value)
        if (typeof this.props.onChange == "function") {
            let sort = this.parseSort(this.props.sort)
            if (!value) {
                if (sort.hasOwnProperty(name)) {
                    delete sort[name];
                }
            }
            else {
                sort[name] = value
            }
            // console.log(sort, this.compileSort(sort))
            this.props.onChange(this.compileSort(sort))
        }
    }

    parseSort(input) {
        let sort = {};
        String(input || "").split(",").filter(Boolean).forEach(s => {
            let name = s.replace(/^\-/, "");
            sort[name] = s.indexOf("-") === 0 ? "desc" : "asc";
        })
        return sort
    }

    compileSort(sort) {
        return Object.keys(sort).map(k => sort[k] == "desc" ? `-${k}` : k).join(",")
    }

    render() {
        let sort = this.parseSort(this.props.sort)

        return (
            <div className="sort-widget small">
                <span className="pull-left">Sort<span className="hidden-xs"> by</span>:</span>
                <ul className="nav nav-pills">
                {
                    this.props.options.map((o, i) => (
                        <li
                            key={ i }
                            role="presentation"
                            className={ o.value in sort ? "active" : null }
                        >
                            <a href="#" onClick={ e => {
                                e.preventDefault()
                                let _sort = this.parseSort(this.props.sort)
                                switch (_sort[o.value]) {
                                case "asc":
                                    return this.change(o.value, "desc")
                                case "desc":
                                    return this.change(o.value, "")
                                default:
                                    return this.change(o.value, "asc")
                                }
                            }}>
                                { o.label || o.name }
                                {
                                    sort[o.value] == "asc" ?
                                    <span className="sort"><span className="hidden-xs"> Asc</span> <i className="fa fa-sort-amount-asc"/></span> :
                                        sort[o.value] == "desc" ?
                                        <span className="sort"><span className="hidden-xs"> Desc</span> <i className="fa fa-sort-amount-desc"/></span> :
                                        null
                                }
                            </a>
                        </li>
                    ))
                }
                </ul>
            </div>
        )
    }
}