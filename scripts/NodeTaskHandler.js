//const storage = require('node-localstorage');
//const storage2 = require('store2');
const axios = require('axios');
const fs = require('fs');
const cp = require('child_process');

const apiURL = 'http://localhost:80/task-org-api/?entity=nodetask';
//const Promise = require('promise');


let counter = 0;
let dirRelatedTaskCompleted = false;
let watcherTO = null;

/*
function checkDirRelatedTasks() {
    clearTimeout(watcherTO);

    if (dirRelatedTaskCompleted) {
        console.log('Done');
    } else {
        console.log(counter);

        counter++;

        if (counter > 5) dirRelatedTaskCompleted = true;

        watcherTO = setTimeout(function() {
            checkDirRelatedTasks();
        }, 1000);
    }
}
*/

function checkDirRelatedTasks() {
    clearTimeout(watcherTO);

    axios.get(apiURL, {params: {}}).then(function(response) {
        if (response) {
            const tasks = response.data.tasks;
    
            //console.log(response.data.tasks);
            for(let x=0; x<tasks.length; x++) {
                if (tasks[x].task == 'mkdir') {
                    let dir = 'C:\\task-org-files\\' + tasks[x].taskData.dirname;
    
                    //console.log(dir);
    
                    if (!fs.existsSync(dir)){
                        fs.mkdirSync(dir, { recursive: true });
                    }
                } else if (tasks[x].task == 'opendir') {
                    let dir = 'C:\\task-org-files\\' + tasks[x].taskData.dirname;
    
                    if (fs.existsSync(dir)){
                        cp.exec('start "" "' + dir  + '"');
                    }
                }
            }
        }
    });

    watcherTO = setTimeout(function() {
        checkDirRelatedTasks();
    }, 1000);
}

checkDirRelatedTasks();

//let proj = window.localStorage.getItem('ProjectName');

//var localStorage = new storage.LocalStorage('./scratch');
//localStorage.setItem('ProjectName', 'Manish Mandal') ;
//console.log(localStorage.getItem('ProjectName'));

//storage2('ProjName', {name: 'Manish'}); 

//console.log(storage2('ProjName'));
