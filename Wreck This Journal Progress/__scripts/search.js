/**
 * Search with the terms inside the search input when
 * the enter key is pressed.
 * 
 * @param {keyboardEvent} event
 * @see function search()
 */
function searchOnEnter(event) {
    const key = event.key || event.keyCode;
    const terms = document.querySelector('#search-options input').value.trim();

    if ((key === 'Enter' || key === 13) && terms !== '') {
        search();
    }
}

/**
 * Search with the terms inside the search input by updating terms in
 * the local storage and sending the user to the results page.
 */
function search() {
    if (window.innerWidth <= 533 && !window.location.href.includes('/search')) {
        window.location.href= '/search/results.html';
    } else {
        const terms = document.querySelector('#search-options input').value;
        new SearchService().updateTerms(terms);
    
        window.location.href = '/search/results.html';
    }
}

/**
 * Find pages such that the term is equal to its page number or
 * is included in a page's title.
 * 
 * @param {string[]} terms 
 */
function getSearchResults(terms) {
    let list = [...new PagesService().getPages().values()];

    return list.filter( page => {
        const title = page.title.trim().toLowerCase().split('--')[0];
        const pageNumber = page.pageNumber;

        return title.includes(terms) || pageNumber === parseInt(terms);
    })
}

/**
 * When the filter selection changes, this function is called.
 * The list is reloaded to show the applied filter. Pagination
 * should also update if necessary.
 * 
 * @param {change} event 
 * @param {string} filterValue 
 */
function filter(event = null, filterValue = '') {
    let value;

    if (filterValue === '' && event !== null) {
        value = event.target.value;
    } else if (filterValue !== '') {
        value = filterValue;
    } else {
        value = 'none';
    }

    switch(value) {
        case 'favorites':
            loadList(null, true);
            break;
        case 'none':
            loadList(null, false);
            break;
        case 'complete':
            loadList(true, false);
            break;
        case 'incomplete':
            loadList(false, false);
            break;
    }

    if (document.querySelector('#list.list') && filterValue === '') {
        const ps = new PagesService();
        const itemNumber = document.querySelectorAll('.checkbox').length;
        let itemsPerPage = 12;

        if (itemNumber <= 6) {
            ps.paginateAfterFilter(itemNumber, 1);
            ps.displayPaginator(itemNumber, 1, itemNumber);
        } else {
            while ((itemNumber / itemsPerPage <= 1) && itemsPerPage >= 6) {
                itemsPerPage -= 2;
            }
    
            ps.paginateAfterFilter(itemsPerPage, 1);
            ps.displayPaginator(itemsPerPage);
        }
    } else if (filterValue === 'favorites') {
        let cookieValues = getCookie('checkboxValues').split(',');
        let checkboxes = [...document.querySelectorAll("input[type='checkbox']")];
        for (let i = start, j = 0; i < end; i++, j++) {
            let val = cookieValues[i];
            if (val === 'true') {
                checkboxes[j].checked = val;
            }
        }
    }

}

/**
 * View a page's details according to the given page number.
 * If the page (number) does not exist, then send user to 404 page.
 * 
 * @param {number} pageNumber 
 */
function seeDetails(pageNumber) {
    const page = new PagesService().getPage(pageNumber);

    if (page) {
        new SelectionService().select(page.pageNumber);
        window.location.href = '/pages/details.html';
    } else {
        window.location.href = '/404.html';
    }  
}

/**
 * Goes back to the main page.
 */
function goBack() {
    new SearchService().removeTerms();
    window.location.href = '/';
}

window.onload = function() {

    if (window.location.href.includes('/search/results.html')) {
        const searchService = new SearchService();
        const terms = searchService.getTerms();
        const resultList = document.querySelector('#results');
    
        document.getElementById('terms').innerHTML = `for "${terms}"`;
    
        let list = getSearchResults(terms);
        for (let i = 0; i < list.length; i++) {
            const page = list[i];
    
            resultList.innerHTML += `<div class="page-card" onclick="seeDetails(${page.pageNumber})">
                <i class="fas fa-star"></i>
                <span class="title">Page ${page.pageNumber}: ${page.title}</span>`;
            
            resultList.innerHTML += `</div>`;
            if (page.favorited) {
                resultList.querySelectorAll('.fa-star')[i].classList.add('favorite');
            }
        }
    }
    
}