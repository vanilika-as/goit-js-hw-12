import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

const PER_PAGE = 15;

const form = document.querySelector('.form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.btn-load-more');

let searchQuery = '';
let page = 1;

form.addEventListener('submit', event => {
  event.preventDefault();

  searchQuery = event.currentTarget.elements['search-text'].value.trim();

  clearGallery();
  hideLoadMoreButton();
  page = 1;

  if (!searchQuery) {
    return;
  }

  fetchImages(false);
});

loadMoreButton.addEventListener('click', async () => {
  page += 1;
  const loaded = await fetchImages(true);

  if (!loaded) {
    page -= 1;
  }
});

async function fetchImages(isLoadMore) {
  showLoader();
  hideLoadMoreButton();

  try {
    const data = await getImagesByQuery(searchQuery, page);

    if (data.hits.length === 0) {
      iziToast.error({
        title: 'Error',
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });

      return false;
    }

    createGallery(data.hits);

    if (isLoadMore) {
      smoothScroll();
    }

    const loadedImages = page * PER_PAGE;
    const hasMoreImages = loadedImages < data.totalHits;

    if (hasMoreImages) {
      showLoadMoreButton();
    } else {
      hideLoadMoreButton();

      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    }

    return true;
  } catch {
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong. Please try again later.',
      position: 'topRight',
    });

    if (isLoadMore) {
      showLoadMoreButton();
    }

    return false;
  } finally {
    hideLoader();
  }
}

function smoothScroll() {
  const firstCard = gallery.firstElementChild;

  if (!firstCard) {
    return;
  }

  const { height: cardHeight } = firstCard.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
