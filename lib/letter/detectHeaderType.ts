/**
 * Detects header position type from HTML content.
 * Heuristics:
 * - If left column/vertical text detected → 'side'
 * - If header appears before body content → 'top'
 * - Default: 'top'
 */
export function detectHeaderType(html: string): 'top' | 'side' {
  if (!html) return 'top';

  const lowerHtml = html.toLowerCase();

  // Check for side header indicators:
  // - Vertical text orientation
  // - Left column layout patterns
  // - Writing mode vertical
  const sideIndicators = [
    'writing-mode: vertical',
    'writing-mode:vertical',
    'transform: rotate(90deg)',
    'transform:rotate(90deg)',
    'flex-direction: column',
    'float: left',
    'width: 180px',
    'width:180px',
  ];

  const hasSideIndicator = sideIndicators.some((indicator) =>
    lowerHtml.includes(indicator)
  );

  if (hasSideIndicator) {
    return 'side';
  }

  // Check for top header pattern:
  // - Header tag appears early in document
  // - Header content before main body
  const headerTags = ['<header', '<h1', '<h2', '<h3', '<div class="header"', '<div id="header"'];
  const bodyTags = ['<body', '<main', '<div class="body"', '<div id="body"', '<div class="content"'];

  let headerIndex = -1;
  let bodyIndex = -1;

  for (const tag of headerTags) {
    const index = lowerHtml.indexOf(tag);
    if (index !== -1 && (headerIndex === -1 || index < headerIndex)) {
      headerIndex = index;
    }
  }

  for (const tag of bodyTags) {
    const index = lowerHtml.indexOf(tag);
    if (index !== -1 && (bodyIndex === -1 || index < bodyIndex)) {
      bodyIndex = index;
    }
  }

  // If header appears before body, it's likely a top header
  if (headerIndex !== -1 && (bodyIndex === -1 || headerIndex < bodyIndex)) {
    return 'top';
  }

  // Default to top
  return 'top';
}
