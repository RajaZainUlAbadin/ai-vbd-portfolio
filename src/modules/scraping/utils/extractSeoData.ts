import * as cheerio from 'cheerio';

export const extractSeoData = (html: string) => {
  const $ = cheerio.load(html);

  return {
    metaTitle: $('title').text(),

    metaDescription: $('meta[name="description"]').attr('content'),

    h1: $('h1')
      .map((_, el) => $(el).text())
      .get(),
  };
};
