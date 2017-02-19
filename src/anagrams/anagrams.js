'use strict';

const dictionary = require('../dictionary/dictionary.js');

class Anagram {

  constructor() { }

  findAnagrams(word) {
    let anagrams = [];
    this._permute(word, word, word.length, [], anagrams);
    return anagrams;
  }

  _permute(originalWord, word, length, prefix, anagrams) {
    if(word.length === 0) {
      if(dictionary.has(prefix) && prefix != originalWord) {
        anagrams.push(prefix);
        return;
      }
    }
    let newWord = null;
    let newPrefix = null;
    for(let i=0; i<word.length; i++) {
      newWord = word.substring(0, i) + word.substring(i+1, word.length);
      newPrefix = prefix + word.charAt(i);
      this._permute(originalWord, newWord, length, newPrefix, anagrams);
    }
  }
}

module.exports = new Anagram();
