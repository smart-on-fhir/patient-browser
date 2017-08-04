/* global describe, it, chai */
import AgeSelector   from ".."
import ReactTestUtils from "react-addons-test-utils"
import React from "react"

const expect = chai.expect



describe ("AgeSelector", () => {
    it ("has the default prop values", () => {
        let widget = ReactTestUtils.renderIntoDocument(<AgeSelector/>)
    })
    it ("calls onChange for min.value")
    it ("calls onChange for min.units")
})