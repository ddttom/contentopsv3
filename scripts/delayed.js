// eslint-disable-next-line import/no-cycle
import { sampleRUM, loadScript } from './aem.js';
import { initialize as initLaunch } from './launch.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');
// add more delayed functionality here
if (window.cmsplus.analyticsdelay > 0) {
  initLaunch();
}
if (window.cmsplus.bubbleallowed === true) {
  window.danteEmbed = `https://chat.dante-ai.com/embed?${window.cmsplus.bubble}&mode=false&bubble=true&image=null&bubbleopen=false`;
  loadScript('https://chat.dante-ai.com/bubble-embed.js');
  loadScript('https://chat.dante-ai.com/dante-embed.js');
}
