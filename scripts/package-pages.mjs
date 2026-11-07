import {mkdir,copyFile,writeFile} from 'node:fs/promises';
await mkdir('dist-pages/samples',{recursive:true});
// Explicit allowlist: never publish the local data directory or user designs.
for(const name of ['holder-fit-test.stl','fit-test-block.stl'])await copyFile(`samples/${name}`,`dist-pages/samples/${name}`);
await writeFile('dist-pages/.nojekyll','');
