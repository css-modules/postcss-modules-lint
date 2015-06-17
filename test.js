var test = require('tape');
var postcss = require('postcss');
var plugin = require('./');
var name = require('./package.json').name;

var tests = [
  {
    should: 'throw on invalid mode',
    input: '',
    options: { mode: "???" },
    error: /'global', 'local' or 'pure'/
  },
  {
    should: 'throw on inconsistent selector result',
    input: ':global .foo, .bar {}',
    error: /Inconsistent/
  },
  {
    should: 'throw on nested :locals',
    input: ':local(:local(.foo)) {}',
    error: /is not allowed inside/
  },
  {
    should: 'throw on nested :globals',
    input: ':global(:global(.foo)) {}',
    error: /is not allowed inside/
  },
  {
    should: 'throw on nested mixed',
    input: ':local(:global(.foo)) {}',
    error: /is not allowed inside/
  },
  {
    should: 'throw on nested broad :local',
    input: ':global(:local .foo) {}',
    error: /is not allowed inside/
  },
  {
    should: 'throw on incorrect spacing with broad :global',
    input: '.foo :global.bar {}',
    error: /Missing whitespace after :global/
  },
  {
    should: 'throw on incorrect spacing with broad :local',
    input: '.foo:local .bar {}',
    error: /Missing whitespace before :local/
  },
  {
    should: 'throw on not pure selector (global class)',
    input: ':global(.foo) {}',
    options: { mode: "pure" },
    error: /':global\(\.foo\)' is not pure/
  },
  {
    should: 'throw on not pure selector (with multiple 1)',
    input: '.foo, :global(.bar) {}',
    options: { mode: "pure" },
    error: /'.foo, :global\(\.bar\)' is not pure/
  },
  {
    should: 'throw on not pure selector (with multiple 2)',
    input: ':global(.bar), .foo {}',
    options: { mode: "pure" },
    error: /':global\(\.bar\), .foo' is not pure/
  },
  {
    should: 'throw on not pure selector (element)',
    input: 'input {}',
    options: { mode: "pure" },
    error: /'input' is not pure/
  },
  {
    should: 'throw on not pure selector (attribute)',
    input: '[type="radio"] {}',
    options: { mode: "pure" },
    error: /'\[type="radio"\]' is not pure/
  },
  {
    should: 'throw on not pure keyframes',
    input: '@keyframes :global(foo) {}',
    options: { mode: "pure" },
    error: /@keyframes :global\(\.\.\.\) is not allowed in pure mode/
  },
  {
    should: 'throw on implicit global element',
    input: 'input {}',
    error: /'input' must be explicitly flagged with :global/
  },
  {
    should: 'throw on implicit global element (with multiple 1)',
    input: 'input, .foo {}',
    error: /'input, \.foo' must be explicitly flagged with :global/
  },
  {
    should: 'throw on implicit global element (with multiple 2)',
    input: '.foo, input {}',
    error: /'\.foo, input' must be explicitly flagged with :global/
  },
  {
    should: 'throw on implicit global attribute',
    input: '[type="radio"] {}',
    error: /'\[type="radio"\]' must be explicitly flagged with :global/
  },
  {
    should: 'throw on implicit global attribute in nested',
    input: ':not([type="radio"]) {}',
    error: /':not\(\[type="radio"\]\)' must be explicitly flagged with :global/
  }
];

function process (css, options) {
    return postcss(plugin(options)).process(css).css;
}

test(name, function (t) {
    t.plan(tests.length);

    tests.forEach(function (testCase) {
        var options = testCase.options || {};

        t.throws(function() {
          process(testCase.input, options);
        }, testCase.error, 'should ' + testCase.should);

    });
});


test('should use the postcss plugin api', function (t) {
    t.plan(2);
    t.ok(plugin().postcssVersion, 'should be able to access version');
    t.equal(plugin().postcssPlugin, name, 'should be able to access name');
});
