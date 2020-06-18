/* global describe, it, chai, $ */
import TagSelector from ".."
import ReactDOM from "react-dom"
import TestUtils from "react-dom/test-utils"
import React from "react"
import chai from "chai"

const expect = chai.expect;

class Wrap extends React.Component {
    constructor(...args) {
        super(...args)
        this.state = { ...this.props }
    }

    update(newProps) {
        this.setState(newProps)
    }

    render() {
        return <TagSelector ref="component" { ...this.state }/>
    }
}

describe ("TagSelector", () => {

    describe ("constructor", () => {
        it ("creates the proper initial state", () => {
            let widget = TestUtils.renderIntoDocument(<TagSelector/>);
            expect(widget.state).to.deep.equal({
                selected: [],
                open: false,
                selectedIndex: -1,
                search: ""
            })
        });
    });

    describe ("componentWillReceiveProps", () => {
        it ("updates the search", () => {
            let wrap = TestUtils.renderIntoDocument(<Wrap/>);
            expect(wrap.refs.component.state.search).to.equal("")
            wrap.update({ search: "x" })
            expect(wrap.refs.component.state.search).to.equal("x")
        });
    });

    describe ("componentDidUpdate", () => {
        it ("TODO: test the menu scroll position if possible");
    });

    describe ("onFocus", () => {
        it ("opens the menu", () => {
            let widget = TestUtils.renderIntoDocument(<TagSelector/>);
            let wrap   = ReactDOM.findDOMNode(widget);
            let input  = $("input", wrap);
            expect(widget.state.open).to.equal(false);
            TestUtils.Simulate.focus(input[0]);
            expect(widget.state.open).to.equal(true);
        });
    });

    describe ("onBlur", () => {
        it ("closes the menu", () => {
            let widget = TestUtils.renderIntoDocument(<TagSelector/>);
            let wrap   = ReactDOM.findDOMNode(widget);
            let input  = $("input", wrap);
            TestUtils.Simulate.focus(input[0]);
            expect(widget.state.open).to.equal(true);
            TestUtils.Simulate.blur(input[0]);
            expect(widget.state.open).to.equal(false);
        });
    });

    describe ("onInput", () => {
        it ("opens the menu", () => {
            let widget = TestUtils.renderIntoDocument(<TagSelector/>);
            let wrap   = ReactDOM.findDOMNode(widget);
            let input  = $("input", wrap);
            expect(widget.state.open).to.equal(false);
            TestUtils.Simulate.input(input[0], { keyCode: 69 });
            expect(widget.state.open).to.equal(true);
        });

        it ("updates the search", () => {
            let widget = TestUtils.renderIntoDocument(<TagSelector/>);
            let wrap   = ReactDOM.findDOMNode(widget);
            let input  = $("input", wrap).val("e");
            TestUtils.Simulate.input(input[0], { keyCode: 69 });
            expect(widget.state.search).to.equal("e")
            expect(input[0].value).to.equal("e")
        });

        it ("preselects the first option if no selection exists", () => {
            let widget = TestUtils.renderIntoDocument(
                <TagSelector search="option" tags={[
                    { key: "a", label: "option-a", data: { codes: { "SNOMED-CT": ["code-a"] }}},
                    { key: "b", label: "option-b", data: { codes: { "SNOMED-CT": ["code-b"] }}},
                    { key: "c", label: "option-c", data: { codes: { "SNOMED-CT": ["code-c"] }}}
                ]}/>
            )
            let wrap   = ReactDOM.findDOMNode(widget);
            let input  = $("input", wrap).val("e");
            expect(widget.state.selectedIndex).to.equal(-1)
            TestUtils.Simulate.input(input[0], { keyCode: 69 });
            expect(widget.state.selectedIndex).to.equal(0)
        });
    });

    describe ("onKeyDown", () => {
        it ("Escape", () => {
            let widget = TestUtils.renderIntoDocument(<TagSelector/>);
            let wrap   = ReactDOM.findDOMNode(widget);
            let input  = $("input", wrap);
            expect(widget.state.open).to.equal(false);
            TestUtils.Simulate.focus(input[0]);
            expect(widget.state.open).to.equal(true);
            TestUtils.Simulate.keyDown(input[0], { keyCode: 27 });
            expect(widget.state.open).to.equal(false);
        });

        it ("Enter", () => {
            let widget = TestUtils.renderIntoDocument(
                <TagSelector search="option" tags={[
                    { key: "a", label: "option-a", data: { codes: { "SNOMED-CT": ["code-a"] }}},
                    { key: "b", label: "option-b", data: { codes: { "SNOMED-CT": ["code-b"] }}},
                    { key: "c", label: "option-c", data: { codes: { "SNOMED-CT": ["code-c"] }}}
                ]}/>
            )
            let wrap   = ReactDOM.findDOMNode(widget);
            let input  = $("input", wrap).val("option-b");
            expect(widget.state.selectedIndex).to.equal(-1)
            TestUtils.Simulate.input(input[0]);
            expect(widget.state.selectedIndex).to.equal(0)
            TestUtils.Simulate.keyDown(input[0], { keyCode: 13 });
            expect(widget.state).to.deep.equal({
                selectedIndex: -1,
                open         : false,
                search       : "",
                selected: [
                    {
                        custom: true,
                        key: "option-b",
                        label: "option-b",
                        data: {
                            description: "option-b",
                            codes: {
                                "": [ "option-b" ]
                            }
                        }
                    }
                ]
            });
        });

        it ("Arrow Down", () => {
            let widget = TestUtils.renderIntoDocument(
                <TagSelector search="option" tags={[
                    { key: "a", label: "option-a", data: { codes: { "SNOMED-CT": ["code-a"] }}},
                    { key: "b", label: "option-b", data: { codes: { "SNOMED-CT": ["code-b"] }}},
                    { key: "c", label: "option-c", data: { codes: { "SNOMED-CT": ["code-c"] }}}
                ]}/>
            )
            let wrap   = ReactDOM.findDOMNode(widget);
            let input  = $("input", wrap);
            expect(widget.state.selectedIndex).to.equal(-1)
            TestUtils.Simulate.keyDown(input[0], { keyCode: 40 });
            expect(widget.state.selectedIndex).to.equal(0)
            TestUtils.Simulate.keyDown(input[0], { keyCode: 40 });
            expect(widget.state.selectedIndex).to.equal(1)
        });

        it ("Arrow Up", () => {
            let widget = TestUtils.renderIntoDocument(
                <TagSelector search="option" tags={[
                    { key: "a", label: "option-a", data: { codes: { "SNOMED-CT": ["code-a"] }}},
                    { key: "b", label: "option-b", data: { codes: { "SNOMED-CT": ["code-b"] }}},
                    { key: "c", label: "option-c", data: { codes: { "SNOMED-CT": ["code-c"] }}}
                ]}/>
            )
            let wrap   = ReactDOM.findDOMNode(widget);
            let input  = $("input", wrap);
            TestUtils.Simulate.keyDown(input[0], { keyCode: 40 });
            TestUtils.Simulate.keyDown(input[0], { keyCode: 40 });
            TestUtils.Simulate.keyDown(input[0], { keyCode: 40 });
            expect(widget.state.selectedIndex).to.equal(2)
            TestUtils.Simulate.keyDown(input[0], { keyCode: 38 });
            expect(widget.state.selectedIndex).to.equal(1)
            TestUtils.Simulate.keyDown(input[0], { keyCode: 38 });
            expect(widget.state.selectedIndex).to.equal(0)
            TestUtils.Simulate.keyDown(input[0], { keyCode: 38 });
            expect(widget.state.selectedIndex).to.equal(-1)
            TestUtils.Simulate.keyDown(input[0], { keyCode: 38 });
            expect(widget.state.selectedIndex).to.equal(-1)
        });
    });

    it ("addTag", () => {
        let widget = TestUtils.renderIntoDocument(<TagSelector/>);
        expect(widget.state.selected).to.deep.equal([]);
        widget.addTag({ key: "b" })
        expect(widget.state.selected).to.deep.equal([
            { key: "b" }
        ]);
        widget.addTag({ key: "a" })
        expect(widget.state.selected).to.deep.equal([
            { key: "b" },
            { key: "a" }
        ]);
    });

    it ("removeTag", () => {
        let widget = TestUtils.renderIntoDocument(<TagSelector/>);
        expect(widget.state.selected).to.deep.equal([]);
        widget.addTag({ key: "b" })
        widget.addTag({ key: "a" })
        widget.addTag({ key: "c" })
        widget.removeTag("a")
        expect(widget.state.selected).to.deep.equal([
            { key: "b" },
            { key: "c" }
        ]);
    });

    describe ("filterTags", () => {

        it ("filters and sorts the list", () => {
            let tagA = { key: "a", label: "option-a", data: { codes: { "SNOMED-CT": ["code-a"] }}};
            let tagB = { key: "b", label: "option-b", data: { codes: { "SNOMED-CT": ["code-b"] }}}
            let tagC = { key: "c", label: "option-c", data: { codes: { "SNOMED-CT": ["code-c"] }}};
            let widget = TestUtils.renderIntoDocument(<TagSelector tags={[ tagA, tagC, tagB ]}/>);
            expect(widget.filterTags()).to.deep.equal([ tagA, tagB, tagC ]);
            expect(widget.filterTags("code-b")).to.deep.equal([ tagB ]);
            expect(widget.filterTags("option-c")).to.deep.equal([ tagC ]);
        });

        it ("prepends the custom search option", () => {
            let tagA = { key: "a", label: "option-a", data: { codes: { "SNOMED-CT": ["code-a"] }}};
            let widget = TestUtils.renderIntoDocument(<TagSelector tags={[tagA]} search="test"/>);
            expect(widget.filterTags()).to.deep.equal([
                {
                    key   : "test",
                    label : "test",
                    custom: true,
                    data  : {
                        description: "test",
                        codes: {
                            "": ["test"]
                        }
                    }
                },
                tagA
            ]);
        })
    });

    it ("renderTagCode", () => {
        let widget = TestUtils.renderIntoDocument(<TagSelector/>);
        expect(widget.renderTagCode()).to.equal(null)
        expect(widget.renderTagCode({})).to.equal(null)
        expect(widget.renderTagCode({ data: 5 })).to.equal(null)
        let code = TestUtils.renderIntoDocument(widget.renderTagCode({
            data: {
                codes: {
                    "sys": [1234]
                }
            }
        }))
        let small = ReactDOM.findDOMNode(code);
        expect(small.textContent).to.equal("1234 (sys):")
    });

    it ("renderTag(tag, index)");

    describe ("render", () => {
        it ("builds proper html", () => {
            let widget = TestUtils.renderIntoDocument(
                <TagSelector search="option" tags={[
                    { key: "a", label: "option-a", data: { codes: { "SNOMED-CT": ["code-a"] }}},
                    { key: "b", label: "option-b", data: { codes: { "SNOMED-CT": ["code-b"] }}},
                    { key: "c", label: "option-c", data: { codes: { "SNOMED-CT": ["code-c"] }}}
                ]}/>
            )
            let wrap    = ReactDOM.findDOMNode(widget);
            let input   = $("input", wrap)
            let menu    = $(".menu", wrap);
            let options = $(".menu-item", menu);

            expect(input.length).to.equal(1)
            expect(menu.length).to.equal(1)
            expect(options.length).to.equal(3 + 1)
            expect(input.val()).to.equal("option")
        });
    });

    /*it ("builds proper html", () => {
        let widget = TestUtils.renderIntoDocument(
            <TagSelector tags={[
                { key: "a", label: "a", data: { codes: { "SNOMED-CT": ["code-a"] }}},
                { key: "b", label: "b", data: { codes: { "SNOMED-CT": ["code-b"] }}},
                { key: "c", label: "c", data: { codes: { "SNOMED-CT": ["code-c"] }}}
            ]}/>
        )
        let wrap    = ReactDOM.findDOMNode(widget);
        let input   = $("input", wrap)
        let menu    = $(".menu", wrap);
        let options = $(".menu-item", menu);

        TestUtils.Simulate.keyDown(input[0], { keyCode: 40 });

        let sel = $(".menu-item.selected", menu)

        expect(input.length).to.equal(1)
        expect(menu.length).to.equal(1)
        expect(options.length).to.equal(3)
        expect(sel.length).to.equal(1)
        expect(sel.index()).to.equal(0)
        expect(sel.text()).to.equal("code-a (SNOMED)a")
        expect(input.val()).to.equal("")

        TestUtils.Simulate.keyDown(input[0], { keyCode: 40 });
        sel = $(".menu-item.selected", menu)
        expect(sel.length).to.equal(1)
        expect(sel.index()).to.equal(1)
        expect(sel.text()).to.equal("code-b (SNOMED)b")

        TestUtils.Simulate.keyDown(input[0], { keyCode: 38 });
        sel = $(".menu-item.selected", menu)
        expect(sel.length).to.equal(1)
        expect(sel.index()).to.equal(0)
        expect(sel.text()).to.equal("code-a (SNOMED)a")
    })*/
    // it ("calls onChange for min.value")
    // it ("calls onChange for min.units")
})
