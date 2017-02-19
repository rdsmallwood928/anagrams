'use strict';

const anagram = require('./anagrams.js');

describe('Anagrams finder', () => {

  it('Should find all anagrams for a word with a given dictionary', () => {
    expect(anagram.findAnagrams('read')).to.deep.equal({
      'anagrams': [
        'dear',
        'dare'
      ]
    });
  });
});
