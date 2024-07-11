const { exec } = require('child_process');
const targetUrl = "https://start.frigid/";
export const managerBrowser = (browser) => {
    switch (browser.toLowerCase()) {
        case 'chrome':
            openChrome(targetUrl);
            break;
        case 'edge':
            openEdge(targetUrl);
            break;
        case 'firefox':
            openFirefox(targetUrl);
            break;
        case 'opera':
            openOpera(targetUrl);
            break;
        case 'brave':
            openBrave(targetUrl);
            break;
        default:
            console.error('Browser not found');
    }
};

function openEdge(targetUrl) {
    const command = (process.platform === 'win32') 
        ? `start msedge "${targetUrl}"` 
        : (process.platform === 'darwin') 
        ? `open -a "Microsoft Edge" "${targetUrl}"` 
        : `microsoft-edge "${targetUrl}"`;
    exec(command, handleExecError);
}

function openOpera(targetUrl) {
    const command = (process.platform === 'win32') 
        ? `start opera "${targetUrl}"` 
        : (process.platform === 'darwin') 
        ? `open -a "Opera" "${targetUrl}"` 
        : `opera "${targetUrl}"`;
    exec(command, handleExecError);
}

function openBrave(targetUrl) {
    const command = (process.platform === 'win32') 
        ? `start brave "${targetUrl}"` 
        : (process.platform === 'darwin') 
        ? `open -a "Brave Browser" "${targetUrl}"` 
        : `brave-browser "${targetUrl}"`;
    exec(command, handleExecError);
}

function openChrome(targetUrl) {
    const command = (process.platform === 'win32') 
        ? `start chrome "${targetUrl}"` 
        : (process.platform === 'darwin') 
        ? `open -a "Google Chrome" "${targetUrl}"` 
        : `google-chrome "${targetUrl}"`;
    exec(command, handleExecError);
}

function openFirefox(targetUrl) {
    const command = (process.platform === 'win32') 
        ? `start firefox "${targetUrl}"` 
        : (process.platform === 'darwin') 
        ? `open -a "Firefox" "${targetUrl}"` 
        : `firefox "${targetUrl}"`;
    exec(command, handleExecError);
}

function handleExecError(error, stdout, stderr) {
    if (error) {
        console.error(`Error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
    }
    console.log(`Stdout: ${stdout}`);
}

