
import {TypescriptCrawler} from "./typescript-crawler";

var sources = [
  'C:\\Users\\hermans.s.MAXXTONBV\\projects\\microdocs\\microdocs-ui\\src\\app\\main.ts'
  // 'C:\\Users\\hermans.s.MAXXTONBV\\projects\\maxxton-frontend\\services-library\\src\\maxxton-services.ts',
  // 'C:\\Users\\hermans.s.MAXXTONBV\\projects\\maxxton-frontend\\services-library\\src\\services\\index.ts'
];

var crawler = new TypescriptCrawler();
var project = crawler.crawl(sources);

console.info(JSON.stringify(project, undefined, 2));