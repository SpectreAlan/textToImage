import {app, BrowserWindow, ipcMain, Menu} from 'electron'

const installExtension = require('electron-devtools-installer');
const fs = require('fs')
const path = require('path')

app.whenReady().then(async () => {
    const win = await new BrowserWindow({
        width: 1000,
        height: 700,
        icon: path.join(__dirname, './assets/logo.png'),

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
        }
    })
    win.setMinimumSize(1000, 700)

    const template = [
        {
            label: '程序',
            submenu: [
                { label: '退出', role: 'quit' },
                {
                    label: '重载',
                    click: () => {
                        win.webContents.reload()
                    }
                }
            ]
        },
        {
            label: '帮助',
            submenu: [
                { label: '关于', click: () => win.webContents.send('trigger-vue-about') }
            ]
        }
    ];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    if (process.env.NODE_ENV === 'development') {
        installExtension.default(installExtension.VUEJS_DEVTOOLS)
            .then(name => {
                console.log(`Added Extension: ${name}`);
                // 打开开发者工具
                win.webContents.openDevTools();
            })
            .catch(err => console.log('An error occurred: ', err));
    }

    if (process.argv[2]) {
        win.loadURL(process.argv[2])
    } else {
        win.loadFile('index.html')
    }


    ipcMain.on('read-directory', (event, directoryPath) => {
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                event.sender.send('read-directory-response', {error: err.message});
            } else {
                const imageFilePattern = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;
                const results = files.filter(file => imageFilePattern.test(file)).map((file) => path.join(directoryPath, file));
                event.sender.send('read-directory-response', results);
            }
        });
    });
})
