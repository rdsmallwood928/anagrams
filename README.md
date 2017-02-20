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

* GET /words/anagrams_stats.json
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

Setup
=====

--Prerequisites
  nodejs and its tools need to be installed -- https://nodejs.org/en/download/package-manager/

--Optional
  docker if you wish to build the image

--Installation
  -Run 
  ```
  npm install 
  ```

--Running the app
  -Run
  ```
  npm run server
  ```

How does this work?
=====

The real work in determing a words anagrams based on the current dictionary is done in the anagrams service.
There is a function there called findAnagrams which take a word and permute it (Anagrams are just permutations or words).
Thus there are word.length! permutations to check.  This can get a bit cumbersome for larger words.  In order to optimize
a bit we check a dictionary to see if a permutation "may have words".  This means we look at the words in the dictionary
against our current permutation prefix and see if there are words in the dictionary that contain the prefix.  If so, keep
permuting, otherwise abort since that permutation will not have a word.

After we have discovered the anagrams for a word we add it to the anagramsCache.  Since dictionarys don't change very often,
this is useful in order to look up anagrams that have already been requested.  This way we only do the work mentioned above
once.




