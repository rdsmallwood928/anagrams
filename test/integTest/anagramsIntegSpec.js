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

  const getAnagramOneMax = {
    uri: 'http://localhost:3000/anagrams/read.json?max=1',
    headers: {
      'User-Agent': 'Request-Promise'
    },
    method: 'GET',
    json: true
  };

  const getAnagramNoProperNouns = {
    uri: 'http://localhost:3000/anagrams/read.json?properNouns=false',
    headers: {
      'User-Agent': 'Request-Promise'
    },
    method: 'GET',
    json: true
  };

  const getAnagramNoProperNounsAndMax = {
    uri: 'http://localhost:3000/anagrams/read.json?properNouns=false&max=1',
    headers: {
      'User-Agent': 'Request-Promise'
    },
    method: 'GET',
    json: true
  };



  const getStats = {
    uri: 'http://localhost:3000/words/stats.json',
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

  const addThreeProperNounsTwoAnagrams = {
    uri: 'http://localhost:3000/words.json',
    headers: {
      'User-Agent': 'Request-Promise',
      'Content-Type': 'application/json'
    },
    body: {
      "words": ["Adre", "Drea", "Joker"]
    },
    method: 'POST',
    json: true
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
    return http(options).then((response) => {});
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
    return http(addThreeWordsTwoAnagrams).then((response) => {
      expect(response).to.equal('Created');
      return http(addAnotherWord);
    }).then((response) => {
      expect(response).to.equal('Created');
      return http(getAnagram);
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

  it('should report stats', () => {
    options = addThreeWordsTwoAnagrams;
    return http(options).then((response) => {
      expect(response).to.equal('Created');
      return http(addAnotherWord);
    }).then((response) => {
      expect(response).to.equal('Created');
      return http(getStats);
    }).then((response) => {
      expect(response).to.deep.equal({
        "numWords": 4,
        "max": 6,
        "min": 4,
        "median": 4,
        "average": 4.5
      });
    });
  });

  it('should report stats with an empty dictionary', () => {
    options = addThreeWordsTwoAnagrams;
    return http(getStats).then((response) => {
      expect(response).to.deep.equal({
        "numWords": 0,
        "max": 0,
        "min": 0,
        "average": 0,
        "median": 0
      });
    });
  });

  it('should not return proper nouns', () => {
    return http(addThreeWordsTwoAnagrams).then((response) => {
      return http(addThreeProperNounsTwoAnagrams);
    }).then((response) => {
      return http(getAnagramNoProperNouns);
    }).then((response) => {
      expect(response).to.deep.equal({
        "anagrams": [
          "dear"
        ]
      });
    });
  });

  it('should not return proper nouns and take a max', () => {
    return http(addThreeWordsTwoAnagrams).then((response) => {
      return http(addThreeProperNounsTwoAnagrams);
    }).then((response) => {
      return http(addAnotherWord);
    }).then((response) => {
      return http(getAnagramNoProperNounsAndMax);
    }).then((response) => {
      expect(response).to.deep.equal({
        "anagrams": [
          "dear"
        ]
      });
    });
  });

});
