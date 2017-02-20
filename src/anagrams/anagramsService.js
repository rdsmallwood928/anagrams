'use strict';

const dictionary = require('../dictionary/dictionary.js');
const StopWatch = require('node-stopwatch').Stopwatch;

class Anagram {

  constructor() {
    this.anagramsCache = {};
  }

  /***
   * TAKES A LONG TIME! BE CAREFUL
   * This method goes through the dictionary and finds all anagrams
   * for every single word then adds them to to cache
   *
   * This should really only ever be called at start up so that we can
   * get constant time lookups of anagrams
   ***/
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

  /***
   * adds a new word to the anagram cache
   * also when it receives its anagrams, checks the cache to update
   * those words with itself (This should only happen after initialization)
   ***/
  addAnagramToCache(word) {
    //No need to add a word if we already have it
    if(this.anagramsCache[word]) {
      return;
    }
    let anagrams = this.findAnagrams(word);
    this.anagramsCache[word] = anagrams.anagrams;
    for(let anagram of anagrams.anagrams) {
      let cachedAnagrams = this.anagramsCache[word];
      if(cachedAnagrams) {
        if(!cachedAnagrams.includes(word)) {
          cachedAnagrams.push(word);
        }
      }
      this.anagramsCache[word] = cachedAnagrams;
    }
  }

  findAnagrams(word, max) {
    let anagrams = [];
    if(typeof this.anagramsCache[word] !== 'undefined' && this.anagramsCache[word] !== null) {
      anagrams = this.anagramsCache[word];
      console.log('!!! Cache hit: ' + word);
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
