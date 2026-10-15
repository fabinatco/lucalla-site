// Pinned local Tesseract worker. No image upload or third-party asset requests.
const base=new URL('./ocr-assets/',self.location.href),originalFetch=self.fetch.bind(self),originalImport=self.importScripts.bind(self);
self.fetch=(input,options={})=>{const u=new URL(typeof input==='string'?input:input.url,self.location.href);if(options.method&&options.method!=='GET')throw Error('OCR requests must be reads');if(u.protocol==='data:'&&u.href.startsWith('data:application/octet-stream;base64,')&&u.href.length<8000000)return originalFetch(input,options);if(u.origin!==base.origin||!u.pathname.startsWith(base.pathname))throw Error('Nonlocal OCR request blocked');return originalFetch(input,options)};
self.importScripts=(...urls)=>{for(const input of urls){const u=new URL(input,self.location.href);if(u.origin!==base.origin||!u.pathname.startsWith(base.pathname))throw Error('Nonlocal OCR code blocked')}return originalImport(...urls)};
self.importScripts(new URL('worker.min.js',base).href);
