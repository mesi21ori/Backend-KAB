/**
 * Extracts header, body, footer, and watermark sections from converted HTML.
 * Uses DOM parsing with cheerio (if available) or fallback heuristics.
 */

export interface ExtractedSections {
  header: string | null;
  body: string;
  footer: string | null;
  watermark: string | null;
}

export function extractHtmlSections(html: string): ExtractedSections {
  if (!html || html.trim().length === 0) {
    return {
      header: null,
      body: html || '',
      footer: null,
      watermark: null,
    };
  }

  // Try to use cheerio if available, otherwise use regex/string parsing
  try {
    // Dynamic import to avoid bundling cheerio on client
    // In production, this should be server-side only
    return extractWithCheerio(html);
  } catch (error) {
    // Fallback to heuristic extraction
    return extractWithHeuristics(html);
  }
}

function extractWithCheerio(html: string): ExtractedSections {
  // Note: To use cheerio for better HTML parsing, install it:
  // npm install cheerio @types/cheerio
  // Then uncomment the code below and remove the fallback
  
  // Example implementation with cheerio:
  // try {
  //   const cheerio = require('cheerio');
  //   const $ = cheerio.load(html);
  //   
  //   const header = $('header').html() || $('[class*="header"]').first().html() || null;
  //   const footer = $('footer').html() || $('[class*="footer"]').first().html() || null;
  //   const watermark = $('[class*="watermark"]').first().html() || null;
  //   const body = $('body').html() || html;
  //   
  //   return {
  //     header: header ? header.trim() : null,
  //     body: body || '',
  //     footer: footer ? footer.trim() : null,
  //     watermark: watermark ? watermark.trim() : null,
  //   };
  // } catch (error) {
  //   return extractWithHeuristics(html);
  // }
  
  // For now, use heuristics (works without additional dependencies)
  return extractWithHeuristics(html);
}

function extractWithHeuristics(html: string): ExtractedSections {
  const lowerHtml = html.toLowerCase();
  let header: string | null = null;
  let body: string = html;
  let footer: string | null = null;
  let watermark: string | null = null;

  // Extract watermark first (usually absolute positioned, low opacity)
  const watermarkPatterns = [
    /<div[^>]*class=["'][^"']*watermark[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*id=["']watermark["'][^>]*>([\s\S]*?)<\/div>/i,
    /<img[^>]*class=["'][^"']*watermark[^"']*["'][^>]*>/i,
    /<img[^>]*style=["'][^"']*opacity[^"']*0\.0[0-9][^"']*["'][^>]*>/i,
    /<div[^>]*style=["'][^"']*position[^"']*absolute[^"']*opacity[^"']*0\.0[0-9][^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
  ];

  for (const pattern of watermarkPatterns) {
    const match = html.match(pattern);
    if (match) {
      watermark = match[1] ? match[1].trim() : match[0];
      body = body.replace(pattern, '');
      break;
    }
  }

  // Extract header - look for semantic tags first, then heuristics
  const headerPatterns = [
    /<header[^>]*>([\s\S]*?)<\/header>/i,
    /<div[^>]*class=["'][^"']*header[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*id=["']header["'][^>]*>([\s\S]*?)<\/div>/i,
  ];

  for (const pattern of headerPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      header = match[1].trim();
      body = body.replace(pattern, '');
      break;
    }
  }

  // If no explicit header found, try to extract first few paragraphs/blocks
  // This is common in DOCX conversions where header isn't marked up
  if (!header) {
    // Look for first 2-4 paragraphs or divs that might be header content
    // Check if they contain common header elements (logos, company names, etc.)
    const firstBlocks = html.match(/(?:<p[^>]*>[\s\S]*?<\/p>|<div[^>]*>[\s\S]*?<\/div>|<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>)/gi);
    if (firstBlocks && firstBlocks.length > 0) {
      // Take first 2-3 blocks as potential header
      const potentialHeader = firstBlocks.slice(0, Math.min(3, firstBlocks.length)).join('');
      // Check if it looks like a header (contains common header keywords or is short)
      const headerKeywords = /logo|company|trading|plc|header|letterhead/i;
      if (headerKeywords.test(potentialHeader) || potentialHeader.length < 500) {
        header = potentialHeader.trim();
        // Remove from body
        for (let i = 0; i < Math.min(3, firstBlocks.length); i++) {
          body = body.replace(firstBlocks[i], '');
        }
      }
    }
  }

  // Extract footer - look for semantic tags first, then heuristics
  const footerPatterns = [
    /<footer[^>]*>([\s\S]*?)<\/footer>/i,
    /<div[^>]*class=["'][^"']*footer[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*id=["']footer["'][^>]*>([\s\S]*?)<\/div>/i,
  ];

  for (const pattern of footerPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      footer = match[1].trim();
      body = body.replace(pattern, '');
      break;
    }
  }

  // If no explicit footer found, try to extract last few paragraphs/blocks
  if (!footer) {
    const allBlocks = html.match(/(?:<p[^>]*>[\s\S]*?<\/p>|<div[^>]*>[\s\S]*?<\/div>)/gi);
    if (allBlocks && allBlocks.length > 2) {
      // Take last 2-3 blocks as potential footer
      const potentialFooter = allBlocks.slice(-Math.min(3, allBlocks.length)).join('');
      // Check if it looks like a footer (contains contact info, phone, address, etc.)
      const footerKeywords = /phone|email|address|www\.|contact|ethiopia|addis/i;
      if (footerKeywords.test(potentialFooter) || potentialFooter.length < 300) {
        footer = potentialFooter.trim();
        // Remove from body
        for (let i = 0; i < Math.min(3, allBlocks.length); i++) {
          body = body.replace(allBlocks[allBlocks.length - 1 - i], '');
        }
      }
    }
  }

  // Clean up body: remove empty tags, normalize whitespace
  body = body
    .replace(/<p[^>]*>\s*<\/p>/gi, '')
    .replace(/<div[^>]*>\s*<\/div>/gi, '')
    .replace(/<h[1-6][^>]*>\s*<\/h[1-6]>/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // If body is empty or too short after extraction, use original HTML minus header/footer
  if (!body || body.length < 10) {
    // Fallback: use original HTML but try to remove header/footer if we found them
    body = html;
    if (header) {
      // Try to remove header from body
      const headerEscaped = header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      body = body.replace(new RegExp(headerEscaped, 'i'), '');
    }
    if (footer) {
      // Try to remove footer from body
      const footerEscaped = footer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      body = body.replace(new RegExp(footerEscaped, 'i'), '');
    }
    body = body.trim();
  }

  return {
    header: header || null,
    body: body || '',
    footer: footer || null,
    watermark: watermark || null,
  };
}
