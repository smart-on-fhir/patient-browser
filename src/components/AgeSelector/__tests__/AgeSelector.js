/* global describe, it, chai */
import AgeSelector   from ".."
import ReactTestUtils from "react-dom/test-utils"
import React from "react"
import chai from "chai"

const expect = chai.expect



describe ("AgeSelector", () => {
    it ("has the default prop values", () => {
        let widget = ReactTestUtils.renderIntoDocument(<AgeSelector/>)
    })
    it ("calls onChange for min.value")
    it ("calls onChange for min.units")
})
