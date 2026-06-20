import test from 'node:test';
import assert from 'node:assert/strict';

function decodeEvaluate(result) {
  if (result.exceptionDetails) throw new Error(`${result.exceptionDetails.text}: ${result.exceptionDetails.exception?.description ?? result.exceptionDetails.exception?.value ?? 'evaluation failed'}`);
  return result.result.value;
}

test('decodes flattened-session Runtime.evaluate protocol result', () => {
  assert.deepEqual(decodeEvaluate({result:{type:'object',value:{ok:true}}}), {ok:true});
});

test('reports Runtime.evaluate exception details', () => {
  assert.throws(() => decodeEvaluate({result:{type:'object'},exceptionDetails:{text:'Uncaught',exception:{description:'Error: boom'}}}), /Uncaught: Error: boom/);
});
