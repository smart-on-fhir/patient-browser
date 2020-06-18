/* global describe, it, chai */
import moment from "moment"
import chai from "chai"
import {
    getPath,
    getPatientAge,
    getPatientName
} from ".."

const expect = chai.expect



describe ("lib", () => {

    //getPath ------------------------------------------------------------------
    describe ("getPath", () => {
        describe ("Typical use", () => {
            it (`finds shallow props`, () => {
                expect(getPath({ a: 2, c: 4 }, "c")).to.equal(4);
            });
            it (`finds nested props`, () => {
                expect(getPath({ a: 2, b: { c: 5 }}, "b.c")).to.equal(5);
            });
            it (`can work with arrays`, () => {
                expect(getPath([ 2, 5 ], "1")).to.equal(5);
                expect(getPath({ a: 2, b: [ { c: 6 } ] }, "b.0.c")).to.equal(6);
            });
            it (`returns undefined for invalid paths`, () => {
                expect(getPath([ 2, 5 ], "4")).to.equal(undefined);
                expect(getPath([ 2, 5 ], "x")).to.equal(undefined);
                expect(getPath([ 2, 5 ], "length")).to.equal(2);
                expect(getPath({
                    a: 2,
                    b: [{ c: 6}]
                }, "b.0.c.r.5")).to.equal(undefined);
            });
        });
    });

    describe("getPatientAge", () => {
        function test(birthDate, expected) {
            expect(getPatientAge({ birthDate })).to.equal(expected)
        }
        it ("born now", () => {
            test(moment(), "0 second")
        })

        it ("born a second ago", () => {
            test(moment().subtract(1, 'seconds'), "1 second")
        })

        it ("born a minute ago", () => {
            test(moment().subtract(1, 'minute'), "1 minute")
        })

        it ("born a hour ago", () => {
            test(moment().subtract(1, 'hour'), "1 hour")
        })

        it ("born a day ago", () => {
            test(moment().subtract(1, 'day'), "1 day")
        })

        it ("born a month ago", () => {
            test(moment().subtract(1, 'month'), "1 month")
        })

        it ("born an year ago", () => {
            test(moment().subtract(1, 'year'), "12 month")
        })

        it ("born 2 years ago", () => {
            test(moment().subtract(2, 'year'), "2 year")
        })

        it ("born 3 years ago", () => {
            test(moment().subtract(3, 'year'), "3 year")
        })
    });

    describe("getPatientName", () => {
        it ("no patient", () => {
            expect(getPatientName()).to.equal("")
        })

        it ("no name", () => {
            expect(getPatientName({})).to.equal("")
        })

        it ("only family as string", () => {
            expect(getPatientName({ name: [{ family: "family" }]})).to.equal("family")
        })

        it ("only family as array", () => {
            expect(getPatientName({ name: [{ family: ["family ", " name "] }]})).to.equal("family name")
        })

        it ("everything as string", () => {
            expect(getPatientName({
                name: [{
                    family: "  family ",
                    given : "  given ",
                    prefix: "  prefix ",
                    suffix: "  suffix "
                }]
            })).to.equal("prefix given family suffix")
        })

        it ("everything as arrays", () => {
            expect(getPatientName({
                name: [{
                    family: ["  family1 ", " family2 "],
                    given : ["  given1 " , " given2 " ],
                    prefix: ["  prefix1 ", " prefix2 "],
                    suffix: ["  suffix1 ", " suffix2 "]
                }]
            })).to.equal("prefix1 prefix2 given1 given2 family1 family2 suffix1 suffix2")
        })
    })
})