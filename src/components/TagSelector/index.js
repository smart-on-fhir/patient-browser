import React from "react"
import $ from "jquery"
import { renderSearchHighlight } from "../../lib"
import "./TagSelector.less"

export default class TagSelector extends React.Component
{
    static propTypes = {
        tags    : React.PropTypes.arrayOf(React.PropTypes.object),
        selected: React.PropTypes.arrayOf(React.PropTypes.string),
        onChange: React.PropTypes.func,
        search  : React.PropTypes.string,
        label   : React.PropTypes.string
    };

    static defaultProps = {
        onChange: () => 1,
        tags    : [],
        selected: [],
        search  : ""
    }

    constructor(...args) {
        super(...args)

        this.state = {
            // the selected items as a map of unique keys and tag objects
            selected: [],

            // is the menu currently visible?
            open: false,

            // the index of the currently selected option (-1 means no
            // selection).
            selectedIndex: -1,

            // The search therm (the value of the input field)
            search : ""
        };

        this.stateFromProps(this.state, this.props)

        // bind the event handlers to preserve the "this" context
        this.addTag       = this.addTag.bind(this)
        this.removeTag    = this.removeTag.bind(this)
        this.onFocus      = this.onFocus.bind(this)
        this.onBlur       = this.onBlur.bind(this)
        this.onKeyDown    = this.onKeyDown.bind(this)
        this.onInput      = this.onInput.bind(this)
    }

    stateFromProps(state, nextProps) {
        let hasChanged = false
        if (nextProps.search) {
            state.search = nextProps.search;
            hasChanged = true;
        }

        if (nextProps.selected) {
            state.selected = [ ...nextProps.selected.map(
                t => this.props.tags.find(tag => tag.key === t) || {
                    key: t,
                    label: t,
                    custom: true,
                    data : {
                        description: t,
                        codes: {
                            "": [t]
                        }
                    }
                }
            ) ]
            hasChanged = true
        }

        return hasChanged;
    }

    componentWillReceiveProps(nextProps) {
        let nextState = {}
        if (this.stateFromProps(nextState, nextProps)) {
            this.setState(nextState);
        }
    }

    /**
     * Updates the scroll position of the menu if it is opened and if some of
     * it's options is selected so that the selected option is always in view.
     */
    componentDidUpdate() {
        let menu = this.refs.menu;
        if (menu) {
            let menuHeight    = menu.clientHeight;
            let menuScrollTop = menu.scrollTop;
            let paddingTop    = parseInt($(menu).css("paddingTop"), 10);
            let paddingBottom = parseInt($(menu).css("paddingBottom"), 10);
            let selected      = $(".selected", this.refs.menu);

            if (selected.length) {
                let selectedTop    = selected[0].offsetTop;
                let selectedHeight = selected[0].offsetHeight;
                if (selectedTop < menuScrollTop) {
                    requestAnimationFrame(() => this.refs.menu.scrollTop = selectedTop - paddingTop)
                }
                else if (selectedTop + selectedHeight - menuScrollTop > menuHeight) {
                    requestAnimationFrame(() => this.refs.menu.scrollTop = selectedTop + selectedHeight +
                        paddingBottom - menuHeight);
                }
            }
        }
    }



    // Event handlers ----------------------------------------------------------

    onFocus() {
        this.setState({ open: true })
    }

    onBlur() {
        this.setState({ open: false })
    }

    onInput(e) {
        let listed = this.filterTags(e.target.value);
        this.setState({
            search: e.target.value,
            open: true,
            selectedIndex: listed.length && this.state.selectedIndex == -1 ?
                0 :
                this.state.selectedIndex
        })
    }

    /**
     * This will handle special keys like Enter, Escape and arrows for scrolling
     */
    onKeyDown(e) {
        let listed = this.filterTags(this.state.search);
        switch (e.keyCode) {

        case 27: // Esc
            this.setState({ open: false })
            break;

        case 13: { // Enter
            // make sure we don't submit the form (if in any)
            e.preventDefault();

            if (listed.length < 2) {
                this.setState({ open: false })
            }

            let index = this.state.selectedIndex;
            if (index === listed.length - 1) {
                this.setState({ selectedIndex: index - 1 }, () => {
                    this.addTag(listed[index])
                })
            }
            else {
                this.addTag(listed[index])
            }

            break;
        }

        case 40: { // Down arrow
            e.preventDefault();
            let maxIndex = listed.length - 1
            this.setState({
                open         : true,
                selectedIndex: Math.min(this.state.selectedIndex + 1, maxIndex)
            });
            break;
        }

        case 38: // Up arrow
            e.preventDefault();
            if (this.state.selectedIndex > 0) {
                this.setState({
                    selectedIndex: this.state.selectedIndex - 1
                });
            }
            else if (this.state.open) {
                this.setState({
                    open: false,
                    selectedIndex: -1
                })
            }
            break;
        }
    }

