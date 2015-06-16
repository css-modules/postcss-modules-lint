var test = require('tape');
var postcss = require('postcss');
var plugin = require('./');
var name = require('./package.json').name;

var tests = [
  {
    should: 'throw on implicit global element',
    input: 'input {}',
    error: /'input' must be explicitly flagged with :global/
  }
];

function process (css, options) {
    return postcss(plugin(options)).process(css).css;
}

test(name, function (t) {
    t.plan(tests.length);

    tests.forEach(function (testCase) {
        var options = testCase.options || {};
        if(testCase.error) {
          t.throws(function() {
            process(testCase.input, options);
          }, testCase.error, 'should ' + testCase.should);
        } else {
          t.equal(process(testCase.input, options), testCase.expected, 'should ' + testCase.should);
        }
    });
});


test('should use the postcss plugin api', function (t) {
    t.plan(2);
    t.ok(plugin().postcssVersion, 'should be able to access version');
    t.equal(plugin().postcssPlugin, name, 'should be able to access name');
});
