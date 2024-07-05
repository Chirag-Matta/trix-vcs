#!/usr/bin/env node


import { promises } from 'dns';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { timeStamp } from 'console';
import { stringify } from 'querystring';
import { diffLines } from 'diff';
import chalk from 'chalk';
import { Command } from 'commander';

const program = new Command()

class Trix{
    constructor(repoPath = '.'){
        this.repoPath = path.join(repoPath , '.trix');
        this.objectsPath = path.join(this.repoPath , 'objects'); // trix objects
        this.headPath = path.join(this.repoPath , 'HEAD ');  // trix head
        this.indexPath = path.join(this.repoPath , 'index'); // .trix/index           Stores the path to next commit
        this.init();
    }


    async init(){
        await fs.mkdir(this.objectsPath , {recursive: true});
        try{
            await fs.writeFile(this.headPath ,'' , {flag : 'wx'}); // open to write but FAILS if file EXISTS

            await fs.writeFile(this.indexPath , JSON.stringify([]) , {flag:'wx'});
        }
        catch(error){
            console.log('.trix already initialised');
        }
        
    }


    hashObject(content){
        return crypto.createHash('sha1').update(content , 'utf-8').digest('hex');
    }

    async add(fileToBeAdded){
        const fileData = await fs.readFile(fileToBeAdded , {encoding: 'utf-8'});
        const fileHash = this.hashObject(fileData);
        console.log(fileHash);
        const newFileHashObjectPath = path.join(this.objectsPath , fileHash); // .trix/objects/file
        await fs.writeFile(newFileHashObjectPath , fileData); // Store the actual file data
        await this.updateStagingArea(fileToBeAdded , fileHash);  // adding file to stage area 
    
        console.log(`added ${fileToBeAdded}`);
    }
    
    

    async updateStagingArea(filePath , fileHash){
        const index = JSON.parse(await fs.readFile(this.indexPath , {encoding : 'utf-8'})); // reading existing content if index file

        index.push({path : filePath , hash : fileHash});  // add file to the index
        await fs.writeFile(this.indexPath , JSON.stringify(index)); // write the updated index file

    }

    async commit(message){
        const index = JSON.parse(await fs.readFile(this.indexPath , {encoding : 'utf-8'}));
        const parentCommit = await this.getCurrentHead();

        const commitDetails = {
            timeStamp: new Date().toISOString(),
            message , 
            files: index, 
            parent: parentCommit
        };

        const commitHash = this.hashObject(JSON.stringify(commitDetails)) ;
        const commitPath = path.join(this.objectsPath , commitHash);
        await fs.writeFile(commitPath, JSON.stringify(commitDetails)); 
        await fs.writeFile(this.headPath ,commitHash)      // update the HEAD to the new commit
        await fs.writeFile(this.indexPath, JSON.stringify([])); 
        console.log(`successfully created commit ${commitHash}`);

    }

    async getCurrentHead(){
        try {
            return await fs.readFile(this.headPath , {encoding : 'utf-8'});
            
        } catch (error) {
            return null;   // for the first commit no previous commits present 
        }
            
    }

    async lastCommit(){
        let hdd = await this.getCurrentHead();
        const commitData = JSON.parse(await fs.readFile(path.join(this.objectsPath, hdd),{encoding: 'utf-8'}));
        console.log(commitData);
    }

    async log(){
        let currentCommitHash = await this.getCurrentHead();
        while(currentCommitHash){
            const commitData = JSON.parse(await fs.readFile(path.join(this.objectsPath, currentCommitHash),{encoding: 'utf-8'}));
            console.log('\n\n\n------------------------------------');
            console.log(`commit : ${currentCommitHash} \n commit-time : ${commitData.timeStamp} \n commit-message : ${commitData.message}`);

            currentCommitHash = commitData.parent;
        }
    }

    async showCommitDiff(commitHash) {
        const commitData = JSON.parse(await fs.readFile(path.join(this.objectsPath, commitHash), { encoding: 'utf-8' }));
        // const commitData = JSON.parse(await this.getCommitData(commitHash));

        if (!commitData) {
            console.log('commit not found');
            return;
        }
        console.log('changes in the last commit are:');
        
        for (const file of commitData.files) {
            console.log(`file: ${file.path}`); // index file contains path and hash
            const fileContent = await this.getFileContent(file.hash);
            console.log(`\n\nfile-content: \n\n`, fileContent , '\n\n');
        
            if (commitData.parent) {
                // Get parent commit data
                const parentCommitData = await this.getCommitData(commitData.parent);
                const parentFileContent = await this.getParentFileContent(parentCommitData, file.path);
        
                if (parentFileContent !== undefined) {
                    console.log(`\nDiff\n\n`);
                    const diff = diffLines(parentFileContent, fileContent);
                    
                    console.log(diff);

                    diff.forEach(part => {
                        if (part.added) {
                            console.log(chalk.green(part.value));
                        } else if (part.removed) {
                            console.log(chalk.red(part.value));
                        } else {
                            console.log(chalk.grey(part.value));
                        }
                    });
                    console.log();
                } else {
                    console.log('new file in this commit');
                }
            } else {
                console.log('first commit');
            }
        }
    }
    
    async getCommitData(commitHash) {
        const commitPath = path.join(this.objectsPath, commitHash);
        try {
            const commitData = await fs.readFile(commitPath, { encoding: 'utf-8' });
            return JSON.parse(commitData);
        } catch (error) {
            console.log('failed to read commit-data', error);
            return null;
        }
    }
    

    async getFileContent(fileHash){
        const objectPath = path.join(this.objectsPath , fileHash);
        return await fs.readFile(objectPath , {encoding: 'utf-8'});
    }
    

    async getParentFileContent(parentCommitData , filePath){
        if (!parentCommitData || !parentCommitData.files) {
            console.log('Invalid parent commit data');
            return null;
        }
        const parentFile = parentCommitData.files.find(file => file.path == filePath);
        
        if(parentFile){
            //get the file content from parent commit and return the content
            return await this.getFileContent(parentFile.hash);
        }
    }
}




// (async () => {
//     const trix = new Trix();
//     // trix.init();
//     // await trix.add('sample.txt');
//     // await trix.commit('initial-2 commit');
//     // await trix.add('sample2.txt');
//     // await trix.commit('next2 commit');
//     // await trix.lastCommit();
//     // await trix.log();
//     // const hash = (a5bc458397251508d27d38dfea649fc8fd1dbebb , {encoding : 'utf-8'});
//     console.log(await trix.getFileContent('7c827b383f7fd63d77e95e61f374ecfe1cfb47c0'));

// })();
program.command('init').action(async() =>{
    const trix = new Trix();
});

program.command('add <file>').action(async (file) => {
    const trix = new Trix();
    await trix.add (file);
});

program.command('commit <message>').action(async (message) => {
    const trix = new Trix();
    await trix.commit(message);
});

program.command('log').action(async () => {
    const trix = new Trix();
    await trix.log();
});

program.command('show <commitHash>').action(async (commitHash) => {
    const trix = new Trix();
    await trix.showCommitDiff(commitHash);
});
    
// console.log(process.argv);
program.parse(process.argv);