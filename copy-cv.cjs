const fs = require('fs');
const src = 'C:/Users/anant/.gemini/antigravity/brain/e55f2999-52f3-439d-91a9-b321d00387a2/Ananthakrishnan_KJ_CV_2026.pdf';
const dst = 'C:/Users/anant/.gemini/antigravity/scratch/portfolio/public/Ananthakrishnan_KJ_CV_2026.pdf';
fs.copyFileSync(src, dst);
console.log('CV copied to public/');
