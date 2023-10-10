import { app, BrowserWindow, ipcMain  } from 'electron'
const installExtension = require('electron-devtools-installer');
const fs = require('fs')
const path = require('path')

app.whenReady().then(async () => {
    const win = await new BrowserWindow({
        width: 1000,
        height: 700,

        webPreferences: {
            nodeIntegration: true, // 启用Node.js集成
            contextIsolation: false, // 禁用上下文隔离
            webSecurity: false, // 禁用web安全策略
        }
    })
    installExtension.default(installExtension.VUEJS_DEVTOOLS)
        .then(name => {
            console.log(`Added Extension: ${name}`);
            // 打开开发者工具
            win.webContents.openDevTools();
        })
        .catch(err => console.log('An error occurred: ', err));
    // 根据命令行参数加载URL或本地文件
    if (process.argv[2]) {
        win.loadURL(process.argv[2])
    } else {
        win.loadFile('index.html')
    }

    ipcMain.on('read-directory', (event, directoryPath) => {
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                event.sender.send('read-directory-response', { error: err.message });
            } else {
                const imageFilePattern = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;
                const results = files.filter(file=>imageFilePattern.test(file)).map((file) => path.join(directoryPath, file));
                event.sender.send('read-directory-response', results);
            }
        });
    });
})
