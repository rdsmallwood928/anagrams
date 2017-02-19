'use strict';

const dictionary = require('./dictionary/dictionary.js');
const express = require('express');
const log = require('winston');
let app = express();

app.get('/', (req, res) => {
  res.send(dictionary.getDictionary());
});

app.get('/anagrams/:word', (req, res) => {
  log.info("Request for anagram recieved!");
  res.send("You requested: " + req.params.word);
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
