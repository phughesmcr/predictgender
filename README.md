# predictgender - Node.js based Gender Prediction

Predict the gender of a string's author.

## Usage
```Javascript
const pg = require('predictgender')
const opts = {
    'ret': 'gender',  // return: 'gender' (default) returns the gender as a
                          string, e.g. "Male". Or return: 'lex', returns the
                          lexical value. Or return: 'number', returns the
                          gender as a number, i,e, -1 = male,
                          0 = indeterminate, 1 = female.
   'nGrams': true,   // boolean - include bigrams / trigrams (true - default)
   'wcGrams': false, // boolean - take word count before (false - default) or
                          after (true) n-Grams have been added
   'sortBy': 'lex'   // if ret = 'matches', sortBy can be used to sort the
                          returned matches array. Acceptable options are
                          'total' sorts array by total weight
                          (i.e. use frequency * weight), 'weight' sorts by
                          singular weight, 'freq' sorts by word frequency, or
                          'lex' (default) sorts by final lexical value
                          (i.e. (word freq / word count) * weight)
}
const ret = 'gender' // Valid options include: 'number', 'lex', or 'gender' (default)
const text = "A long string of text...."
const gender = pg(text, opts)
```

## Options

A number of options are provided to allow you to tailor the output to your needs. However, for general use it is recommended that all options are left to their defaults.

### "ret"

**String - Valid options: 'matches', 'number', 'lex', or 'gender' (default)**

'matches' returns an array of matched words along with the number of times each word appears, its weight, its total weight (weight * appearances), and its final lexical value (i.e. (appearances / word count) * weight). See the output section below for an example.

'number' returns -1 for male, 0 for indeterminate or unknown, and 1 for female.

'lex' returns the lexical value, positive values being female, negative being male.

'gender' returns a string, "Male", "Female", or "Unknown"

### nGrams

**Boolean - valid options: true (default) or false**

n-Grams are contiguous pieces of text, bi-grams being chunks of 2, tri-grams being chunks of 3.

### wcGrams

**Boolean - valid options: true or false (default)**

When set to true, the output from the nGrams option will be added to the word count.

### sortBy

**String - valid options: 'total', 'weight', 'freq', 'lex' (default)**

If 'ret' = 'matches', this option can be used to control how the outputted array is sorted.

'total' sorts by total weight, i.e. word weight * word frequency

'weight' sorts by the words initial weight

'freq' sorts by word frequency

'lex' sorts by final lexical value, i.e. (word frequency * word count) / word weight

## 'ret': 'matches' output example

```JSON
[ 
  [ 'magnificent', 1, -192.0206116, -192.0206116, -1.3914537072463768 ],
  [ 'capital', 1, -133.9311307, -133.9311307, -0.9705154398550726 ],
  [ 'note', 3, -34.83417005, -104.50251014999999, -0.7572645663043478 ],
  [ 'america', 2, -49.21227355, -98.4245471, -0.7132213557971014 ],
  [ 'republic', 1, -75.5720402, -75.5720402, -0.5476234797101449 ]
]
```
By default the matches output array is sorted ascending by lexical value.

| Word          | Frequency | Weight        | Total Weight  | Lexical Val.        |
| ------------- | --------- | ------------- | ------------- | ------------------- |
| 'magnificent' | 1         | -192.0206116  | -192.0206116  | -1.3914537072463768 |
| 'capital'     | 1         | -133.9311307  | -133.9311307  | -0.9705154398550726 |
| 'note'        | 3         | -34.83417005  | -104.50251014 | -0.7572645663043478 |
| 'america'     | 2         | -49.21227355  | -98.4245471   | -0.7132213557971014 |
| 'republic'    | 1         | -75.5720402   | -75.5720402   | -0.5476234797101449 |



## Acknowledgements

### References
Schwartz, H. A., Eichstaedt, J. C., Kern, M. L., Dziurzynski, L., Ramones, S. M., Agrawal, M., Shah, A., Kosinski, M., Stillwell, D., Seligman, M. E., & Ungar, L. H. (2013). Personality, gender, and age in the language of social media: The Open-Vocabulary Approach. PLOS ONE, 8(9), . . e73791.

### Lexicon
Using the gender lexicon data from [WWBP](http://www.wwbp.org/lexica.html)

Used under the Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported licence

## Licence
(C) 2017 [P. Hughes](https://www.phugh.es)
[Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/)
