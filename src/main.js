import { Store, isScrollEnd } from './utils.js';

const resultStorage = ((key) => ({
  get: () => JSON.parse(localStorage.getItem(key)),
  set: (value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
}))('last-result');

Store.subscribe(
  ({ results }) => {
    const resultListElement = document.querySelector('#search-results');
    resultListElement.innerHTML = '';

    const paginationElement = document.querySelector('#pagination');
    paginationElement.innerHTML = '';

    if (!results) {
      return;
    }

    results.items?.forEach((resultItem) =>
      resultListElement.appendChild(renderResultItem(resultItem))
    );

    paginationElement.appendChild(renderPagination(results.queries));
  },
  (state) => state.results
);

Store.subscribe(
  (state) => {
    if (!state.results) {
      return;
    }
    resultStorage.set(state.results);
  },
  (state) => state.results
);

Store.setState({ results: resultStorage.get() || null });

const [resultsElement, paginationElement, searchFormElement, loadingElement] = [
  '#search-results',
  '#pagination',
  '#search-form',
  '#loading-wrapper',
].map((selector) => document.querySelector(selector));

Store.subscribe(
  (state) => {
    paginationElement.dataset.isVisible = !!state.isPaginationVisible;
  },
  (state) => state.isPaginationVisible
);

Store.subscribe(
  (state) => {
    loadingElement.dataset.isVisible = !!state.isLoading;
    searchFormElement['search-fieldset'].disabled = state.isLoading;
  },
  (state) => state.isLoading
);

searchFormElement?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  Store.setState({ results: null, isLoading: true });
  const query = formData.get('search');
  const data = await fetchSearchQuery(query);
  Store.setState({ results: data, isLoading: false });
});

searchFormElement?.search.focus();

async function handlePaginationSubmit(event) {
  event.preventDefault();
  Store.setState({ isLoading: true });
  const lastQuery = resultStorage.get().queries.request[0].searchTerms;
  const offset = event.submitter.value;
  const data = await fetchSearchQuery(lastQuery, offset ?? 0);
  Store.setState((prevState) => {
    const prevResults = prevState.results;
    const newResults = data;
    newResults.items = prevResults.items.concat(newResults.items);

    return { ...prevState, results: newResults, isLoading: false };
  });
}

async function fetchSearchQuery(query, offset = 0) {
  const response = await fetch(
    `https://www.googleapis.com/customsearch/v1?q=${query}&key=${KEY}&cx=${CX}&start=${offset}`
  );
  return response.json();

  await new Promise((resolve) => setTimeout(resolve, 1000));
  return resultStorage.get();
}

function n(name, tagName = '*') {
  return `${tagName}[name=${name}]`;
}

function renderResultItem(item) {
  const resultTemplate = document.querySelector('#search-result-template');
  const templateFragment = resultTemplate.content.cloneNode(true);

  const titleElement = templateFragment.querySelector(n('title-link'));
  titleElement.textContent = item.title;
  titleElement.href = item.link;

  const linkElement = templateFragment.querySelector(n('link'));
  linkElement.textContent = item.displayLink;
  linkElement.href = item.link;

  const contentElement = templateFragment.querySelector(n('content'));
  const testElement = document.createElement('p');
  testElement.innerHTML = item.htmlSnippet;
  contentElement.appendChild(testElement);

  return templateFragment;
}

function renderPagination(queries) {
  const template = document.querySelector('#pagination-template');
  const templateFragment = template.content.cloneNode(true);

  const moreButton = templateFragment.querySelector(n('more'));
  if (!queries.nextPage) {
    moreButton.disabled = true;
  } else {
    moreButton.value = queries.nextPage[0].startIndex;
  }

  const formElement = templateFragment.querySelector('form');
  formElement.addEventListener('submit', handlePaginationSubmit);

  return templateFragment;
}

resultsElement?.addEventListener('mousemove', (event) => {
  const { clientY } = event;
  const { top } = resultsElement.getBoundingClientRect();
  const elementHeight = resultsElement.offsetHeight;
  const relativeTop = clientY - top;
  const topPercentage = (relativeTop * 100) / elementHeight;

  Store.setState({
    isPaginationVisible: topPercentage > 80 || isScrollEnd(resultsElement),
  });
});

resultsElement?.addEventListener('scroll', ({ target: element }) => {
  Store.setState({
    isPaginationVisible: isScrollEnd(element),
  });
});
