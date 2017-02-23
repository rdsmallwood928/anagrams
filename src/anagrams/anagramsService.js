'use strict';

const Dictionary = require('../dictionary/dictionary.js');
const StopWatch = require('node-stopwatch').Stopwatch;
const log = require('winston');
const _ = require('lodash');

class Anagram {

  constructor() {
    this.dictionary = new Dictionary();
    this.anagramsCache = {};
    this.useFreqMap = process.env.USE_FREQ_MAP;
    if(process.env.INIT_ANAGRAMS === "true") {
      this.initAnagramsCache();
    }
    this.useFreqMap = process.env.USE_FREQ_MAP;
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
    const keys = Object.keys(this.dictionary.getDictionary());
    const stopWatch = StopWatch.create();
    stopWatch.start();
    const totalKeys = keys.length;
    let numWords = 0;
    for(let key of keys){
      let anagrams = this.findAnagrams(key);
      this.anagramsCache[key] = anagrams.anagrams;
      numWords++;
      if(numWords % 1000 === 0) {
        log.info(numWords + '/' + totalKeys + ' completed');
      }
      if(numWords % 25000 === 0) {
        log.info('25k anagrams completed in: ' + stopWatch.elapsed.seconds + ' seconds');
      }
    }
    stopWatch.stop();
    log.info('Cache completed in: ' + stopWatch.elapsed.seconds + ' seconds');
  }

  getDictionary() {
    return this.dictionary;
  }

  getWordsWithMostAnagrams() {
    let  max = 0;
    let wordsWithMost = [];
    for(let key of Object.keys(this.anagramsCache)) {
      if((typeof this.anagramsCache[key] !== 'undefined') && (this.anagramsCache[key] !== null)) {
        if(this.anagramsCache[key].length === max) {
          wordsWithMost.push(key);
        } else if(this.anagramsCache[key].length > max) {
          wordsWithMost = [];
          wordsWithMost.push(key);
          max = this.anagramsCache[key].length;
        }
      }
    }
    return {
      "numAnagrams": max,
      "words": wordsWithMost
    };
  }

  /***
  * adds a new word to the anagram cache
  * also when it receives its anagrams, checks the cache to update
  * those words with itself (This should only happen after initialization)
  ***/
  addAnagramToCache(word) {
    if(word.length === 0) {
      return;
    }
    //Need to add word to dictionary since service now holds an instance of the dictionary
    this.dictionary.addWord(word);

    word = word.toLowerCase();
    //No need to add a word if we already have it
    if(this.anagramsCache[word]) {
      return;
    }
    let anagrams = this.findAnagrams(word);
    this.anagramsCache[word] = anagrams.anagrams;
    //add this word to its anagrams as well
    for(let anagram of anagrams.anagrams) {
      let cachedAnagrams = this.anagramsCache[anagram];
      if(cachedAnagrams) {
        if(!cachedAnagrams.includes(word)) {
          cachedAnagrams.push(word);
        }
      }
      this.anagramsCache[anagram] = cachedAnagrams;
    }
    return;
  }

  /***
   * Takes an array of words and determines if they are anagrams
   ***/
  areWordsAnagrams(words) {
    if(words.length === 0) {
      return true;
    }

    //All words need to be the same length in order to anagrams
    let length = words[0].length;
    for(let word of words) {
      if(word.length !== length) {
        return false;
      }
    }
    //Bah the worst!  Lets go ahead and check the words
    let wordsMap = {};
    for(let word of words) {
      wordsMap[word] = word;
    }
    let localDictionary = new Dictionary(words);
    let anagrams = this.findAnagramsWithoutCache(words[0], localDictionary);
    return (anagrams.length === (words.length - 1));
  }

