import { profile as iosProfile, sections as iosSections } from './data/ios.js';
import { profile as webProfile, sections as webSections } from './data/web.js';
import { profile as backendProfile, sections as backendSections } from './data/backend.js';

const LS_KEY = "shipit.checks.v2";
const LS_PROFILE = "shipit.profile.v1";

export const PROFILES = [iosProfile, webProfile, backendProfile];

const SECTIONS_MAP = {
  ios: iosSections,
  web: webSections,
  backend: backendSections,
};

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || {};
  } catch (e) {
    return {};
  }
}

export let state = loadState();

const validIds = PROFILES.map((p) => p.id);
const savedProfile = localStorage.getItem(LS_PROFILE);
export let activeProfile = validIds.includes(savedProfile) ? savedProfile : "ios";

export function getSections() {
  return SECTIONS_MAP[activeProfile] || [];
}

export function saveState() {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

export function setActiveProfile(p) {
  activeProfile = p;
  localStorage.setItem(LS_PROFILE, p);
}

export function itemId(secId, subI, iI) {
  return activeProfile + "." + secId + "." + subI + "." + iI;
}
