var endpoint = 'https://api.forismatic.com/api/1.0/';

function get(method) {
  return fetchJsonp(`${endpoint}?method=${method}&format=jsonp&lang=en`, {
    jsonpCallback: 'jsonp' }).
  then(checkStatus);
}

function getQuote() {
  return get('getQuote').then(parseJSON);
}

function checkStatus(response) {
  if (response.ok) {
    return response;
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

function parseJSON(response) {
  return response.json();
}

function parseQuote(json) {
  return Quote.parse(json);
}

class Quote {
  constructor() {
    this.text = '';
    this.author = '';
    this.sender = {
      name: '',
      link: '' };

  }

  static parse(json) {
    let quote = new Quote();
    quote.text = json.quoteText || '';
    quote.author = json.quoteAuthor || '';
    quote.sender.name = json.senderName || '';
    quote.sender.link = json.senderLink || '';
    return quote;
  }}


const $ = (selector, context = document) => {
  return context.querySelector(selector);
};

const $quote = $('.quote');
const $quoteBody = $('.quote__body', $quote);
const $quoteAuthor = $('.quote__author', $quote);
const $hint = $('.js-hint');

function updateContent(quote) {
  $quoteBody.innerHTML = quote.text;
  $quoteAuthor.innerHTML = quote.author;

  $quote.classList.remove('anim-fadeOut');
  $quote.classList.add('anim-fadeIn');
}

function showError(error) {
  console.log(error);
}

function nextQuote() {
  $quote.classList.remove('anim-fadeIn');
  $quote.classList.add('anim-fadeOut');
  getQuote().
  then(parseQuote).
  then(updateContent).
  catch(showError);
}

document.addEventListener('keydown', throttle(e => {
  if (e.keyCode === 32) {
    nextQuote();

    if (!$hint.classList.contains('is-hidden')) {
      $hint.classList.add('is-hidden');
    }
  }
}, 400));

window.addEventListener('load', e => {
  nextQuote();
});

function throttle(func, wait) {
  var args,
  result,
  thisArg,
  timeoutId,
  lastCalled = 0;

  function trailingCall() {
    lastCalled = new Date();
    timeoutId = null;
    result = func.apply(thisArg, args);
  }
  return function () {
    var now = new Date(),
    remaining = wait - (now - lastCalled);

    args = arguments;
    thisArg = this;

    if (remaining <= 0) {
      clearTimeout(timeoutId);
      lastCalled = now;
      result = func.apply(thisArg, args);
    } else
    if (!timeoutId) {
      timeoutId = setTimeout(trailingCall, remaining);
    }
    return result;
  };
}