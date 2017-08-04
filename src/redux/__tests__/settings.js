/* global describe, beforeEach, it, chai */
import store from ".."
import {
    merge,
    showSelectedOnly,
    replace
} from "../settings"

const expect = chai.expect

describe ("Store", () => {
    describe ("settings", () => {

        const BASE_SETTINGS = {
            loaded: true
        };

        beforeEach(() => {
            store.dispatch(replace({}))
        })

        describe ("merge", () => {

            it ("Works wih empty object", () => {
                store.dispatch(merge({}))
                expect(store.getState().settings).to.deep.equal(BASE_SETTINGS)
            })

            it ("Works wih invalid arguments", () => {
                store.dispatch(merge(2))
                expect(store.getState().settings).to.deep.equal(BASE_SETTINGS)

                store.dispatch(merge(false))
                expect(store.getState().settings).to.deep.equal(BASE_SETTINGS)

                store.dispatch(merge(new Date()))
                expect(store.getState().settings).to.deep.equal(BASE_SETTINGS)
            })

            it ("Works as expected and des deep merge", () => {
                store.dispatch(merge({ a: { b: 2 } }))
                expect(store.getState().settings).to.deep.equal({
                    ...BASE_SETTINGS,
                    a: {
                        b: 2
                    }
                })
                store.dispatch(merge({ a: { b: 3, c: 4 } }))
                expect(store.getState().settings).to.deep.equal({
                    ...BASE_SETTINGS,
                    a: {
                        b: 3,
                        c: 4
                    }
                })
            })
        })

        describe("showSelectedOnly", () => {
            it ("Works with boolean", () => {
                store.dispatch(showSelectedOnly(true))
                expect(store.getState().settings).to.deep.equal({
                    renderSelectedOnly: true
                })
                store.dispatch(showSelectedOnly(false))
                expect(store.getState().settings).to.deep.equal({
                    renderSelectedOnly: false
                })
            })

            it ("Works with non-boolean args", () => {
                store.dispatch(showSelectedOnly("yes"))
                expect(store.getState().settings).to.deep.equal({
                    renderSelectedOnly: true
                })
                store.dispatch(showSelectedOnly(0))
                expect(store.getState().settings).to.deep.equal({
                    renderSelectedOnly: false
                })
            })
        })
    })
})