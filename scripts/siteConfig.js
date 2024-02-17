import {
  initialize as initClientConfig,
} from './clientConfig.js';

export const siteConfig = {};

export function alert(message) {
  // eslint-disable-next-line no-console
  console.error(message);
}

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
    const today = new Date().toISOString().split('T')[0];
    let href = '';
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) { // Make sure the element was found
      href = canonicalLink.href;
    }

    const text = document.body.innerText; // Get the visible text content of the body
    const wordCount = text.split(/\s+/).filter(Boolean).length; // Split by whitespace and count

    siteConfig['$page:wordcount'] = wordCount;
    siteConfig['$page:linkcount'] = document.querySelectorAll('a').length;
    siteConfig['$page:readspeed'] = Math.ceil(wordCount / 60 + 1).toString();
    siteConfig['$page:title'] = document.title;
    siteConfig['$page:description'] = document.querySelector('meta[name="description"]');
    siteConfig['$page:keywords'] = document.querySelector('meta[name="keywords"]');
    siteConfig['$page:author'] = document.querySelector('meta[name="author"]');

    siteConfig['$page:canonical'] = href;
    siteConfig['$system:date'] = today;
    siteConfig['$system:time'] = new Date().toLocaleTimeString();
    siteConfig['$system:timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
    siteConfig['$system:locale'] = Intl.DateTimeFormat().resolvedOptions().locale;
    siteConfig['$system:language'] = Intl.DateTimeFormat().resolvedOptions().language;
    siteConfig['$system:country'] = Intl.DateTimeFormat().resolvedOptions().country;
    siteConfig['$system:region'] = Intl.DateTimeFormat().resolvedOptions().region;
    siteConfig['$system:variant'] = Intl.DateTimeFormat().resolvedOptions().variant;
    siteConfig['$system:year'] = new Date().getFullYear();
    siteConfig['$system:month'] = new Date().getMonth() + 1;
    siteConfig['$system:day'] = new Date().getDate();
    siteConfig['$system:hour'] = new Date().getHours();
    siteConfig['$system:minute'] = new Date().getMinutes();
    siteConfig['$system:second'] = new Date().getSeconds();
    siteConfig['$system:millisecond'] = new Date().getMilliseconds();

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
        siteConfig[`$${prefix}${key}`] = value;
      }
      if (siteConfig['$page:author'] == null) {
        siteConfig['$page:author'] = siteConfig['$company:name'];
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Configuration load error: ${error.message}`);
    throw error; // Rethrow for potential handling at a higher level
  }
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

function replaceTokens(data, text) {
  let ret = text;
  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const key in data) {
    const value = data[key];
    ret = ret.replaceAll(key, value);
  }
  return ret;
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
      alert('Error processing JSON-LD metadata:', error);
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
  const main = document.querySelector('main');
  if (main) {
    removeCommentBlocks(main);
    handleMetadataJsonLd(main);
    const metadataNames = [
      'pageauthor',
      'pagereviewdate',
      'pageembargodate',
      'pagepublisheddate',
      'pagecopyright',
      'pagecopyright-cc',
    ];
    const firstH1 = document.querySelector('h1');
    if (firstH1) {
      // Construct the string you want to append
      const appendString = `Word Count = ${siteConfig['$page:wordcount']}, <strong>${siteConfig['$page:readspeed']} </strong>minute(s) to read this page.`;
      // Append the constructed string to the h1 element's current content
      const newElement = document.createElement('div');
      newElement.className = 'byLine';
      newElement.innerHTML = appendString;
      firstH1.appendChild(newElement);
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
