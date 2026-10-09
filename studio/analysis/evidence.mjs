/**
 * Measurement provenance and uncertainty intervals. Never confuse decimal places
 * with truth: plan-calibrated or illustrative measurements NEED stated uncertainty.
 *
 * These source tags describe origin, not code/building approval.
 */
const sources=new Set(['canonical_plan','image_calibrated','site_measured','manufacturer_drawing','illustrative_proxy']);
export function dimension({value_mm,uncertainty_mm,source,reference,verified_by=null}){
 if(!(Number.isFinite(value_mm)&&value_mm>=0))throw new TypeError('value_mm must be finite >=0');
 if(!(Number.isFinite(uncertainty_mm)&&uncertainty_mm>=0))throw new TypeError('uncertainty_mm required, finite >=0');
 if(!sources.has(source))throw new Error('Unknown measurement provenance');
 if(typeof reference!=='string'||!reference.trim())throw new Error('Source reference is mandatory');
 if(source==='site_measured'&&!verified_by)throw new Error('Site measurements require recorder/verification name; not automatic physical approval');
 if(['image_calibrated','illustrative_proxy'].includes(source)&&uncertainty_mm===0)
  throw new Error('Image/calibrated/proxy dimensions may not claim zero uncertainty');
 return Object.freeze({value_mm,uncertainty_mm,low_mm:Math.max(0,value_mm-uncertainty_mm),
  high_mm:value_mm+uncertainty_mm,source,reference,verified_by});
}
export function difference(left,right){
 if(!left||!right||!Number.isFinite(left.low_mm)||!Number.isFinite(right.high_mm))throw new Error('Measured intervals required');
 const low=left.low_mm-right.high_mm,high=left.high_mm-right.low_mm;
 return {nominal_mm:left.value_mm-right.value_mm,low_mm:low,high_mm:high,
  verdict:low>0?'ROBUSTLY_GREATER':high<0?'ROBUSTLY_LESS':'UNCERTAIN_OVERLAP',
  evidence:[left.reference,right.reference],
  note:'Statistical distribution unknown; bounded interval arithmetic, not probabilistic confidence or approval.'};
}
export function compareAgainstRequirement(measurement,minimumMm,{purpose,authority='design_scenario'}={}){
 if(!Number.isFinite(minimumMm)||minimumMm<0)throw new Error('Invalid minimum');
 if(!purpose||!authority)throw new Error('A threshold must state purpose and provenance');
 return {purpose,authority,nominal_mm:measurement.value_mm,minimum_mm:minimumMm,
  lower_mm:measurement.low_mm,upper_mm:measurement.high_mm,
  result:measurement.low_mm>=minimumMm?'ABOVE_ASSUMED_THRESHOLD':
   measurement.high_mm<minimumMm?'BELOW_ASSUMED_THRESHOLD':'UNCERTAIN_AT_THRESHOLD',
  caveat:'An assumed design threshold is not local legal compliance or manufacturer installation clearance.'};
}
/**
 * Pareto-based design review deliberately does not invent a magic weighted score.
 * Unknown hard gates remain provisional; failed hard gates block construction.
 * Uncertain metrics generate a separate robust-dominance signal.
 */
export function compareOptions({candidates,objectives,requiredGates=[]}){
 if(!Array.isArray(candidates)||candidates.length<2)throw new Error('Compare >=2 candidates');
 if(!Array.isArray(objectives)||!objectives.length)throw new Error('Objectives required');
 const direction={maximize:1,minimize:-1};
 const ids=new Set();
 for(const o of objectives){if(!direction[o.goal]||!o.key)throw new Error('Metric objective needs goal and key');}
 const processed=candidates.map(c=>{
  if(!c.id||ids.has(c.id))throw new Error('Option IDs must be unique');ids.add(c.id);
  const gates=requiredGates.map(key=>({key,status:c.gates?.[key]||'unknown'}));
  if(gates.some(g=>!['passed','failed','unknown'].includes(g.status)))throw new Error('Invalid gate state');
  const missing=objectives.filter(o=>{
   const m=c.metrics?.[o.key];
   return !m||!Number.isFinite(m.value_mm)||!Number.isFinite(m.uncertainty_mm)||m.uncertainty_mm<0;
  }).map(o=>o.key);
  return {id:c.id,hard_fail:gates.some(g=>g.status==='failed'),unknown_gates:gates.filter(g=>g.status==='unknown').map(g=>g.key),
   missing_metrics:missing,metrics:c.metrics};
 });
 const eligible=processed.filter(p=>!p.hard_fail&&!p.missing_metrics.length);
 const strictly=(better,worse,{robust=false}={})=>{
  let strict=false;
  for(const o of objectives){
   const a=better.metrics[o.key],b=worse.metrics[o.key],s=direction[o.goal];
   const valA=robust?s*(s===1?a.value_mm-a.uncertainty_mm:a.value_mm+a.uncertainty_mm):s*a.value_mm;
   const valB=robust?s*(s===1?b.value_mm+b.uncertainty_mm:b.value_mm-b.uncertainty_mm):s*b.value_mm;
   if(valA<valB-1e-7)return false;
   if(valA>valB+1e-7)strict=true;
  }
  return strict;
 };
 return {schema:'ApartmentMultiCriteriaDecision/1',
  objectives,required_gates:requiredGates,
  candidates:processed.map(p=>{
   const dominated_by=eligible.filter(q=>q.id!==p.id&&strictly(q,p)).map(q=>q.id);
   const robustly_dominated_by=eligible.filter(q=>q.id!==p.id&&strictly(q,p,{robust:true})).map(q=>q.id);
   return {id:p.id,hard_fail:p.hard_fail,unknown_gates:p.unknown_gates,
    missing_metrics:p.missing_metrics,dominated_by,robustly_dominated_by,
    status:p.hard_fail?'BLOCKED_HARD_GATE':p.missing_metrics.length?'MISSING_DATA':
      dominated_by.length?'NOMINALLY_DOMINATED':p.unknown_gates.length?'PROVISIONAL_PARETO':'ELIGIBLE_PARETO'};
  }),
  recommendation:'PARETO_ONLY. No automatic choice, price/cost inference, statutory compliance, ergonomic certification or construction readiness.'};
}
