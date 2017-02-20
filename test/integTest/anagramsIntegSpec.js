'use strict';

const app = require('../../src/app.js');
const http = require('request-promise');

describe('Anagram integ tests', () => {

  let options = {};

  const deleteDictionary = {
    uri: 'http://localhost:3000/words.json',
    headers: {
      'User-Agent': 'Request-Promise'
    },
    method: 'DELETE'
  };

  const getAnagram = {
    uri: 'http://localhost:3000/anagrams/read.json',
    headers: {
      'User-Agent': 'Request-Promise'
    },
    method: 'GET',
    json: true
  };

  const getDifferentAnagram = {
    uri: 'http://localhost:3000/anagrams/dare.json',
    headers: {
      'User-Agent': 'Request-Promise'
    },
    method: 'GET',
    json: true
  };

  const getAnagramOneMax = {
    uri: 'http://localhost:3000/anagrams/read.json?max=1',
    headers: {
      'User-Agent': 'Request-Promise'
    },
    method: 'GET',
    json: true
  };

  const addThreeWordsTwoAnagrams = {
    uri: 'http://localhost:3000/words.json',
    headers: {
      'User-Agent': 'Request-Promise',
      'Content-Type': 'application/json'
    },
    body: {
      "words": ["read", "dear", "batman"]
    },
    method: 'POST',
    json:true
  };

  const addAnotherWord = {
    uri: 'http://localhost:3000/words.json',
    headers: {
      'User-Agent': 'Request-Promise',
      'Content-Type': 'application/json'
    },
    body: {
      "words": ["dare"]
    },
    method: 'POST',
    json:true
  };

  const deleteAWord = {
    uri: 'http://localhost:3000/words/dare.json',
    headers: {
      'User-Agent': 'Request-Promise'
    },
    method: 'DELETE',
    json: true
  };

  beforeEach(() => {
    options = deleteDictionary;
    return http(options).then((response) => {
      console.log(response);
    });
  });

  it('should not have any words to start', () => {
    options = getAnagram;
    return http(options).then((response) => {
      expect(response.anagrams.length).to.equal(0);
    });
  });

  it('should add some words', () => {
    options = addThreeWordsTwoAnagrams;
    return http(options).then((response) => {
      expect(response).to.equal('Created');
      return http(getAnagram);
    }).then((response) => {
      expect(response).to.deep.equal({
        "anagrams": [
          "dear"
        ]
      });
    });
  });

  it('should add some words then add some more and still get the right anagrams', () => {
    options = addThreeWordsTwoAnagrams;
    return http(options).then((response) => {
      expect(response).to.equal('Created');
      return http(addAnotherWord);
    }).then((response) => {
      expect(response).to.equal('Created');
      return http.get(getAnagram);
    }).then((response) => {
      expect(response).to.deep.equal({
        "anagrams": [
          "dear",
          "dare"
        ]
      });
      return http(getAnagramOneMax);
    }).then((response) => {
      expect(response).to.deep.equal({
        "anagrams": [
          "dear",
        ]
      });
    });
  });

  it('should add some words then delete them and get the right anagrams', () => {
    options = addThreeWordsTwoAnagrams;
    return http(options).then((response) => {
      expect(response).to.equal('Created');
      return http(addAnotherWord);
    }).then((response) => {
      expect(response).to.equal('Created');
      return http.get(getAnagram);
    }).then((response) => {
      expect(response).to.deep.equal({
        "anagrams": [
          "dear",
          "dare"
        ]
      });
      return http(getAnagramOneMax);
    }).then((response) => {
      expect(response).to.deep.equal({
        "anagrams": [
          "dear",
        ]
      });
      return http(deleteAWord);
    }).then((response) => {
      expect(response).to.equal('OK');
      return http(getAnagram);
    }).then((response) => {
      expect(response).to.deep.equal({
        "anagrams": [
          "dear",
        ]
      });
      return http(getDifferentAnagram);
    }).then((response) => {
      expect(response).to.deep.equal({
        "anagrams": []
      });
      return http(deleteDictionary);
    }).then((response) => {
      return http(getAnagram);
    }).then((response) => {
      expect(response).to.deep.equal({
        "anagrams": []
      });
    });
  });
});
