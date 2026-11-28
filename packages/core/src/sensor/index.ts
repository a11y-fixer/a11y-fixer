// Pure runtime-sensor surface — the facts/judge/discovery pieces with NO browser
// (puppeteer) dependency, published as the `@a11y-fixer/core/sensor` subpath so a
// consumer (the backend's sensor-derive) can import the judge WITHOUT dragging in
// the main barrel's component scanner (Vue compiler + optional template engines
// that a server bundle can't resolve). The browser observer stays on the main
// barrel for the Action only.
export {
  hashText,
  hashContent,
  normalizeText,
  redactRouteLabel,
  canonicalizeFacts,
  liveRegionTextChanged,
  EMPTY_TEXT_HASH,
} from './facts.js';
export type { RegionFingerprint, RouteChangeFacts } from './facts.js';
export { judgeObservation } from './judge.js';
export type { Observation } from './judge.js';
export { NextAppRouterDiscovery, resolveFlowName } from './route-discovery.js';
export type { RouteDiscovery, DiscoveredRoute } from './route-discovery.js';
