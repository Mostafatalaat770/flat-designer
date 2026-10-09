import type { Layout } from "./types";
export type ExploreChoices = {
  wall:string;
  flooring:"tile800"|"travertine"|"lightoak"|"parquet"|"terrazzo";
  lighting:"track-lamps"|"lamps"|"track"|"downlights"|"none";
  temperature:2700|3000|4000;
  brightness:number;
};
export type ExploreVerification = {
  schema:"ApartmentExploreVerification/1";
  canonical_sha256:string;
  base_scene_revision:string;
  proposed_scene_revision:string;
  room_id:string;
  pass:boolean;
  pass_count:number;
  warnings:string[];
  allowed_changes:string[];
  excluded:string[];
};
export const FLOORING_OPTIONS:ReadonlyArray<{id:ExploreChoices["flooring"];name:string}>;
export const LIGHTING_OPTIONS:ReadonlyArray<{id:ExploreChoices["lighting"];name:string}>;
export const PALETTES:Record<"calm"|"japandi"|"bright",ExploreChoices & {name:string}>;
export function assertExploreChoices(choice:ExploreChoices):true;
export function snapshotExplore(layout:Layout,roomId:string,choice:ExploreChoices):Layout;
export function verifyExplore(args:{
 baseline:Layout;candidate:Layout;roomId:string;choice:ExploreChoices;
 validate:(layout:Layout)=>{checks:Array<{status:string;message:string}>};
 revision:(layout:Layout)=>string;canonical:string;
}):ExploreVerification;
