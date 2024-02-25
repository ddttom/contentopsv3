// eslint-disable-next-line import/no-cycle
import { sampleRUM, loadScript } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
window.danteEmbed = 'https://chat.dante-ai.com/embed?kb_id=62b025de-a6f4-4344-be91-22f673a1d232&token=595446f0-11af-4e81-9543-a08139e438f7&modeltype=gpt-3.5-turbo&mode=false&bubble=true&image=null&bubbleopen=false';

loadScript('https://chat.dante-ai.com/bubble-embed.js');
loadScript('https://chat.dante-ai.com/dante-embed.js');
