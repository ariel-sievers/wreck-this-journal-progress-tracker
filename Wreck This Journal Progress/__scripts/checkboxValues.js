/**
 * Switch to grid view on the main page and reset filter selection.
 */
function gridView() {
    const buttons = document.querySelectorAll('.view-btn');
    const list = document.getElementById('list');

    buttons[0].classList.add('selected-btn');
    buttons[1].classList.remove('selected-btn');

    list.classList.add('grid');
    list.classList.remove('list');

    loadList(null, false);
    document.querySelector('select').value = 'none';
}

/**
 * Switch to list view on the main page and reset filter selection.
 */
function listView() {
    const pagesService = new PagesService();

    const buttons = document.querySelectorAll('.view-btn');
    const list = document.getElementById('list');

    buttons[0].classList.remove('selected-btn');
    buttons[1].classList.add('selected-btn');

    list.classList.remove('grid');
    list.classList.add('list');

    pagesService.paginate(12, 1);
    pagesService.displayPaginator(12);

    document.querySelector('select').value = 'none';
}

/**
 * Get booleans on each checkboxes 'checked' status.
 */
function getCheckboxValues() {
    var checkboxValues = new Array();

    [...document.querySelectorAll("input[type='checkbox']")].forEach((input) => {
        checkboxValues.push(input.checked);
    });

    return checkboxValues;
}

/**
 * Set each checkbox's checked value to false and update the cookie to reflect this.
 */
function onReset() {
    [...document.getElementsByTagName('input')].forEach((input) => {
        input.checked = false;
    });

    updateCookie();
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
 * Show only the pages that are favorited.
 */
function loadFavorite() {
    const pagesService = new PagesService();
    const list = document.getElementById("list");

    for (let i = 1; i <= 215; i++) {
        const page = pagesService.getPage(i);
        if (page.favorited) {
            list.innerHTML += `<div class="checkbox"><label><input type="checkbox">&nbsp; Page ${i}<span>: ${page.title}</span></label>
                <i class="fas fa-star favorite"></i>
                <i class="fas fa-file-alt" onclick="seeDetails(${i})"></i></div>`;
        }
    }
    
    if (pagesService.getPage(216).favorited) {
        list.innerHTML += '<div class="checkbox"><label><input type="checkbox">&nbsp; Back Cover</label>'
        + '<i class="fas fa-star favorite"></i><i class="fas fa-file-alt" onclick="seeDetails(216)"></i></div>';
    }
}

/**
 * Load pages marked as either complete or incomplete.
 * 
 * @param {boolean} complete whether the page is complete;
 * When true, only show pages that are complete. If false,
 * only show pages that are not complete.
 */
function loadComplete(complete) {
    if (complete) {
        [...document.querySelectorAll("input[type='checkbox']")].forEach((input) => {
            if (!input.checked) {
                input.parentElement.parentElement.remove();
            }
        });
    } else {
        [...document.querySelectorAll("input[type='checkbox']")].forEach((input) => {
            if (input.checked) {
                input.parentElement.parentElement.remove();
            }
        });
    }
}

/**
 * Render all pages into HTML.
 */
function loadAllPages() {
    const pagesService = new PagesService();
    const list = document.getElementById("list");

    for (let i = 1; i <= 215; i++) {
        const page = pagesService.getPage(i);
        list.innerHTML += `<div class="checkbox"><label><input type="checkbox">&nbsp; Page ${i}<span>: ${page.title}</span></label>
            <i class="fas fa-star"></i>
            <i class="fas fa-file-alt" onclick="seeDetails(${i})"></i></div>`;

        if (page.favorited) {
            list.querySelectorAll('.fa-star')[i - 1].classList.add('favorite');
        }
    }

    list.innerHTML += '<div class="checkbox"><label><input type="checkbox">&nbsp; Back Cover</label>'
        + '<i class="fas fa-star"></i><i class="fas fa-file-alt" onclick="seeDetails(216)"></i></div>';
    
    if (pagesService.getPage(216).favorited) {
        list.querySelectorAll('.fa-star')[215].classList.add('favorite');
    }

}

/**
 * Load the list of pages as a checklist.
 * 
 * @param {boolean} complete whether the page is complete;
 * When true, only show pages that are complete. If false,
 * only show pages that are not complete. If null, then this has no effect.
 * 
 * @param {boolean} favorite whether the page is a favorite;
 * When true, only show pages that are favorited. Otherwise, this
 * has no effect.
 */
function loadList(complete, favorite) {
    document.getElementById("list").innerHTML = '';

    if (!favorite) {
        loadAllPages();
    } else {
        loadFavorite();
    }

    if (favorite) {
        let cookieValues = getCookie('checkboxValues').split(',');
        let elements = document.querySelectorAll('.checkbox');
        for (let i = 0; i < elements.length; i++) {
            let pageNumber = elements[i].innerHTML.split('Page')[1].split('<span>')[0];
            let val = cookieValues[pageNumber - 1];
            if (val === 'true') {
                elements[i].querySelector('input').checked = val;
            }
        }
    } else {
        // cookie may not exist yet
        checkCookie('checkboxValues', getCheckboxValues());
    }

    if (complete !== null) {
        loadComplete(complete);
    }
}

window.onload = function() {
    new SelectionService().select('');
    new SearchService().removeTerms();

    if (!localStorage.getItem('pages') || localStorage.getItem('pages') === 'undefined') {
        createPages();
    }

    loadList(null, false);
}