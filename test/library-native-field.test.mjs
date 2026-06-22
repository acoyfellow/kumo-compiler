import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {deriveNativeField,loadNativeField,validateNativeField} from '../src/kumo/library/native-field.mjs';

const dir=path.resolve('contracts/kumo.observable/v1/components');
const contracts=['field','input','input-area','sensitive-input'].map(name=>JSON.parse(fs.readFileSync(path.join(dir,`${name}.json`))));

test('native field is canonical and preserves root and native ownership evidence',()=>{
 const capability=loadNativeField();
 assert.deepEqual(capability,deriveNativeField(contracts));
 assert.deepEqual(capability.controls.map(x=>[x.component,x.root]),[['input','input'],['input-area','textarea'],['sensitive-input','div']]);
 for(const control of capability.controls) assert.equal(control.value.owner,'native-uncontrolled');
 assert.equal(capability.controls[0].value.transition.callbackValue,'current native value');
 assert.equal(capability.controls[0].disabled.observedDefaultValue,'x');
});

test('field and sensitive boundaries remain exact and blocked',()=>{
 const capability=loadNativeField();
 assert.equal(capability.wiring.label.mechanism,'id/for association required');
 assert.equal(capability.wiring.describedBy.description,'control aria-describedby target');
 assert.equal(capability.wiring.describedBy.error,'control aria-describedby target');
 assert.deepEqual(capability.controls.find(x=>x.component==='sensitive-input').sensitive.copy,{trigger:'trusted copy-button activation',value:'current native value',callback:'copy',announcement:'Value hiddenCopied to clipboard'});
 for(const field of ['controlledValueOwnership','fieldGeneratedIds','requiredSerialization','descriptionErrorCombination','sensitiveRevealSemantics','sensitiveClipboardFailure']) assert.ok(capability.blockers.some(x=>x.field===field));
 const mutated=structuredClone(capability); mutated.controls[0].root='div'; assert.throws(()=>validateNativeField(mutated),/digest mismatch/);
});
