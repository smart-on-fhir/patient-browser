/* global describe, it, chai */
import chai from "chai"
import PatientSearch from "../PatientSearch"
import moment from "moment"

const expect = chai.expect
import { CODE_SYSTEMS } from "../constants"
// import * as STU3 from "../../../build/config/stu3-open-sandbox.json5"
// import * as STU2 from "../../../build/config/dstu2-open-sandbox.json5"

// @ts-ignore
import * as STU3 from "../../../build/config/r3.json5"
// @ts-ignore
import * as STU2 from "../../../build/config/r2.json5"

const SERVERS = {
    "STU2" : STU2.server,
    "STU3" : STU3.server
};


describe ("lib", () => {
    describe ("PatientSearch", function() {

        this.timeout(15000);

        it ("works with no params", () => {
            let builder = new PatientSearch()
            expect(builder.compile()).to.equal("")
        })

        it ("gender", next => {
            let builder = new PatientSearch()
            builder.setGender("male")
            expect(builder.compile()).to.equal("gender=male")
            builder.setGender("female")
            expect(builder.compile()).to.equal("gender=female")
            builder.setGender("x")
            expect(builder.compile()).to.equal("gender=x")
            builder.setGender(null)
            expect(builder.compile()).to.equal("")

            let job = Promise.resolve();

            job = job.then(() => {
                builder.setGender("male");
                return builder.fetch(SERVERS.STU2).then(bundle => {
                    bundle.entry.forEach(patient => {
                        expect(patient.resource.gender).to.equal("male")
                    })
                })
            });

            job = job.then(() => {
                builder.setGender("male");
                return builder.fetch(SERVERS.STU3).then(bundle => {
                    bundle.entry.forEach(patient => {
                        expect(patient.resource.gender).to.equal("male")
                    })
                })
            });

            job = job.then(() => {
                builder.setGender("female");
                return builder.fetch(SERVERS.STU2).then(bundle => {
                    bundle.entry.forEach(patient => {
                        expect(patient.resource.gender).to.equal("female")
                    })
                })
            });

            job = job.then(() => {
                builder.setGender("female");
                return builder.fetch(SERVERS.STU3).then(bundle => {
                    bundle.entry.forEach(patient => {
                        expect(patient.resource.gender).to.equal("female")
                    })
                })
            });

            job = job.then(() => next());
            job.catch(next);
        });

        it ("Medical conditions", () => {
            let builder = new PatientSearch()
            builder.addCondition("hypertension", {
                description: 'Hypertension',
                codes: {
                    'SNOMED-CT' : ['38341003']
                }
            })
            expect(decodeURIComponent(builder.compileConditions())).to.equal(
                `code=${CODE_SYSTEMS["SNOMED-CT"].url}|38341003`
            )

            builder.addCondition("diabetes", {
                description: 'Diabetes',
                codes: {
                    'SNOMED-CT' : ['44054006']
                }
            })
            expect(decodeURIComponent(builder.compileConditions())).to.equal(
                `code=${
                    CODE_SYSTEMS["SNOMED-CT"].url
                }|38341003,${
                    CODE_SYSTEMS["SNOMED-CT"].url
                }|44054006`
            )

            builder.removeCondition("hypertension")
            expect(decodeURIComponent(builder.compileConditions())).to.equal(
                `code=${
                    CODE_SYSTEMS["SNOMED-CT"].url
                }|44054006`
            )
        })

        it ("setMinAge", next => {
            let builder = new PatientSearch()
            let date = moment().subtract(2, "days").format("YYYY-MM-DD")
            builder.setMinAge({ value: 2, units: "days" })

            expect(decodeURIComponent(builder.compile())).to.equal(
                "birthdate=le" + date + "&deceased=false"
            )

            let job = Promise.resolve();

            job = job.then(() => {
                builder.setMinAge({ value: 25, units: "years" })
                return builder.fetch(SERVERS.STU2).then(bundle => {
                    if (bundle.total > 0) {
                        bundle.entry.forEach(patient => {
                            expect(
                                +moment() - +moment(patient.resource.birthDate) >= 1000*60*60*24*365*25
                            ).to.equal(true)
                        })
                    }
                })
            });

            job = job.then(() => {
                builder.setMinAge({ value: 25, units: "years" })
                return builder.fetch(SERVERS.STU3).then(bundle => {
                    if (bundle.total > 0) {
                        bundle.entry.forEach(patient => {
                            expect(
                                +moment() - +moment(patient.resource.birthDate) >= 1000*60*60*24*365*25
                            ).to.equal(true)
                        })
                    }
                })
            });

            job = job.then(() => next());
            job.catch(next);
        })

        it ("setMaxAge", next => {
            let builder = new PatientSearch()
            let date = moment().subtract(3, "months").format("YYYY-MM-DD")
            builder.setMaxAge({ value: 3, units: "months" })

            expect(decodeURIComponent(builder.compile())).to.equal(
                "birthdate=ge" + date + "&deceased=false"
            )

            let job = Promise.resolve();
            let before25years = moment().subtract(25, "years");

            job = job.then(() => {
                builder.setMaxAge({ value: 25, units: "years" })
                return builder.fetch(SERVERS.STU2).then(bundle => {
                    if (bundle.total > 0) {
                        bundle.entry.forEach(patient => {
                            expect(
                                moment(patient.resource.birthDate).isSameOrAfter(
                                    before25years,
                                    "year"
                                )
                            ).to.equal(true)
                        })
                    }
                })
            });

            job = job.then(() => {
                builder.setMaxAge({ value: 25, units: "years" })
                return builder.fetch(SERVERS.STU3).then(bundle => {
                    if (bundle.total > 0) {
                        bundle.entry.forEach(patient => {
                            expect(
                                moment(patient.resource.birthDate).isSameOrAfter(
                                    before25years,
                                    "year"
                                )
                            ).to.equal(true)
                        })
                    }
                })
            });

            job = job.then(() => next());
            job.catch(next);
        })

        it ("setMinAge & setMaxAge", () => {
            let builder = new PatientSearch()
            let min = moment().subtract(2, "days").format("YYYY-MM-DD")
            let max = moment().subtract(3, "months").format("YYYY-MM-DD")
            builder.setMinAge({ value: 2, units: "days" })
            builder.setMaxAge({ value: 3, units: "months" })

            expect(decodeURIComponent(builder.compile())).to.equal(
                "birthdate=le" + min + "&birthdate=ge" + max + "&deceased=false"
            )
        })

        it ("setAgeGroup", () => {
            let builder = new PatientSearch()
            const before1year   = moment().subtract(1, "years").format("YYYY-MM-DD")
            const before18years = moment().subtract(18, "years").format("YYYY-MM-DD")
            const before65years = moment().subtract(65, "years").format("YYYY-MM-DD")

            builder.setAgeGroup("infant")
            expect(decodeURIComponent(builder.compile())).to.equal(
                "birthdate=ge" + before1year + "&deceased=false"
            )

            builder.setAgeGroup("child")
            expect(decodeURIComponent(builder.compile())).to.equal(
                "birthdate=le" + before1year +
                "&birthdate=ge" + before18years + "&deceased=false"
            )

            builder.setAgeGroup("adult")
            expect(decodeURIComponent(builder.compile())).to.equal(
                "birthdate=le" + before18years +
                "&birthdate=ge" + before65years + "&deceased=false"
            )

            builder.setAgeGroup("elderly")
            expect(decodeURIComponent(builder.compile())).to.equal(
                "birthdate=le" + before65years + "&deceased=false"
            )

            builder.setAgeGroup(null)
            expect(decodeURIComponent(builder.compile())).to.equal(
                ""
            )
        })

        it ("setOffset", () => {
            let builder = new PatientSearch()
            builder.setOffset("x", 3)
            expect(builder.compile()).to.equal("_getpages=x&_getpagesoffset=3")
            builder.setOffset("x", -3)
            expect(builder.compile()).to.equal("")
            builder.setOffset("x", "whatever")
            expect(builder.compile()).to.equal("")
        });

        it ("setLimit", () => {
            let builder = new PatientSearch()
            builder.setLimit(5)
            expect(builder.compile()).to.equal("_count=5")
            builder.setLimit(-5)
            expect(builder.compile()).to.equal("")
            builder.setLimit("whatever")
            expect(builder.compile()).to.equal("")
        });

        it ("setQueryType", () => {
            let builder = new PatientSearch()
            builder.setQueryType("advanced")
            builder.setLimit(5)
            builder.setParam("a", "b")
            // @ts-ignore
            expect(builder.queryType).to.equal("advanced")
            expect(builder.compile()).to.equal("_count=5")
            builder.setQueryType("whatever")
            // @ts-ignore
            expect(builder.queryType).to.equal("default")
            expect(builder.compile()).to.equal("a=b&_count=5")
        });

        it ("setQueryString", () => {
            let builder = new PatientSearch()
            builder.setQueryType("advanced").setQueryString("a=b&c=d&f")
            expect(builder.compile()).to.equal("a=b&c=d&f=true")
        });

        it ("setSort", () => {
            let builder = new PatientSearch()
            builder.setSort("a,-b,c")
            expect(decodeURIComponent(builder.compile())).to.equal(
                "_sort:asc=a&_sort:desc=b&_sort:asc=c"
            )
        });

        it ("setParam", () => {
            let builder = new PatientSearch()
            // @ts-ignore
            expect(builder.params).to.deep.equal({})
            builder.setParam("a", 1)
            // @ts-ignore
            expect(builder.params).to.deep.equal({ a: 1 })
            builder.setParam("a", 2)
            // @ts-ignore
            expect(builder.params).to.deep.equal({ a: 2 })
            builder.setParam("b", 3)
            // @ts-ignore
            expect(builder.params).to.deep.equal({ a: 2, b: 3 })
            expect(builder.compile()).to.equal("a=2&b=3")
            builder.setParam("a", undefined)
            // @ts-ignore
            expect(builder.params).to.deep.equal({ b: 3 })
            expect(builder.compile()).to.equal("b=3")
        });

        it ("hasParam", () => {
            let builder = new PatientSearch()
            // @ts-ignore
            expect(builder.params).to.deep.equal({})
            expect(builder.hasParam("a")).to.equal(false)
            builder.setParam("a", 1)
            // @ts-ignore
            expect(builder.params).to.deep.equal({ a: 1 })
            expect(builder.hasParam("a")).to.equal(true)
            builder.setParam("b", 3)
            expect(builder.hasParam("b")).to.equal(true)
            builder.setParam("a", undefined)
            expect(builder.hasParam("a")).to.equal(false)
            expect(builder.hasParam("b")).to.equal(true)
        });

        it ("clone", () => {
            const tpl = {
                conditions : { a: 1, b: 2 },
                params     : { c: 4 },
                minAge     : { value: 2, units: "x" },
                maxAge     : { value: 3, units: "y" },
                gender     : "male",
                limit      : 8,
                offset     : 3,
                cacheId    : "cache",
                ageGroup   : "infant",
                queryString: "x=y&z=-1",
                queryType  : "default"
            };

            let builder1 = (new PatientSearch())
                .setConditions(tpl.conditions)
                .setParam("c", tpl.params.c)
                .setAgeGroup(tpl.ageGroup)
                .setMinAge(tpl.minAge)
                .setMaxAge(tpl.maxAge)
                .setGender(tpl.gender)
                .setLimit(tpl.limit)
                .setOffset(tpl.cacheId, tpl.offset)
                .setQueryType(tpl.queryType)
                .setQueryString(tpl.queryString);

            let builder2 = builder1.clone()

            // @ts-ignore
            expect(builder1.conditions).to.deep.equal(tpl.conditions)
            // @ts-ignore
            expect(builder2.conditions).to.deep.equal(tpl.conditions)

            // @ts-ignore
            expect(builder1.params).to.deep.equal(tpl.params)
            // @ts-ignore
            expect(builder2.params).to.deep.equal(tpl.params)

            expect(builder1.ageGroup).to.equal(tpl.ageGroup)
            expect(builder2.ageGroup).to.equal(tpl.ageGroup)

            // @ts-ignore
            expect(builder1.minAge).to.deep.equal(tpl.minAge)
            // @ts-ignore
            expect(builder2.minAge).to.deep.equal(tpl.minAge)

            // @ts-ignore
            expect(builder1.maxAge).to.deep.equal(tpl.maxAge)
            // @ts-ignore
            expect(builder2.maxAge).to.deep.equal(tpl.maxAge)

            // @ts-ignore
            expect(builder1.gender).to.equal(tpl.gender)
            // @ts-ignore
            expect(builder2.gender).to.equal(tpl.gender)

            // @ts-ignore
            expect(builder1.limit).to.equal(tpl.limit)
            // @ts-ignore
            expect(builder2.limit).to.equal(tpl.limit)

            expect(builder1.cacheId).to.equal(tpl.cacheId)
            expect(builder2.cacheId).to.equal(tpl.cacheId)

            // @ts-ignore
            expect(builder1.offset).to.equal(tpl.offset)
            // @ts-ignore
            expect(builder2.offset).to.equal(tpl.offset)

            // @ts-ignore
            expect(builder1.queryType).to.equal(tpl.queryType)
            // @ts-ignore
            expect(builder2.queryType).to.equal(tpl.queryType)

            // @ts-ignore
            expect(builder1.queryString).to.equal(tpl.queryString)
            // @ts-ignore
            expect(builder2.queryString).to.equal(tpl.queryString)

            expect(builder1).to.not.equal(builder2)
            expect(builder1.compile()).to.equal(builder2.compile())

        });

        it ("reset", () => {
            let builder = (new PatientSearch())
                .setConditions({ a: 1, b: 2 })
                .setParam("c", 5)
                .setAgeGroup("infant")
                .setMinAge({ value: 2, units: "x" })
                .setMaxAge({ value: 3, units: "y" })
                .setGender("female")
                .setLimit(3)
                .setOffset("ddd", 33)
                .setQueryType("default")
                .setQueryString("whatever=something");

            builder.reset();
            expect(builder.compile()).to.equal("")
        });

        it ("getState", () => {
            let builder = (new PatientSearch())
                .setSort("-name")
                .setConditions({ a: 1, b: 2 })
                .setParam("c", 5)
                .setAgeGroup("infant")
                .setMinAge({ value: 2, units: "x" })
                .setMaxAge({ value: 3, units: "y" })
                .setGender("female")
                .setLimit(3)
                .setOffset("ddd", 33)
                .setQueryType("default")
                .setQueryString("whatever=something");

            expect(builder.getState()).to.deep.equal({
                conditions : { a: 1, b: 2 },
                params     : { c: 5 },
                minAge     : { value: 2, units: "x" },
                maxAge     : { value: 3, units: "y" },
                gender     : "female",
                limit      : 3,
                offset     : 33,
                cacheId    : "ddd",
                ageGroup   : "infant",
                queryString: "whatever=something",
                queryType  : "default",
                sort       : "-name",
                tags       : []
            })
        });

        describe ("UI dependencies", () => {

            it ("Resets the offset after changing the gender", () => {
                let builder = new PatientSearch();
                builder.setOffset("x", 3);
                expect(builder.compile()).to.equal("_getpages=x&_getpagesoffset=3")
                builder.setGender("male")
                expect(builder.compile()).to.equal("gender=male")
            });

            it ("Resets the offset after changing the conditions", () => {
                let builder = new PatientSearch();
                builder.setOffset("x", 3);
                expect(builder.compile()).to.equal("_getpages=x&_getpagesoffset=3")
                builder.setConditions({})
                expect(builder.compile()).to.equal("")
            });

            it ("Resets the offset after changing the min age", () => {
                let builder = new PatientSearch();
                builder.setOffset("x", 3);
                expect(builder.compile()).to.equal("_getpages=x&_getpagesoffset=3")
                // @ts-ignore
                builder.setMinAge({})
                expect(builder.compile().indexOf("_getpages=x&_getpagesoffset=3")).to.equal(-1)
            });

            it ("Resets the offset after changing the max age", () => {
                let builder = new PatientSearch();
                builder.setOffset("x", 3);
                expect(builder.compile()).to.equal("_getpages=x&_getpagesoffset=3")
                // @ts-ignore
                builder.setMaxAge({})
                expect(builder.compile().indexOf("_getpages=x&_getpagesoffset=3")).to.equal(-1)
            });

            it ("Resets the offset after changing the age group", () => {
                let builder = new PatientSearch();
                builder.setOffset("x", 3);
                expect(builder.compile()).to.equal("_getpages=x&_getpagesoffset=3")
                builder.setAgeGroup("adult")
                expect(builder.compile().indexOf("_getpages=x&_getpagesoffset=3")).to.equal(-1)
            });


        });
    })
})
