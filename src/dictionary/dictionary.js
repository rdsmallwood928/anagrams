'use strict';

const appRootDir = require('app-root-dir').get();
const fs = require('fs');
const path = require('path');
const log = require('winston');
const WordTreeNode = require('./wordTreeNode.js');
const quicksort = require('quicksort');

class Dictionary {

  constructor(dictionaryRaw) {
    if(!dictionaryRaw) {
      dictionaryRaw = fs.readFileSync(appRootDir + '/src/dictionary/dictionary.txt', 'utf-8');
      dictionaryRaw = dictionaryRaw.split("\n");
    }
    this._init(dictionaryRaw);
  }

  _init(dictionaryRaw) {
    this.dictionary = {};
    this.nonProperNouns = {};
    this.wordsByLength = {};
    this.wordTreesByLength = {};
    for(let word of dictionaryRaw) {
      this.addWord(word);
    }
  }

  _createWordTree() {
    let wordTree = new WordTreeNode("", null);
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    for(let i=0; i<alphabet.length; i++) {
      wordTree.addChild(alphabet.charAt(i), new WordTreeNode(alphabet.charAt(i), wordTree));
    }
    return wordTree;
  }

  getDictionary() {
    return this.dictionary();
  }

  addWord(word) {
    //Don't add words we already have or empty words
    if(this.dictionary[word.toLowerCase()] || word.length === 0) {
      return;
    }
    if(word.charAt(0) !== word.charAt(0).toUpperCase()) {
      this.nonProperNouns[word.toLowerCase()] = word.toLowerCase();
    }
    word = word.toLowerCase();
    this.dictionary[word] = word;
    if(!this.wordTreesByLength[word.length]) {
      this.wordTreesByLength[word.length] = this._createWordTree();
    }
    let currentNode = this.wordTreesByLength[word.length];
    for(let i=0; i<word.length; i++) {
      let letter = word.charAt(i);
      if(!currentNode.hasChild(letter)) {
        currentNode.addChild(letter, new WordTreeNode(letter, currentNode));
      }
      currentNode = currentNode.getChild(letter);
    }

    if(!this.wordsByLength[word.length]) {
      this.wordsByLength[word.length] = [];
    }
    this.wordsByLength[word.length].push(word);

    for(let i=0; i<word.length; i++) {
      let letter = word.charAt(i);
      if(!currentNode.hasChild(letter)) {
        currentNode.addChild(letter, new WordTreeNode(letter, currentNode));
      }
      currentNode = currentNode.getChild(letter);
    }
  }

  deleteWord(word) {
    word = word.toLowerCase();
    delete this.dictionary[word];
    delete this.nonProperNouns[word];
    let currentNode =  this.wordTreesByLength[word.length];
    for(let i=0; i<word.length; i++) {
      currentNode = currentNode.getChild(word.charAt(i));
    }
    let deleteKey = '';
    while(!currentNode.hasChildren() && currentNode.getParent() !== null) {
      deleteKey = currentNode.getLetter();
      currentNode = currentNode.getParent();
      currentNode.removeChild(deleteKey);
    }
    for(let i=0; i<this.wordsByLength[word.length]; i++) {
      if(this.wordsByLength[word.length][i] === word) {
        this.wordsByLength[word.length].splice(i, 1);
        i = this.wordsByLength[word.length].length;
      }
    }
  }

  isProperNoun(word) {
    return (typeof this.nonProperNouns[word] === 'undefined' || this.nonProperNouns[word] === null);
  }

  getWordsOfLength(length) {
    return this.wordsByLength[length];
  }

  /**
   * Will return stats about the dictionary
   **/
  getStats() {
    let min = Number.MAX_VALUE;
    let max = 0;
    let numWords = 0;
    let totalLetters = 0;
    let lengthArray = [];
    for(let word of Object.keys(this.dictionary)) {
      numWords++;
      if(word.length > max) {
        max = word.length;
      }
      if(word.length < min) {
        min = word.length;
      }
      lengthArray.push(word.length);
      totalLetters = totalLetters + word.length;
    }
    lengthArray.sort();
    let middle = Math.floor(lengthArray.length/2);
    let median = 0;
    if(lengthArray.length > 0) {
      if(lengthArray.length % 2) {
        median = lengthArray[middle];
      } else {
        median = (lengthArray[middle-1] + lengthArray[middle])/2;
      }
    }
    if(min == Number.MAX_VALUE) {
      min = 0;
    }
    let average = 0;
    if(numWords > 0) {
      average = totalLetters/numWords;
    }
    return {
      "numWords": numWords,
      "max": max,
      "min": min,
      "average": average,
      "median": median
    };
  }

  getDictionary() {
    return this.dictionary;
  }

  clear() {
    this._init("");
  }

  setDictionary(dictionary) {
    this.dictionary = dictionary;
  }

  has(word) {
    const dictionaryWord = this.dictionary[word];
    return (typeof dictionaryWord != 'undefined' && this.dictionary[word] !== null);
  }

  mayHaveSomeWords(word, originalWordLength) {
    let currentNode = this.wordTreesByLength[originalWordLength];
    for(let i=0; i<word.length; i++) {
      let letter = word.charAt(i);
      if(currentNode.hasChild(letter)) {
        currentNode = currentNode.getChild(letter);
      } else {
        return false;
      }
    }
    return true;
  }
}

module.exports = Dictionary;
