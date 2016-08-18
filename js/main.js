'use strict'


$(function onPageLoad() {
  $('#filterer-query').on('input', inputChange).focus()

//  let p = jQuery.getJSON('https://www.ifixit.com/api/2.0/wikis/CATEGORY?display=titles&limit=10000&offset=1&pretty')
//  p.then((data) => {
//    fillFromList('#filterer-results', data)
//    fuzzySearch.register('#filterer-results')
//  })

  let p = jQuery.getJSON('https://www.ifixit.com/api/2.0/wikis/CATEGORY?display=titles&limit=10000&offset=1&pretty')
  p.then((data) => {
    //fillFromList('#filterer-results', data)
    fuzzySearch.register('#filterer-results')
  })


  

})


function inputChange() {
  let currentItems = getCurrentItems('#filterer-results')
  let query = $('#filterer-query').val()
  fuzzySearch(query)
}


function updateResults(items, queryLength) {
  console.log('Updating results')
  let list = document.getElementById('filterer-results')
  if (items.length === 0) {
    list.innerHTML = '<li class="no-results">No results found.</li>'
  } else list.innerHTML = listify(items, queryLength).join('')
}


function fuzzySearch(query, items) {
  if (fuzzySearch[query]) {
    console.log('Match found from memo:', query)
    updateResults(fuzzySearch[query], query.length || 0)
    return fuzzySearch[query] 
  } 

  if (fuzzySearch[query.slice(0, -1)])
    items = fuzzySearch[query.slice(0, -1)] 
  else 
    items = items || fuzzySearch['__default__']

  console.log('Fuzzy searching through [', items.length,']items')

  let results = items.filter(function(item) { 
    let word = item.word.toLowerCase()
    let widx = 0
    let qidx = 0
    for ( ; widx < word.length; widx++) {
      if (query[qidx] === word[widx]) {
        /* Add match index to matches for highlighting */
        item.matches[qidx] = widx
        /* If this is the last letter in the query, return true */
        if (qidx === query.length - 1)
          return true
        else
          qidx++
      }
    } 
    return false
  })
  fuzzySearch[query] = results
  updateResults(results, query.length)
}

fuzzySearch.register = function(items) {
  fuzzySearch[''] = getCurrentItems(items)
  fuzzySearch['__default__'] = fuzzySearch['']
}


/* Surround each item in items with <li> open & close tags */
function listify(items, queryLength) {
  return items.map(function(item) { 
    let chars = item.word.split('')
    let matches = item.matches.slice(0, queryLength)

    if (matches.length === 0)
      return '<li>' + chars.join('') + '</li>'
    else {
      for (let midx = 0; midx < matches.length; midx++) {
        let c = chars[matches[midx]] 
        if (midx === matches.length - 1)
          chars[matches[midx]] = 
            '<span class="filterer-match">' + c + '</span></span>' 
        else
          chars[matches[midx]] = '<span class="filterer-match">' + c + '</span>' 
      } 
      return '<li><span class="filterer-run">' + chars.join('') + '</li>'
    }
//    let word = item.word.split('').map(function(v, idx) {
//      return item.matches[idx] ? : v
//    }).join('')

  })
}


function getCurrentItems(ul) {
  return $(ul + ' li')
    .map(function() { 
      return {
        word: $(this).text(),
        matches: []
      }
    })
    .toArray()
}

function fillFromList(ul, list) {
  let l = list.map((cv, idx) => ({
      word: cv,
      matches: []
    }))
  updateResults(l, 0)
}








