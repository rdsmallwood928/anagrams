'use strict';

class WordTreeNode {

  constructor(letter) {
    this._children = {};
    this.letter = letter;
  }

  addChild(letter, child) {
    this._children[letter] = child;
  }

  hasChild(letter) {
    return (typeof this._children[letter] !== 'undefined' && this._children[letter] !== null);
  }

  getChild(letter) {
    return this._children[letter];
  }
}

module.exports = WordTreeNode;
