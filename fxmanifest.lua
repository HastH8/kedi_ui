fx_version 'cerulean'
game 'gta5'

author 'Kedi.ss'
description 'UI System with Textui, Progress Bar and Notify system'
version '1.0.0'

ui_page 'html/index.html'

files {
    'html/app.js',
    'html/index.html',
    'html/styles.css'
}

client_scripts {
    'client/main.lua'
}

exports {
    'ShowNotification',
    'StartProgress',
    'UpdateProgress',
    'EndProgress',
    'ShowTextUI',
    'UpdateTextUI',
    'HideTextUI'
}