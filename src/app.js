'use strict';

const express = require('express');
const log = require('winston');
const anagramService = require('./anagrams/anagramsService.js');
const bodyParser = require('body-parser');
const multer = require('multer');

const upload = multer();
const app = express();

const FOUR_HUNDRED_MESSAGE = 'No body provided, should be { "words": [<words>] }, Don\'t forget application/json header as well';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('OK');
});

app.get('/anagrams/:word.json', (req, res) => {
  let max = -1;
  let properNouns = true;
  if(req.query.max) {
    max = req.query.max;
  }
  if(req.query.properNouns) {
    properNouns = req.query.properNouns;
  }
  log.info('Request for word: ' + req.params.word.split('.')[0] + ' anagrams recieved! Only want to see ' +
    max + ' anagrams');
  const anagrams = anagramService.findAnagrams(req.params.word.split('.')[0], max, properNouns);
  res.send(anagrams);
});

app.post('/words/are_anagrams.json', (req, res) => {
  if(!req.body) {
    res.status(400).send(FOUR_HUNDRED_MESSAGE);
    return;
  }
  const body = req.body;
  if(!body.words) {
    res.status(400).send(FOUR_HUNDRED_MESSAGE);
    return;
  }
  const areAnagrams = anagramService.areWordsAnagrams(body.words);
  res.json({"areAnagrams": areAnagrams});
});

app.post('/words.json', upload.array(), (req, res) => {
  if(!req.body) {
    res.status(400).send(FOUR_HUNDRED_MESSAGE);
    return;
  }
  const body = req.body;
  if(!body.words) {
    res.status(400).send(FOUR_HUNDRED_MESSAGE);
    return;
  }
  for(let word of body.words) {
    anagramService.addAnagramToCache(word);
  }
  return res.status(201).send('Created');
});

app.delete('/words.json', (req, res) => {
  log.info('Delete received!');
  anagramService.clear();
  return res.status(204).send('No Content');
});

app.delete('/words/:word.json', (req, res) => {
  const word = req.params.word.split('.')[0];
  let deleteAnagrams = false;
  if(req.query.anagrams) {
    deleteAnagrams = req.query.anagrams;
  }
  log.info('Deleted: ' + word);
  anagramService.deleteFromCache(word, deleteAnagrams);
  return res.send('OK');
});

app.get('/words/stats.json', (req, res) => {
  const stats = anagramService.getDictionary().getStats();
  return res.json(stats);
});

app.get('/words/anagram_stats.json', (req, res) => {
  const stats = anagramService.getWordsWithMostAnagrams();
  return res.json(stats);
});

if(process.env.INIT_ANAGRAM_CACHE === "true") {
  anagramService.initAnagramsCache();
}

app.listen(3000, () => {
  log.info('Anagrams app running on port 3000');
});

module.exports = app;
