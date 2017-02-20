'use strict';

const _ = require('lodash');

class WordTreeNode {

  constructor(letter = '', myParent = null) {
    this._children = {};
    this.letter = letter;
    this.myParent = myParent;
  }

  addChild(letter, child) {
    this._children[letter] = child;
  }

  removeChild(letter) {
    if(letter) {
      delete this._children[letter];
    }
  }

  hasChild(letter) {
    return (typeof this._children[letter] !== 'undefined' && this._children[letter] !== null);
  }

  hasChildren() {
    return _.isEmpty(this._children);
  }

  getChild(letter) {
    return this._children[letter];
  }

  getParent() {
    return this.myParent;
  }

  getLetter() {
    return this.letter;
  }
}

module.exports = WordTreeNode;
