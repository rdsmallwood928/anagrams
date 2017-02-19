'use strict';

const appRootDir = require('app-root-dir').get();
const fs = require('fs');
const path = require('path');
const log = require('winston');

class Dictionary {

  constructor() {
    console.log('app root is: ' + appRootDir);
    const dictionaryRaw = fs.readFileSync(appRootDir + '/src/dictionary/dictionary.txt', 'utf-8');
    this.dictionary = {};
    for(let word of dictionaryRaw.split("\n")) {
      this.dictionary[word] = word;
    }
  }

  getDictionary() {
    return this.dictionary;
  }

  setDictionary(dictionary) {
    this.dictionary = dictionary;
  }

  has(word) {
    const dictionaryWord = this.dictionary[word];
    return (typeof dictionaryWord != 'undefined' && this.dictionary[word] !== null);
  }
}

module.exports = new Dictionary();
