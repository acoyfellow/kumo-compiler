const timeout=(promise,ms,label)=>ms>0?Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(`${label} timed out after ${ms}ms`)),ms))]):promise;

export class ObservableBrowserScheduler{
 #tail=Promise.resolve();#active=0;#submitted=0;
 get active(){return this.#active} get submitted(){return this.#submitted}
 run(job,{timeoutMs=0,label='observable browser job'}={}){
  if(typeof job!=='function')return Promise.reject(new TypeError('browser job must be a function'));
  this.#submitted++;
  const execute=async()=>{this.#active++;if(this.#active!==1)throw new Error('exclusive browser scheduler invariant violated');try{return await Promise.resolve().then(job)}finally{this.#active--}};
  const execution=this.#tail.then(execute,execute);
  this.#tail=execution.then(()=>undefined,()=>undefined);
  // A caller timeout never releases the queue early: the underlying job must
  // settle before the next browser lifecycle may start.
  return timeout(execution,timeoutMs,label);
 }
 async idle(){await this.#tail}
}

export const observableBrowserScheduler=new ObservableBrowserScheduler();
export const scheduleObservableBrowser=(job,options)=>observableBrowserScheduler.run(job,options);
