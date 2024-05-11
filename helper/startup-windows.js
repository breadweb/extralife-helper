import { exec } from 'child_process';

exec('npm run dev', { windowsHide: true }, (error, stdout, stderr) => {
    if (error) {
        console.error(error);
        return;
    }
    console.log(stdout);
    console.error(stderr);
});
