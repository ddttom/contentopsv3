/* eslint-disable no-await-in-loop */
/* eslint-disable prefer-destructuring */
import {
  initialize as initClientConfig,
} from './clientConfig.js';

// import { handleMetadataTracking } from './adobe-metadata.js';
import { replaceTokens, logError } from './meta-helper.js';

export const siteConfig = {};
window.cmsplus = window.cmsplus || {};

export async function loadConfiguration() {
  const configUrl = new URL('/config/variables.json', window.location.origin);

  try {
    const response = await fetch(configUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.status} ${response.statusText}`);
    }
    const jsonData = await response.json();
    // eslint-disable-next-line no-restricted-syntax
    for (const entry of jsonData.data) {
      siteConfig[entry.Item] = entry.Value;
    }
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    let href = '';
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) { // Make sure the element was found
      href = canonicalLink.href;
    }
    const pname = new URL(window.location.href).pathname;

    const text = document.body.innerText; // Get the visible text content of the body
    const wordCount = text.split(/\s+/).filter(Boolean).length; // Split by whitespace and count
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const thismonth = new Date().getMonth();
    const winloc = window.location.href;
    let environment = 'unknown';
    if (window.location.href.includes('hlx.page')) {
      environment = 'stage';
    }
    if (window.location.href.includes('hlx.live')) {
      environment = 'production';
    }
    if (window.location.href.includes('localhost')) {
      environment = 'dev';
    }
    window.cmsplus.environment = environment;
    siteConfig['$system:environment$'] = environment;
    siteConfig['$page.location$'] = winloc;
    siteConfig['$page:url$'] = href;
    siteConfig['$page:name$'] = pname;
    siteConfig['$page:path$'] = (`${winloc}?`).split('?')[0];
    siteConfig['$page:wordcount$'] = wordCount;
    siteConfig['$page:linkcount$'] = document.querySelectorAll('a').length;
    siteConfig['$page:readspeed$'] = (Math.ceil(wordCount / 140) + 1).toString();
    siteConfig['$page:title$'] = document.title;
    siteConfig['$page:canonical$'] = href;
    siteConfig['$system:platformVersion$'] = 'Franklin++ 1.0.0';
    siteConfig['$system:date$'] = today;
    siteConfig['$system:isodate$'] = now;
    siteConfig['$system:time$'] = new Date().toLocaleTimeString();
    siteConfig['$system:timezone$'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
    siteConfig['$system:locale$'] = Intl.DateTimeFormat().resolvedOptions().locale;
    siteConfig['$system:year$'] = new Date().getFullYear();
    siteConfig['$system:month$'] = thismonth + 1;
    siteConfig['$system:monthinfull$'] = months[thismonth];
    siteConfig['$system:day$'] = new Date().getDate();
    siteConfig['$system:hour$'] = new Date().getHours();
    siteConfig['$system:minute$'] = new Date().getMinutes();
    siteConfig['$system:second$'] = new Date().getSeconds();
    siteConfig['$system:millisecond$'] = new Date().getMilliseconds();
    siteConfig['$system:dateinenglish$'] = `${siteConfig['$system:monthinfull$']} ${siteConfig['$system:day$']}, ${siteConfig['$system:year$']}`;
    const metaTitle = document.querySelector('meta[name="title"]');

    if (!metaTitle) {
      // 1. Attempt to find the first H1 tag
      let h1 = document.querySelector('h1');
      // 2. If no H1 found, get the first text node
      if (!h1) {
        const findFirstText = (node) => {
          // eslint-disable-next-line no-restricted-syntax
          for (const child of node.childNodes) {
            if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
              return child;
            }
            const found = findFirstText(child);
            if (found) return found;
          }
          return null; // No text node found at all
        };
        const firstText = findFirstText(document.body);
        h1 = firstText; // Treat the text node as a source
      }
      // 3. Extract the first line, with basic trimming
      if (h1) {
        const firstLine = h1.textContent.split('\n')[0].trim();
        // 4. Create and set the meta tag
        const title = document.createElement('meta');
        title.name = 'title';
        title.content = firstLine;
        document.head.appendChild(title);
      }
    }
    const metaTags = document.querySelectorAll('meta');

    metaTags.forEach((metaTag) => {
      let key = metaTag.getAttribute('name') || metaTag.getAttribute('property');
      const value = metaTag.getAttribute('content');
      if (key && value) {
        let prefix = '';
        if (!key.includes(':')) {
          prefix = 'meta:';
        }
        if (key.includes('meta:og:') || key.includes('meta:twitter:')) {
          key.replace('meta:', '');
        }
        if (key === 'og:image:secure_url') {
          key = 'og:image_secure_url';
        }
        siteConfig[`$${prefix}${key}$`] = value;
      }
      if (siteConfig['$meta:author$'] == null) {
        siteConfig['$meta:author$'] = siteConfig['$company:name$'];
      }
      if (siteConfig['$meta:contentauthor$'] == null) {
        siteConfig['$meta:contentauthor$'] = siteConfig['$meta:author$'];
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Configuration load error: ${error.message}`);
    throw error;
  }
  // make the required globals
  let buildscript = 'window.cmsplus = window.cmsplus || {};\n';
  const delay = siteConfig['$meta:analyticsdelay1$'] === undefined ? 3000 : siteConfig['$meta:analyticsdelay1$'];
  const bubbleapikey = siteConfig['$system:bubbleapikey$'] === undefined ? '' : siteConfig['$system:bubbleapikey$'];
  buildscript += `window.cmsplus.analyticsdelay = ${delay};\nwindow.cmsplus.bubble = "${bubbleapikey}";\n`;
  buildscript += `window.cmsplus.environment = "${window.cmsplus.environment}";\n`;
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.textContent = buildscript;
  document.head.appendChild(script);
  return siteConfig;
}

