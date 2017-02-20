'use strict';

const appRootDir = require('app-root-dir').get();
const fs = require('fs');
const path = require('path');
const log = require('winston');
const WordTreeNode = require('./wordTreeNode.js');

class Dictionary {

  constructor() {
    const dictionaryRaw = fs.readFileSync(appRootDir + '/src/dictionary/dictionary.txt', 'utf-8');
    this._init(dictionaryRaw);
  }

  _init(dictionaryRaw) {
    this.dictionary = {};
    this.wordTree = new WordTreeNode("", null);
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    for(let i=0; i<alphabet.length; i++) {
      this.wordTree.addChild(alphabet.charAt(i), new WordTreeNode(alphabet.charAt(i), this.wordTree));
    }

    for(let word of dictionaryRaw.split("\n")) {
      this.addWord(word);
    }
  }

  addWord(word) {
    //Don't add words we already have
    if(this.dictionary[word]) {
      return;
    }
    word = word.toLowerCase();
    this.dictionary[word] = word;
    let currentNode = this.wordTree;
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
    let currentNode =  this.wordTree;
    for(let i=0; i<word.length; i++) {
      currentNode = currentNode.getChild(word.charAt(i));
    }
    let deleteKey = '';
    while(!currentNode.hasChildren() && currentNode.getParent() !== null) {
      deleteKey = currentNode.getLetter();
      currentNode = currentNode.getParent();
      currentNode.removeChild(deleteKey);
    }
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

  mayHaveSomeWords(word) {
    let currentNode = this.wordTree;
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

module.exports = new Dictionary();
