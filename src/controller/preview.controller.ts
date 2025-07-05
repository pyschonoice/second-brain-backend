// src/controllers/preview.controller.ts
import { Request, Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface LinkPreviewData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const getLinkPreview = async (req: Request, res: Response): Promise<any> => {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required and must be a string.' });
  }

  try {
    // Basic URL validation
    const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i;
    if (!urlRegex.test(url)) {
      return res.status(400).json({ error: 'Invalid URL format.' });
    }

    // Fetch the URL content
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000 // 5 seconds timeout
    });

    // Load the HTML into Cheerio
    const $ = cheerio.load(data);

    const getMetaTag = (attr: string, value: string): string | undefined => {
      const tag = $(`meta[${attr}="${value}"]`);
      return tag.attr('content');
    };

    const preview: LinkPreviewData = {
      title: getMetaTag('property', 'og:title') || $('title').text() || getMetaTag('name', 'twitter:title'),
      description: getMetaTag('property', 'og:description') || getMetaTag('name', 'description') || getMetaTag('name', 'twitter:description'),
      image: getMetaTag('property', 'og:image') || getMetaTag('name', 'twitter:image'),
      url: getMetaTag('property', 'og:url') || url,
      type: getMetaTag('property', 'og:type') || 'website', // Default to 'website'
    };

    // Clean up undefined fields
    Object.keys(preview).forEach(key => preview[key as keyof LinkPreviewData] === undefined && delete preview[key as keyof LinkPreviewData]);

    // If an image is found but it's a relative URL, try to make it absolute
    if (preview.image && !preview.image.startsWith('http')) {
      try {
        const baseUrl = new URL(url).origin;
        preview.image = new URL(preview.image, baseUrl).href;
      } catch (e) {
        console.warn(`Could not resolve relative image URL: ${preview.image} from ${url}`);
        delete preview.image; // Remove image if it cannot be resolved
      }
    }

    res.json(preview);

  } catch (error: any) { // Use 'any' for the error type or a more specific type if you have one for Axios errors
    console.error(`Error fetching or parsing URL ${url}:`, error.message);
    let errorMessage = 'Failed to generate link preview. Could not fetch or parse URL.';
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request to the URL timed out.';
      } else if (error.response) {
        errorMessage = `Failed to fetch URL (Status: ${error.response.status}).`;
      } else if (error.request) {
        errorMessage = 'No response received from the URL.';
      }
    }
    res.status(500).json({ error: errorMessage, details: error.message });
  }
};