export function extractJsonLd(parsedJson) {
  const jsonLd = { };
  const hasDataArray = 'data' in parsedJson && Array.isArray(parsedJson.data);
  if (hasDataArray) {
    parsedJson.data.forEach((item) => {
      let key = item.Item.trim().toLowerCase();
      const reservedKeySet = new Set(['type', 'context', 'id', 'value', 'reverse', 'container', 'graph']);
      if (reservedKeySet.has(key)) {
        key = `@${key}`;
      }
      const value = item.Value.trim();
      jsonLd[key] = value;
    });
    return jsonLd;
  }
  return parsedJson;
}

async function handleMetadataJsonLd() {
  if (!document.querySelector('script[type="application/ld+json"]')) {
    let jsonLdMetaElement = document.querySelector('meta[name="json-ld"]');
    if (!jsonLdMetaElement) {
      jsonLdMetaElement = document.createElement('meta');
      jsonLdMetaElement.setAttribute('name', 'json-ld');
      jsonLdMetaElement.setAttribute('content', 'owner'); // Default role
      document.head.appendChild(jsonLdMetaElement);
    }
    const content = jsonLdMetaElement.getAttribute('content');
    jsonLdMetaElement.remove();
    // assume we have an url, if not we have a role -  construct url on the fly
    let jsonDataUrl = content;

    try {
    // Attempt to parse the content as a URL
    // eslint-disable-next-line no-new
      new URL(content);
    } catch (error) {
    // Content is not a URL, construct the JSON-LD URL based on content and current domain
      jsonDataUrl = `${window.location.origin}/config/json-ld/${content}.json`;
    }
    try {
      const resp = await fetch(jsonDataUrl);
      if (!resp.ok) {
        throw new Error(`Failed to fetch JSON-LD content: ${resp.status}`);
      }
      let json = await resp.json();
      json = extractJsonLd(json);
      let jsonString = JSON.stringify(json);
      jsonString = replaceTokens(siteConfig, jsonString);
      // Create and append a new script element with the processed JSON-LD data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-role', content.split('/').pop().split('.')[0]); // Set role based on the final URL
      script.textContent = jsonString;
      document.head.appendChild(script);
      document.querySelectorAll('meta[name="longdescription"]').forEach((section) => section.remove());
    } catch (error) {
    // no schema.org for your content, just use the content as is
      logError('Error processing JSON-LD metadata:', error);
    }
  }
}
export function removeCommentBlocks() {
  document.querySelectorAll('div.section-metadata.comment').forEach((section) => section.remove());
}

// `initialize` function to kick things off
export async function initialize() {
  await loadConfiguration();
  initClientConfig();
  removeCommentBlocks();
  handleMetadataJsonLd();
  // handleMetadataTracking(siteConfig);
  const metadataNames = [
    'pagereviewdate',
    'pageembargodate',
    'pagepublisheddate',
    'pagecopyright',
    'pagecopyright-cc',
    'videourl',
    'contenttype',
    'contenttopic',
    'contenttechnology',
    'contentcompany',
    'contentindustry',
    'tracking',
    'category',
    'contenttitle',
    'contentauthor',
    'lang',
    'analyticsdelay',
  ];
  if (siteConfig['$meta:lang$']) {
    document.querySelector('html').setAttribute('lang', siteConfig['$meta:lang$']);
    if (siteConfig['$meta:lang$'] === 'ar') {
      document.querySelector('html').setAttribute('dir', 'rtl');
    }
  }
  if (siteConfig['$system:addbyline$'] === 'true') {
    const firstH1 = document.querySelector('h1');
    if (siteConfig['$system:addbyline$'] === 'true') {
      if (firstH1) {
        const appendString = `Published: ${siteConfig['$system:dateinenglish$']}; By ${siteConfig['$meta:author$']},  ${siteConfig['$page:readspeed$']} </strong>minute(s) reading.`;
        // Append the constructed string to the h1 element's current content
        const newElement = document.createElement('div');
        newElement.className = 'byLine';
        newElement.innerHTML = appendString;
        firstH1.insertAdjacentElement('afterend', newElement);
      }
    }
    // Loop through the array of metadata names
    metadataNames.forEach((name) => {
      // Select all elements with the specified name attribute
      const elements = document.querySelectorAll(`meta[name="${name}"]`);

      // Loop through the NodeList of elements and remove each one
      elements.forEach((element) => {
        element.remove();
      });
    });
  }
}
