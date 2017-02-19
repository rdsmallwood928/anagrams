'use strict';

const anagram = require('./anagramsService.js');
const dictionary = require('../dictionary/dictionary.js');

describe('Anagrams finder', () => {

  beforeEach(() => {
    dictionary.setDictionary({
      "read": "read",
      "dear": "dear",
      "dare": "dare",
      "Batman": "Batman"
    });
  });

  it('Should find all anagrams for a word with a given dictionary', () => {
    expect(anagram.findAnagrams('read')).to.deep.equal({
      'anagrams': [
        'dear',
        'dare'
      ]
    });
  });

  it('Should take a max number of anagrams', () => {
    expect(anagram.findAnagrams('read', 1)).to.deep.equal({
      'anagrams': [
        'dear'
      ]
    });
  });
});
