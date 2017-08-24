/**
 * predictGender
 * v1.0.0-rc.1
 *
 * Predict the gender of a string's author.
 *
 * Help me make this better:
 * https://github.com/phugh/predictGender
 *
 * Based on this paper:
 * Schwartz, H. A., Eichstaedt, J. C., Kern, M. L., Dziurzynski, L.,
 * Ramones, S. M., Agrawal, M., Shah, A., Kosinski, M., Stillwell,
 * D., Seligman, M. E., & Ungar, L. H. (2013).
 * Personality, gender, and age in the language of social media:
 * The Open-Vocabulary Approach. PLOS ONE, 8(9), . . e73791.
 *
 * Using the gender lexicon data from http://www.wwbp.org/lexica.html, under the
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported licence
 *
 * (C) 2017 P. Hughes
 * Licence : Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 * http://creativecommons.org/licenses/by-nc-sa/3.0/
 *
 * Usage example:
 * const pg = require('predictgender);
 * const opts = {  // These are the default options
 *  'encoding': 'freq',
 *  'max': Number.POSITIVE_INFINITY,
 *  'min': Number.NEGATIVE_INFINITY,
 *  'nGrams': true,
 *  'output': 'gender',
 *  'places': 16,
 *  'sortBy': 'lex',
 *  'wcGrams': false,
 * }
 * const str = 'A big long string of text...';
 * const gender = pg(str, opts);
 * console.log(gender)
 *
 * @param {string} str input string
 * @param {Object} opts options object
 * @return {(string|number|Array|Object)} predicted gender, matches, or both
 */

'use strict'
;(function() {
  const global = this;
  const previous = global.predictGender;

  let lexicon = global.lexicon;
  let simplengrams = global.simplengrams;
  let tokenizer = global.tokenizer;
  let lexHelpers = global.lexHelpers;

  if (typeof lexicon === 'undefined') {
    if (typeof require !== 'undefined') {
      lexicon = require('./data/lexicon.json');
      simplengrams = require('simplengrams');
      tokenizer = require('happynodetokenizer');
      lexHelpers = require('lex-helpers');
    } else throw new Error('predictGender required modules not found!');
  }

  const arr2string = lexHelpers.arr2string;
  const prepareMatches = lexHelpers.prepareMatches;
  const getMatches = lexHelpers.getMatches;
  const calcLex = lexHelpers.calcLex;

  /**
  * @function predictGender
  * @param {string} str input string
  * @param {Object} opts options object
  * @return {(string|number|Array|Object)} predicted gender or array of matches
  */
  const predictGender = (str, opts) => {
    // no string return null
    if (!str) {
      console.error('predictGender: no string found. Aborting.');
      return null;
    }
    // if str isn't a string, make it into one
    if (typeof str !== 'string') str = str.toString();
    // trim whitespace and convert to lowercase
    str = str.toLowerCase().trim();
    // options defaults
    if (!opts) {
      opts = {
        'encoding': 'freq',
        'max': Number.POSITIVE_INFINITY,
        'min': Number.NEGATIVE_INFINITY,
        'nGrams': true,
        'output': 'gender',
        'places': 16,
        'sortBy': 'lex',
        'wcGrams': false,
      };
    }
    opts.encoding = opts.encoding || 'freq';
    opts.max = opts.max || Number.POSITIVE_INFINITY;
    opts.min = opts.min || Number.NEGATIVE_INFINITY;
    opts.nGrams = opts.nGrams || true;
    opts.output = opts.output || 'gender';
    opts.places = opts.places || 16;
    opts.sortBy = opts.sortBy || 'lex';
    opts.wcGrams = opts.wcGrams || false;
    const encoding = opts.encoding;
    const output = opts.output;
    const places = opts.places;
    // convert our string to tokens
    let tokens = tokenizer(str);
    // if there are no tokens return unknown or 0
    if (!tokens) {
      console.warn('predictGender: no tokens found. Returned 0.');
      return output === 'gender' ? 'Unknown' : 0;
    }
    // get wordcount before we add ngrams
    let wordcount = tokens.length;
    // get n-grams
    if (opts.nGrams) {
      const bigrams = arr2string(simplengrams(str, 2));
      const trigrams = arr2string(simplengrams(str, 3));
      tokens = tokens.concat(bigrams, trigrams);
    }
    // recalculate wordcount if wcGrams is true
    if (opts.wcGrams) wordcount = tokens.length;
    // get matches from array
    const matches = getMatches(tokens, lexicon, opts.min, opts.max);
    // return match object if requested
    if (output === 'matches') {
      return prepareMatches(matches.GENDER, opts.sortBy, wordcount, places,
          encoding);
    }
    // calculate lexical useage
    const lex = calcLex(matches.GENDER, (-0.06724152), places, encoding,
        wordcount);
    // calculate gender value
    let gender;
    if (lex < 0) {
      output === 'gender' ? gender = 'Male' : gender = -1;
    } else if (lex > 0) {
      output === 'gender' ? gender = 'Female' : gender = 1;
    } else {
      output === 'gender' ? gender = 'Unknown' : gender = 0;
    }
    if (output === 'lex') {
      // return lex if requested
      return lex;
    } else if (output === 'full') {
      // return lex and matches
      const full = {};
      full.number = gender;
      full.lex = lex;
      full.matches = prepareMatches(matches.GENDER, opts.sortBy, wordcount,
          places, encoding);
      return full;
    } else {
      if (output !== 'gender' && output !== 'number') {
        console.warn('predictGender: output option ("' + output +
            '") is invalid, returning {output: "number"}.');
      }
      // return gender string or number
      return gender;
    }
  };

  predictGender.noConflict = function() {
    global.predictGender = previous;
    return predictGender;
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = predictGender;
    }
    exports.predictGender = predictGender;
  } else {
    global.predictGender = predictGender;
  }
}).call(this);
