import {mkdir,copyFile,writeFile} from 'node:fs/promises';
await mkdir('dist-pages/samples',{recursive:true});
// Explicit allowlist: never publish the local data directory or user designs.
for(const name of ['holder-fit-test.stl','fit-test-block.stl','t-one-tpu-grommets.stl','tpu-grommet-fit-test.stl','rb35s-fit-test.stl','telemetry-fit-test.stl','pgc-fit-test.stl','light-controller-fit-test.stl','t-one-tray.stl'])await copyFile(`samples/${name}`,`dist-pages/samples/${name}`);
await writeFile('dist-pages/.nojekyll','');