    /**
     * Happens when the user clicks on an option (or hits the enter key on
     * selected option)
     * @param {*} tag
     * @returns {void}
     */
    addTag(tag) {

        if (!tag || !tag.key) {
            return;
        }

        // this.shouldn't happen but just in case, check if somebody is trying
        // to select something that is already selected
        if (this.state.selected.find(t => t.key === tag.key)) {
            return;
        }

        this.setState({
            ...this.state,
            selected     : [ ...this.state.selected, tag ],
            search       : "",
            open         : false,
            selectedIndex: -1
        }, () => this.props.onChange(this.state.selected))
    }

    /**
     * Happens when the user clicks a close button on a selected tag
     * @param {*} key
     */
    removeTag(key) {
        if (!key) return;
        let idx = this.state.selected.findIndex(t => t.key === key);
        if (idx > -1) {
            this.state.selected.splice(idx, 1);
            this.setState({}, () => this.props.onChange(this.state.selected));
        }
    }

    // Private helper methods --------------------------------------------------

    filterTags(search) {
        let tags = this.props.tags.filter(t => {

            // skip the already selected options
            if (this.state.selected.find(tag => t.key === tag.key)) {
                return false
            }

            // search for matches
            if (search) {

                // first search by name
                let index = t.label.toLowerCase().indexOf(search.toLowerCase())
                if (index > -1) {
                    return true
                }

                // then search by code
                if (t.data && t.data.codes && typeof t.data.codes == "object") {
                    for (let system in t.data.codes) {
                        return t.data.codes[system].some(c => (
                            c.toLowerCase().indexOf(search.toLowerCase()) > -1
                        ))
                    }
                }

                return false
            }
            return true;
        }).sort((a, b) => {
            if (a.label > b.label) return 1
            if (a.label < b.label) return -1
            return 0
        }).map(t => ({ ...t }))

        if (this.state.search) {
            tags.unshift({
                key   : this.state.search,
                label : this.state.search,
                custom: true,
                data : {
                    description: this.state.search,
                    codes: {
                        "": [this.state.search]
                    }
                }
            })
        }

        return tags
    }

    // Rendering methods -------------------------------------------------------

    renderTagCode(tag) {
        if (!tag || !tag.data || !tag.data.codes) {
            return null;
        }

        let code = "", codes = tag.data.codes;
        if (codes["SNOMED-CT"]) {
            code = codes["SNOMED-CT"].join("|")
        }
        else {
            for (let system in codes) {
                code = `${codes[system].join(",")} (${system})`
                break;
            }
        }

        if (this.state.search) {
            code = renderSearchHighlight(code, this.state.search)
        }

        return code ?
            <small key={tag.key} className="text-muted code">{code}:</small> :
            null;
    }

    renderTag(tag, index) {
        return (
            <div
                className={
                    "menu-item" +
                    (this.state.selectedIndex === index ? " selected" : "") +
                     (tag.custom ? " custom text-primary" : "")
                }
                key={tag.key}
                onMouseDown={ e => { e.preventDefault(); this.addTag(tag) }}
                title={tag.label}
            >
                {
                    tag.custom ?
                    <span>
                    Search for <b className="tag custom">
                        { this.state.search }
                    </b>{ this.props.label ? " " + this.props.label : ""}</span> :
                    null
                }
                { tag.custom ? null : this.renderTagCode(tag) }
                { tag.custom ? null : renderSearchHighlight(tag.label, this.state.search) }
            </div>
        )
    }

    render() {
        let menuItems = this.filterTags(this.state.search).map(this.renderTag, this)
        let emptyMenu = menuItems.length === 0
        let tags = this.state.selected.map(tag => (
            <div className={"tag" + (tag.custom ? " custom" : "") } key={ tag.key }>
                { tag.label }
                <i
                    className="tag-remove fa fa-times-circle"
                    title="Remove"
                    onMouseDown={
                        e => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.removeTag(tag.key)
                        }
                    }
                />
            </div>
        ))

        let placeholder = "Type to search"
        if (this.props.label) {
            placeholder += ` for ${this.props.label}s`
        }
        placeholder += ' ...'

        return (
            <div className={ "tag-selector" + (this.state.open ? " open" : "") }>
                { tags.length ? <div className="tags">{tags}</div> : null }
                <input
                    className="input form-control input-sm"
                    placeholder={placeholder}
                    onFocus={ this.onFocus }
                    onClick={ this.onFocus }
                    onBlur={ this.onBlur }
                    onKeyDown={ this.onKeyDown }
                    onInput={ this.onInput }
                    onChange={ ()=>1 }
                    value={ this.state.search }
                />
                <i className="fa fa-caret-down"/>
                {
                    emptyMenu && !this.state.search ?
                    null :
                    <div className="menu dropdown-menu" ref="menu">
                        { menuItems }
                    </div>
                }
            </div>
        )
    }
}
