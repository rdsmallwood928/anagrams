'use strict';

const dictionary = require('../dictionary/dictionary.js');
const StopWatch = require('node-stopwatch').Stopwatch;

class Anagram {

  constructor() {
    this.anagramsCache = {};
  }

  initAnagramsCache() {
    const keys = Object.keys(dictionary.getDictionary());
    const stopWatch = StopWatch.create();
    stopWatch.start();
    const totalKeys = keys.length;
    let numWords = 0;
    for(let key of keys){
      let anagrams = this.findAnagrams(key);
      this.anagramsCache[key] = anagrams.anagrams;
      numWords++;
      if(numWords % 1000 === 0) {
        console.log('!!! ' + numWords + '/' + totalKeys + ' completed');
      }
    }
    stopWatch.stop();
    console.log('!!! Cache completed in: ' + stopWatch.elapsed.seconds + ' seconds');
  }

  findAnagrams(word, max) {
    let anagrams = [];
    if(typeof this.anagramsCache[word] !== 'undefined' && this.anagramsCache[word] !== null) {
      anagrams = this.anagramsCache[word];
    } else {
      this._permute(word, word, word.length, [], anagrams, {});
    }
    if(max >= 0) {
      anagrams = anagrams.slice(0, max);
    }
    return {
      "anagrams" : anagrams
    };
  }

  _permute(originalWord, word, length, prefix, anagrams, checkedPrefixes) {
    if(word.length === 0) {
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
      if(typeof checkedPrefixes[newPrefix] == 'undefined' || checkedPrefixes[newPrefix] === null) {
        checkedPrefixes[newPrefix] = newPrefix;
        if(dictionary.mayHaveSomeWords(newPrefix)) {
          this._permute(originalWord, newWord, length, newPrefix, anagrams, checkedPrefixes);
        }
      }
    }
  }
}

module.exports = new Anagram();
