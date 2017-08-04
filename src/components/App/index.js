import React         from "react"
import $             from "jquery"
import JSON5         from "json5"
import { connect }   from "react-redux"
import Loader        from "../Loader"
import ErrorMessage  from "../ErrorMessage"
import { fetch, setLimit } from "../../redux/query"
import { merge }     from "../../redux/settings"
import { parseQueryString } from "../../lib"
import                    "./App.less"

const OWNER = window.opener || (window.parent === self ? null : window.parent);
const DEFAULT_CONFIG = "stu3-open-sandbox";



export class App extends React.Component
{
    static propTypes = {
        children : React.PropTypes.any,
        settings : React.PropTypes.object.isRequired,
        dispatch : React.PropTypes.func.isRequired
    };

    constructor(...args) {
        super(...args)
        this.state = {
            error: null
        };
    }

    handleUiBlocking() {
        let runningRequests = 0, hideDelay;

        const handle = () => {
            if (hideDelay) {
                clearTimeout(hideDelay)
            }
            if (runningRequests > 0) {
                $("#overlay").show();
            }
            else {
                hideDelay = setTimeout(() => {
                    $("#overlay").hide();
                }, 200)
            }
        };

        $(document).ajaxStart(() => {
            runningRequests++;
            handle();
        });

        $(document).ajaxComplete(() => {
            runningRequests = Math.max(--runningRequests, 0);
            handle();
        })
    }

    componentDidMount() {

        this.handleUiBlocking();

        let { config, ...params } = parseQueryString(window.location.search);

        let settings = {};
        $.ajax({
            url     : `/config/${config || DEFAULT_CONFIG}.json5`,
            dataType: "text",
            cache   : false
        }).then(
            json => {
                json = JSON5.parse(json);
                $.ajaxSetup({ timeout: json.timeout || 20000 });
                settings = { ...json, ...params }
            },
            errorXHR => {
                console.warn("Loading custom config: " + errorXHR.statusText);
            }
        ).always(() => {
            let settingReceived = false;

            const onMessage = e => {
                if (e.data.type == 'config' &&
                    e.data.data &&
                    typeof e.data.data == "object")
                {
                    settingReceived = true;
                    this.props.dispatch(merge(e.data.data));
                    this.props.dispatch(fetch());
                }
            };

            this.props.dispatch(merge(settings));
            this.props.dispatch(setLimit(settings.patientsPerPage));

            if (OWNER) {

                window.addEventListener("unload", function() {
                    OWNER.postMessage({ type: "close" }, "*")
                });

                window.addEventListener("message", onMessage);

                setTimeout(() => {
                    window.removeEventListener("message", onMessage);
                    if (!settingReceived) {
                        this.props.dispatch(fetch());
                    }
                }, 1000);

                OWNER.postMessage({ type: "ready" }, "*");
            }
            else {
                this.props.dispatch(fetch());
            }
        })
    }

    render() {
        if (this.state.error) {
            return <ErrorMessage error={this.state.error}/>
        }
        if (!this.props.settings || !this.props.settings.loaded) {
            return <div className="app"><Loader/></div>
        }
        return <div className="app">{this.props.children}</div>
    }
}

export default connect(state => ({...state}))(App)
