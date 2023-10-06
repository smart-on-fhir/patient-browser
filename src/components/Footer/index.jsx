import React               from "react"
import PropTypes           from "prop-types"
import { goNext, goPrev }  from "../../redux/query"
import { getBundleURL }    from "../../lib"
import DialogFooter        from "../DialogFooter"
import                          "./Footer.less"


export default class Footer extends React.Component
{
    static propTypes = {
        bundle   : PropTypes.object,
        query    : PropTypes.object.isRequired,
        dispatch : PropTypes.func.isRequired,
        selection: PropTypes.object.isRequired,
        canShowSelected : PropTypes.bool
    };

    render() {
        let msg     = this.props.query.error ? " Error! " : " Loading... ";
        let bundle  = this.props.bundle;
        let hasPrev = bundle && getBundleURL(bundle, "previous");
        let hasNext = bundle && getBundleURL(bundle, "next");

        if (bundle && !this.props.query.error) {
            if (this.props.query.params._id) {
                msg = "Showing the selected patients only"
            }
            else {
                let len = bundle && bundle.entry ? bundle.entry.length : 0
                if (len) {
                    let startRec = +(this.props.query.offset || 0) + 1
                    let endRec   = startRec + len - 1;

                    msg = ` patient ${startRec} to ${ endRec } `

                    if ("total" in bundle) {
                        msg += ` of ${bundle.total} `
                    }
                }
                else {
                    msg = ` No Records! `
                }
            }
        }

        return (
            <div className="app-footer">
                <div className="container-fluid" style={{ width: "100%" }}>
                    <div className="row">
                        <div className="col-3 col-md-4 text-end">
                            <a
                                href="#prev"
                                onClick={ e => { e.preventDefault(); this.props.dispatch(goPrev()) }}
                                disabled={ !hasPrev }
                            >
                                <i className="fa-solid fa-arrow-left"/> Prev
                            </a>
                        </div>
                        <div className="col-6 col-md-4 text-center">
                            { msg }
                        </div>
                        <div className="col-3 col-md-4 text-start">
                            <a
                                href="#next"
                                onClick={ e => { e.preventDefault(); this.props.dispatch(goNext()) }}
                                disabled={!hasNext}
                            >
                                Next <i className="fa-solid fa-arrow-right"/>
                            </a>
                        </div>
                    </div>
                    <DialogFooter canShowSelected={this.props.canShowSelected}/>
                </div>
            </div>
        )
    }
}
