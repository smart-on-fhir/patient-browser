module.exports = function(config) {
    const options = {

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: "",

        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: [
            "mocha"
        ],

        // list of files / patterns to load in the browser
        files: [
            "https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.23.0/polyfill.min.js",
            "http://chaijs.com/chai.js",
            "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js",
            "**/__tests__/*.js",
            // "**/__tests__/*.jsx"
        ],

        // list of files to exclude
        exclude: [
            // "./node_modules/**/*.*"
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            "**/*.js" : [ "webpack" ],
            "**/*.jsx": [ "webpack" ]
        },

        webpack: {
            // karma watches the test entry points
            // (you don't need to specify the entry option)
            // webpack watches dependencies

            // webpack configuration
            module: {
                rules: [
                    {
                        test  : /\.jsx?$/,
                        loader: "babel-loader"
                    },
                    {
                        test   : /\.less$/,
                        use: [
                            "style-loader?singleton",
                            "css-loader",
                            "postcss-loader",
                            "less-loader"
                        ]
                    },
                    {
                        test: /\.json5$/,
                        loader: 'json5-loader'
                    }
                ]
            },

            resolve : {
                extensions : [ ".js", ".jsx", ".json5" ]
            }
        },

        // webpack-dev-middleware configuration
        webpackMiddleware: {
            noInfo: true
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: [
            "mocha"
        ],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [
            // "Chrome",       // uses karma-chrome-launcher
            // "ChromeHeadless",
            // "Firefox",      // uses karma-firefox-launcher
            "FirefoxHeadless",
            // "ChromeCanary", // uses karma-chrome-launcher
            // "Safari",       // uses karma-safari-launcher
            // "IE",           // uses karma-ie-launcher
            // "PhantomJS"        // uses karma-phantomjs-launcher
        ],

        // browsers: ["MyHeadlessChrome"],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        plugins: [
        //     require("./node_modules/karma-webpack"),
        //     require("./node_modules/karma-mocha"),
        //     require("./node_modules/karma-mocha-reporter"),
        //     require("./node_modules/karma-chai"),
        //     require("./node_modules/karma-phantomjs-launcher")
            // require("./node_modules/karma-chrome-launcher")
        ],

        customLaunchers: {
            'FirefoxHeadless': {
                base: 'Firefox',
                flags: [
                    '-headless',
                ],
            }
        },

        // customLaunchers: {
        //     MyHeadlessChrome: {
        //       base: "Chrome",
        //       flags: [
        //         "--headless", 
        //         "--disable-gpu", 
        //         "--remote-debugging-port-9222"
        //       ]
        //     }
        //   },

        // // PhantomJS custom settings
        // phantomjsLauncher: {

        //     // Have phantomjs exit if a ResourceError is encountered (useful if
        //     // karma exits without killing phantom)
        //     exitOnResourceError: true
        // },

        mochaReporter: {
            showDiff: true
        }
    };

    if (process.env.CIRCLECI) {
        // @ts-ignore
        // options.customLaunchers = {
        //     Chrome_CircleCI: {
        //         base: 'ChromeHeadless',
        //         flags: [
        //             '--no-sandbox',
        //             '--headless',
        //             '--disable-gpu',
        //             '--disable-translate',
        //             '--disable-extensions'
        //         ]
        //     }
        // };
        options.browsers = [
            "PhantomJS",
            // "Firefox",
            //"IE",
            //"Opera",
            // "PhantomJS"
        ];
    };

    config.set(options);
}