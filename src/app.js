'use strict';

const dictionary = require('./dictionary/dictionary.js');
const express = require('express');
const log = require('winston');
const anagramService = require('./anagrams/anagramsService.js');
const bodyParser = require('body-parser');
const multer = require('multer');

const upload = multer();
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

app.post('/words.json', upload.array(), (req, res) => {
  const fourHundredMessage = 'No body provided, should be { "words": [<words>] }, Don\'t forget application/json header as well';
  if(!req.body) {
    res.status(400).send(fourHundredMessage);
    return;
  }
  const body = req.body;
  if(!body.words) {
    res.status(400).send(fourHundredMessage);
    return;
  }
  for(let word of body.words) {
    dictionary.addWord(word);
  }
  for(let word of body.words) {
    anagramService.addAnagramToCache(word);
  }
  return res.status(201).send('Created');
});

app.delete('/words.json', (req, res) => {
  log.info('Delete received!');
  dictionary.clear();
  anagramService.clear();
  return res.status(204).send('No Content');
});

app.delete('/words/:word.json', (req, res) => {
  const word = req.params.word.split('.')[0];
  log.info('Deleted: ' + word);
  dictionary.deleteWord(word);
  anagramService.deleteFromCache(word);
  res.send('OK');
});

app.listen(3000, () => {
  log.info('Anagrams app running on port 3000');
});

module.exports = app;