  _deleteWordFromCache(word) {
    //Need to delete word from its anagrams
    let anagrams = this.findAnagrams(word);
    for(let anagram of anagrams.anagrams) {
      let cachedAnagrams = this.anagramsCache[anagram];
      if(cachedAnagrams) {
        let index = cachedAnagrams.indexOf(word);
        if(index > -1) {
          cachedAnagrams.splice(index, 1);
        }
        this.anagramsCache[anagram] = cachedAnagrams;
      }
    }
    //Also delete the word itself
    delete this.anagramsCache[word];
    this.dictionary.deleteWord(word);
    return;
  }

  /***
  * deletes a word from the anagram cache
  ***/
  deleteFromCache(word, deleteAnagrams=false) {
    if(deleteAnagrams) {
      let anagrams = this.findAnagrams(word);
      for(let anagram of anagrams.anagrams) {
        this._deleteWordFromCache(anagram);
      }
    }
    this._deleteWordFromCache(word);
    return;
  }

  clear() {
    this.anagramsCache = {};
    this.dictionary.clear();
  }

  findAnagramsWithoutCache(word, aDictionary=this.dictionary) {
    let anagrams = [];
    //Only permute words the dictionary knows
    if(aDictionary.has(word)) {
      if(this.useFreqMap === "true") {
        anagrams = this.findAnagramsByFrequencyChart(word, aDictionary);
      } else {
        this._permute(word, word, word.length, [], anagrams, {}, aDictionary);
      }
    }
    return anagrams;
  }

  findAnagramsByFrequencyChart(word, aDictionary=this.dictionary) {
    const anagrams = [];
    const wordsOfSameLength = aDictionary.getWordsOfLength(word.length);
    const wordFrequency = this._createFrequencyChartForWord(word);
    for(let otherWord of wordsOfSameLength) {
      if(otherWord !== word) {
        let otherWordFrequency = this._createFrequencyChartForWord(otherWord);
        if(_.isEqual(wordFrequency, otherWordFrequency)) {
          anagrams.push(otherWord);
        }
      }
    }
    return anagrams;
  }

  _createFrequencyChartForWord(word) {
    const frequencyChart = {};
    for(let i=0; i<word.length; i++) {
      let letter = word.charAt(i);
      if(!frequencyChart[letter]) {
        frequencyChart[letter]=1;
      } else {
        frequencyChart[letter]++;
      }
    }
    return frequencyChart;
  }

  _filterAnagrams(anagrams, includeProperNouns, max, aDictionary) {
    //Check for proper nouns first if we need to
    let properNouns = [];
    if(includeProperNouns === false || includeProperNouns === "false") {
      for(let i=0; i<anagrams.length; i++) {
        if(aDictionary.isProperNoun(anagrams[i])) {
          anagrams.splice(i, 1);
          i--;
        }
      }
    }

    //Then check max results
    if(max >= 0 && max < anagrams.length) {
      anagrams = anagrams.slice(0, max);
    }
    return anagrams;
  }

  findAnagrams(word, max=-1, includeProperNouns=true, aDictionary=this.dictionary) {
    let anagrams = [];
    if(typeof this.anagramsCache[word] !== 'undefined' && this.anagramsCache[word] !== null) {
      //return a copy of the cached array
      anagrams = this.anagramsCache[word].slice();
    } else {
      anagrams = this.findAnagramsWithoutCache(word, aDictionary);
      this.anagramsCache[word] = anagrams;
    }
    return {
      "anagrams" : this._filterAnagrams(anagrams, includeProperNouns, max, aDictionary)
    };
  }

  _permute(originalWord, word, length, prefix, anagrams, checkedPrefixes, aDictionary) {
    if(word.length === 0) {
      if(prefix != originalWord && !anagrams.includes(prefix) && aDictionary.has(prefix)) {
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
        if(aDictionary.mayHaveSomeWords(newPrefix, originalWord.length)) {
          this._permute(originalWord, newWord, length, newPrefix, anagrams, checkedPrefixes, aDictionary);
        }
      }
    }
  }
}

module.exports = new Anagram();
