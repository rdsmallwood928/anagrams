Anagrams
======

A server that will return anagrams and stats about them

Overview
=====

Endpoints

* GET /anagrams/:word.json?max=<max number of anagrams>&properNouns=<should include proper nouns>
	returns a json object that contains a words anagrams based on the systems current dictionary
    Also optionally takes query params max that will limit the number of results and properNouns
    that will filter out properNouns

* GET /words/stats.json
	returns a JSON object with number of words in the dictionary, length of the longest word,
		length of the shortest word, the average length of words, median length

**** GET /words/anagrams_stats.json
  returns a JSON object with stats about the current anagrams in the dictionary
   It should include the words with the most anagrams and how many anagrams they have

* POST /words/are_anagrams.json
  Takes a list of words as a JSON object (ie {words: [<words go here>]) and determines if they
  are anagrams of each other

* POST /words.json
  Takes a list of words as a JSON object (ie {words: [<words go here>]) and adds them to dictionary

* DELETE /words.json
  Will delete the entire dictionary

* DELETE /words/:word.json?anagrams=<delete words anagrams too>
  Will delete a words from the dictionary, also optionally takes a anagrams query param that will
  delete the words anagrams as well


