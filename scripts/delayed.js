// eslint-disable-next-line import/no-cycle
import { sampleRUM, loadScript } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
window.danteEmbed = 'https://chat.dante-ai.com/embed?kb_id=62b025de-a6f4-4344-be91-22f673a1d232&token=1b695881-6bfa-4b1a-93d4-15fc73a0166e&modeltype=gpt-3.5-turbo&mode=false&bubble=true&image=https://dante-chatbot-pictures.s3.amazonaws.com/62b025de-a6f4-4344-be91-22f673a1d232/simpleA.png&bubbleopen=false';
loadScript('https://chat.dante-ai.com/bubble-embed.js');
loadScript('https://chat.dante-ai.com/dante-embed.js');
