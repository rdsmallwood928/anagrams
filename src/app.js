'use strict';

const dictionary = require('./dictionary/dictionary.js');
const express = require('express');
const log = require('winston');
const anagramService = require('./anagrams/anagramsService.js');

const app = express();

app.get('/', (req, res) => {
  res.send(dictionary.getDictionary());
});

app.get('/anagrams/:word.json', (req, res) => {
  let max = -1;
  if(req.query.max) {
    max = req.query.max;
  }
  log.info('Request for word: ' + req.params.word.split('.')[0] + ' anagrams recieved! Only want to see ' + 
    max + ' anagrams');
  const anagrams = anagramService.findAnagrams(req.params.word.split('.')[0], max);
  res.send(anagrams);
});


app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
