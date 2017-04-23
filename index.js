/* jshint node: true, esversion:6 */
/**
 * predictGender
 * v0.0.2
 *
 * Predict the gender of a string's author.
 *
 * Help me make this better:
 * https://github.com/phugh/predictGender
 *
 * Based on this paper:
 * Schwartz, H. A., Eichstaedt, J. C., Kern, M. L., Dziurzynski, L., Ramones, S. M., Agrawal, M., Shah, A., Kosinski, M., Stillwell, D., Seligman, M. E., & Ungar, L. H. (2013). Personality, gender, and age in the language of social media: The Open-Vocabulary Approach. PLOS ONE, 8(9), . . e73791.
 *
 * Using the gender lexicon data from http://www.wwbp.org/lexica.html
 * Used under the Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported licence
 *
 * (C) 2017 P. Hughes
 * Licence : Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 * http://creativecommons.org/licenses/by-nc-sa/3.0/
 *
 * Usage example:
 * const pg = require('predictgender);
 * const text = "A big long string of text...";
 * let gender = pg(text);
 * console.log(gender)
 *
 * @param {string} str  {input string}
 * @return {string} {predicted gender}
 */

'use strict'
;(function () {
  const root = this
  const previous = root.predictGender

  const hasRequire = typeof require !== 'undefined'

  let tokenizer = root.tokenizer
  let lexicon = root.lexicon

  if (typeof _ === 'undefined') {
    if (hasRequire) {
      tokenizer = require('happynodetokenizer')
      lexicon = require('./data/lexicon.json')
    } else throw new Error('predictGender required happynodetokenizer and ./data/lexicon.json')
  }

  // get multiple indexes helper
  Array.prototype.indexesOf = function (el) {
    var idxs = []
    for (var i = this.length - 1; i >= 0; i--) {
      if (this[i] === el) {
        idxs.unshift(i)
      }
    }
    return idxs
  }

  const getMatches = (arr) => {
    let matches = {}
    for (var key in lexicon['GENDER']) {
      if (!lexicon['GENDER'].hasOwnProperty(key)) continue;
      let match = []
      let word = key
      if (arr.indexOf(word) > -1) {
        let item
        let mWord = word
        let weight = lexicon['GENDER'][key]
        let reps = arr.indexesOf(word).length
        if (reps > 1) {
          let words = []
          for (let i = 0; i < reps; i++) {
            words.push(word)
          }
          item = [words, weight]
        } else {
          item = [word, weight]
        }
        match.push(item)
        matches[mWord] = match
      }
    }
    return matches
  }

  const calcLex = (obj, wc, int) => {
    let lex
    let counts = []
    let weights = []
    for (let key in obj) {
      if (!obj.hasOwnProperty(key)) continue;
      if (Array.isArray(obj[key][0][0])) {
        counts.push(obj[key][0][0].length)
      } else {
        counts.push(1)
      }
      weights.push(obj[key][0][1])
    }
    let sums = []
    counts.forEach(function (a, b) {
      let sum = (a / wc) * weights[a]
      sums.push(sum)
    })
    lex = sums.reduce(function (a, b) { return a + b }, 0)
    lex = Number(lex) + Number(int)
    return lex
  }

  const getGender = (arr) => {
    // get matches from array
    const matches = getMatches(arr)

    // get wordcount
    const wordcount = arr.length

    // set intercept value
    const int = (-0.06724152)

    // calculate lexical useage
    const lex = calcLex(matches, wordcount, int)

    let gender = 'Female'
    if (lex < 0) gender = 'Male'

    return gender
  }

  const predictGender = (str) => {
    // make sure there is input before proceeding
    if (str == null) throw new Error('Whoops! No input string found!')

    // convert our string to tokens
    const tokens = tokenizer(str)

    // predict and return
    return getGender(tokens)
  }

  predictGender.noConflict = function () {
    root.predictGender = previous
    return predictGender
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = predictGender
    }
    exports.predictGender = predictGender
  } else {
    root.predictGender = predictGender
  }
}).call(this)
