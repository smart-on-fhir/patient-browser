var selenium = require('selenium-download');
selenium.ensure('./tests/e2e/bin', function(error) {
    if (error) {
        console.error(error.stack);
    }
});