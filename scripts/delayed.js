// eslint-disable-next-line import/no-cycle
import { sampleRUM, loadScript } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
// window.danteEmbed = 'https://chat.dante-ai.com/embed?kb_id=62b025de-a6f4-4344-be91-22f673a1d232&token=595446f0-11af-4e81-9543-a08139e438f7&modeltype=gpt-3.5-turbo&mode=false&bubble=true&image=null&bubbleopen=false';
// loadScript('https://chat.dante-ai.com/bubble-embed.js');
// loadScript('https://chat.dante-ai.com/dante-embed.js');

const firstH1 = document.querySelector('h1');
if (firstH1) {
  const appendString = '<iframe src="https://chat.dante-ai.com/embed?kb_id=62b025de-a6f4-4344-be91-22f673a1d232&token=cc88b682-8338-4756-a686-2c45fb92314b&modeltype=gpt-3.5-turbo&logo=ZmFsc2U=&mode=false" allow="clipboard-write; microphone" width="100%" height="950" frameborder="0" ></iframe>';

  // Append the constructed string to the h1 element's current content
  const newElement = document.createElement('div');
  newElement.className = 'chatBot';
  newElement.innerHTML = appendString;
  firstH1.insertAdjacentElement('afterend', newElement);
}
