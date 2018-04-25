/**
 * predictGender
 * v3.0.0
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
 *  'locale': 'US',
 *  'logs': 3,
 *  'max': Number.POSITIVE_INFINITY,
 *  'min': Number.NEGATIVE_INFINITY,
 *  'nGrams': [2, 3],
 *  'output': 'lex',
 *  'places': 9,
 *  'sortBy': 'lex',
 *  'wcGrams': 'false',
 * }
 * const str = 'A big long string of text...';
 * const gender = pg(str, opts);
 * console.log(gender)
 * 
 * See README.md for help.
 *
 * @param {string} str input string
 * @param {Object} opts options object
 * @return {Object} predicted gender, matches, or both
 */

(function() {
  'use strict';

  // Lexicon data
  const lexicon = require('./data/lexicon.json');

  // Modules
  const async = require('async');
  const lexHelpers = require('lex-helpers');
  const simplengrams = require('simplengrams');
  const tokenizer = require('happynodetokenizer');
  const trans = require('british_american_translate');
  const arr2string = lexHelpers.arr2string;
  const doLex = lexHelpers.doLex;
  const doMatches = lexHelpers.doMatches;
  const getMatches = lexHelpers.getMatches;
  const itemCount = lexHelpers.itemCount;

  /**
  * Predict the gender of a string's author
  * @function predictGender
  * @param {string} str input string
  * @param {Object} opts options object
  * @return {Object} predicted gender or array of matches
  */
  const predictGender = (str, opts = {}) => {
    // default options
    opts.encoding = (typeof opts.encoding !== 'undefined') ? opts.encoding : 'freq';
    opts.locale = (typeof opts.locale !== 'undefined') ? opts.locale : 'US';
    opts.logs = (typeof opts.logs !== 'undefined') ? opts.logs : 3;
    if (opts.suppressLog) opts.logs = 0;
    opts.max = (typeof opts.max !== 'undefined') ? opts.max : Number.POSITIVE_INFINITY;
    opts.min = (typeof opts.min !== 'undefined') ? opts.min : Number.NEGATIVE_INFINITY;
    if (typeof opts.max !== 'number' || typeof opts.min !== 'number') {
      // try to convert to a number
      opts.min = Number(opts.min);
      opts.max = Number(opts.max);
      // check it worked, or else default to infinity
      opts.max = (typeof opts.max !== 'number') ? opts.max : Number.POSITIVE_INFINITY;
      opts.min = (typeof opts.min !== 'number') ? opts.min : Number.NEGATIVE_INFINITY;
    }
    opts.nGrams = (typeof opts.nGrams !== 'undefined') ? opts.nGrams : [2, 3];
    if (!Array.isArray(opts.nGrams)) {
      if (opts.logs > 1) {
        console.warn('predictGender: nGrams option must be an array! ' + 
            'Defaulting to [2, 3].');
      }
      opts.nGrams = [2, 3];
    }
    opts.output = (typeof opts.output !== 'undefined') ? opts.output : 'lex';
    opts.places = (typeof opts.places !== 'undefined') ? opts.places : 9;
    opts.sortBy = (typeof opts.sortBy !== 'undefined') ? opts.sortBy : 'lex';
    opts.wcGrams = (typeof opts.wcGrams !== 'undefined') ? opts.wcGrams : false;   
    // cache frequently used options
    const encoding = opts.encoding;
    const logs = opts.logs;
    const nGrams = opts.nGrams;
    const output = opts.output;
    const places = opts.places;
    const sortBy = opts.sortBy;
    // no string return null
    if (!str) {
      if (logs > 1) console.warn('predictGender: no string found. Returning null.');
      return null;
    }
    // if str isn't a string, make it into one
    if (typeof str !== 'string') str = str.toString();
    // trim whitespace and convert to lowercase
    str = str.toLowerCase().trim();
    // translalte US English to UK English if selected
    if (opts.locale === 'GB') str = trans.uk2us(str);
    // convert our string to tokens
    let tokens = tokenizer(str, {logs: opts.logs});
    // if there are no tokens return null
    if (!tokens) {
      if (logs > 1) console.warn('predictGender: no tokens found. Returned null.');
      return null;
    }
    // get wordcount before we add ngrams
    let wordcount = tokens.length;
    // get n-grams
    if (nGrams) {
      async.each(nGrams, function(n, callback) {
        if (wordcount < n) {
          callback(`predictGender: wordcount (${wordcount}) less than n-gram value (${n}). Ignoring.`);
        } else {
          tokens = [...arr2string(simplengrams(str, n, {logs: logs})), ...tokens];
          callback();
        }
      }, function(err) {
        if (err && logs > 0) console.error('predictGender: nGram error: ', err);        
      });
    }
    // recalculate wordcount if wcGrams is true
    if (opts.wcGrams) wordcount = tokens.length; 
    // get matches from array
    const matches = getMatches(itemCount(tokens), lexicon, opts.min, opts.max);
    // define intercept values
    const ints = {GENDER: -0.06724152};
    if (output.match(/matches/gi)) {
      return doLex(matches, ints, places, encoding, wordcount);
    } else if (output.match(/matches/gi)) {
      // return match object if requested
      return doMatches(matches, sortBy, wordcount, places, encoding);
    }
    // calculate gender value
    let gender;
    const lex = doLex(matches, ints, places, encoding, wordcount);
    if (lex < 0) {
      output.match(/gender/gi) ? gender = 'Male' : gender = -1;
    } else if (lex > 0) {
      output.match(/gender/gi) ? gender = 'Female' : gender = 1;
    } else {
      output.match(/gender/gi) ? gender = 'Unknown' : gender = 0;
    }
    if (output.match(/full/gi)) {
      // return lex and matches
      return {
        gender: gender,
        lex: lex,
        matches: doMatches(matches, sortBy, wordcount, places, encoding),
      };
    } else if (output.match(/gender/gi) || output.match(/number/gi)) {
      // return gender string or number
      return gender;
    } else {
      if (!output.match(/lex/gi) && logs > 1) {
        console.warn('predictGender: output option ("' + output +
            '") is invalid, returning as {output: "lex"}.');
      }
      // return lex if requested
      return lex;
    }
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = predictGender;
    }
    exports.predictGender = predictGender;
  } else {
    global.predictGender = predictGender;
  }
})();
