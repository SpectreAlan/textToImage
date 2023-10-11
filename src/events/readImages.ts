const fs = require('fs')
const path = require('path')
import { ipcMain} from 'electron'

export default ()=>{
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
}