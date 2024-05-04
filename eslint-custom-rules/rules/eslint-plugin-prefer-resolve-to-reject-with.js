const SpyStrategyCall = `CallExpression:matches(
    [callee.object.property.name=and],
    [callee.object.callee.property.name=withArgs]
  )`.replace(/\s+/g, ' ');

const ReturnStrategy = `${SpyStrategyCall}[callee.property.name=returnValue]`;

// Matches Promise.{resolve,reject}(X)
const PromiseCall = 'CallExpression[callee.object.name=Promise]';
const SettledPromise = `${PromiseCall}[callee.property.name=/resolve|reject/]`;

module.exports = {
    meta: {
      type: 'suggestion',
      docs: {
        description: "Enforce using resolveTo() and rejectWith() instead of Promise.resolve() and Promise.reject() in Jasmine tests",
        category: "Best Practices",
        recommended: true,
      },
      fixable: 'code',
      schema: []
    },
  
    create: context => ({
      [`${ReturnStrategy} > ${SettledPromise}.arguments:first-child`] (promiseCall) {
        const returnStrategyCall = promiseCall.parent;
        const returnValueMethod = returnStrategyCall.callee.property;
        const preferredMethod = promiseCall.callee.property.name === 'resolve'
          ? 'resolveTo' : 'rejectWith';
  
        context.report({
          message: `Prefer ${preferredMethod}`,
          loc: {
            start: returnValueMethod.loc.start,
            end: returnStrategyCall.loc.end
          },
          fix (fixer) {
            const code = context.getSourceCode();
            return [
              // Replace Promise constructor call with its arguments
              fixer.remove(promiseCall.callee),
              fixer.remove(code.getTokenAfter(promiseCall.callee)),
              fixer.remove(code.getLastToken(promiseCall)),
  
              // Replace returnValue method with resolveTo or rejectWith
              fixer.replaceText(returnValueMethod, preferredMethod)
            ];
          }
        })
      }
    })
};
