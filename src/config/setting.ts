const fs = require('fs');
const path = require('path');

const defaultConfig = {
    "notify": 1
}

export const readConfig = (app, win)=>{
    const configPath = path.join(app.getPath('userData'), 'config.json');

    if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath, 'utf-8');
        win.webContents.send('trigger-vue-about', JSON.parse(configData))
    }else{
        writeConfig(app, defaultConfig)
    }
}

export const writeConfig = (app, config)=>{
    const configPath = path.join(app.getPath('userData'), 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config));
}