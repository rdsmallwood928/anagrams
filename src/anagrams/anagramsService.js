'use strict';

const dictionary = require('../dictionary/dictionary.js');

class Anagram {

  constructor() {
    this.anagramsCache = {};
    this._initAnagramsCache();
  }

  _initAnagramsCache() {
    const keys = Object.keys(dictionary.getDictionary());
    for(let key of keys){
      let anagrams = this.findAnagrams(key);
      this.anagramsCache[key] = anagrams.anagrams;
      console.log(key + ' : ' + this.anagramsCache[key]);
    }
  }

  findAnagrams(word) {
    let anagrams = [];
    this._permute(word, word, word.length, [], anagrams);
    return {
      "anagrams" : anagrams
    };
  }

  _permute(originalWord, word, length, prefix, anagrams) {
    if(word.length === 0) {
      console.log('!!! Checking ' + prefix);
      if(prefix != originalWord && !anagrams.includes(prefix) && dictionary.has(prefix)) {
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
