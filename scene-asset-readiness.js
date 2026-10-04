/* Shared by manual and headless captures; every asynchronous scene map counts. */
const apartmentSceneAssetsPending=new Set(),apartmentSceneAssetsFailed=new Set();
const apartmentOriginalTextureLoad=THREE.TextureLoader.prototype.load;
THREE.TextureLoader.prototype.load=function(url,onLoad,onProgress,onError){
  let complete;const pending=new Promise(resolve=>complete=resolve);apartmentSceneAssetsPending.add(pending);
  const settle=()=>{apartmentSceneAssetsPending.delete(pending);complete();};
  const source=globalThis.APARTMENT_CAPTURE_INPUT?.asset_urls?.[url]||url;
  try{return apartmentOriginalTextureLoad.call(this,source,texture=>{try{onLoad?.(texture);}finally{settle();}},onProgress,error=>{apartmentSceneAssetsFailed.add(url);try{onError?.(error);}finally{settle();}});}catch(error){settle();throw error;}
};
async function waitApartmentSceneAssets(timeout=10000){
  const deadline=Date.now()+timeout;
  while(apartmentSceneAssetsPending.size){
    let timer;try{await Promise.race([Promise.all([...apartmentSceneAssetsPending]),new Promise((_,reject)=>timer=setTimeout(()=>reject(new Error('Scene material images are still loading. Retry capture after they load.')),Math.max(1,deadline-Date.now())))]);}finally{clearTimeout(timer);}
    if(Date.now()>=deadline&&apartmentSceneAssetsPending.size)throw new Error('Scene material loading timed out.');
  }
  // In headless pages a failed specified map must not silently change the saved
  // scene. Generic materials without maps still use their normal fallbacks.
  if(globalThis.APARTMENT_CAPTURE_INPUT&&apartmentSceneAssetsFailed.size)throw new Error('A saved material or artwork image failed to load: '+[...apartmentSceneAssetsFailed].join(', '));
}
