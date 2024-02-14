import {
  initialize as initClientConfig,
} from './clientConfig.js';

export const siteConfig = {};

export function toCamelCase(str) {
  return str.replace(/:([a-z])/g, (_, char) => char.toUpperCase());
}

export function alert(message) {
  // eslint-disable-next-line no-console
  console.error(message);
}

export async function loadConfiguration() {
  const configUrl = `${window.location.origin}/config/config.json`;
  try {
    const response = await fetch(configUrl);
    if (!response.ok) throw new Error(`Failed to fetch config: ${response.status}`);
    const { data } = await response.json();
    data.forEach(({ Item, Value }) => {
      const key = toCamelCase(Item);
      siteConfig[key] = Value;
    });
  } catch (error) {
    alert(`Configuration load error: ${error.message}`);
  }
}
export function extractJsonLd(parsedJson) {
  const jsonLd = { };

  parsedJson.data.forEach((item) => {
    let key = item.Item.trim().toLowerCase();
    if (key === 'type' || key === 'context') {
      key = `@${key}`;
    }
    const value = item.Value.trim();
    jsonLd[key] = value;
  });
  return jsonLd;
}
export function replacePlaceHolders(content) {
  const today = new Date().toISOString().split('T')[0];
  return content
    .replaceAll('$twitter:image', document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || '')
    .replaceAll('$meta:longdescription', document.querySelector('meta[name="longdescription"]')?.getAttribute('content') || '')
    .replaceAll('$system:date', today)
    .replaceAll('$company:name', siteConfig.companyName)
    .replaceAll('$company:logo', siteConfig.companyLogo)
    .replaceAll('$company:url', siteConfig.companyUrl)
    .replaceAll('$company:email', siteConfig.companyEmail)
    .replaceAll('$company:phone', siteConfig.companyTelephone)
    .replaceAll('$company:telephone', siteConfig.companyTelephone);
}

export async function handleMetadataJsonLd() {
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
      jsonString = replacePlaceHolders(jsonString);
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
  }
}
