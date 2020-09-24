/**
 * Get the currently selected page.
 */
function getSelectedPage() {
    const selectionService = new SelectionService();
    const pagesService = new PagesService();
    
    return pagesService.getPage(parseInt(selectionService.selected));
}

/**
 * Render HTML for a page's details.
 * 
 * @param {Page} page
 */
function showPageDetails(page) {
    let template, clone, complete, icon, list, pageDetails;

    pageDetails = document.body.querySelector('.page-details');
    if (pageDetails) {
        pageDetails.remove();
    }

    template = document.getElementsByTagName('template')[0];

    complete = template.content.querySelector('#complete');
    if (isComplete(page) === 'true') {
        complete.classList.add('complete');
    } else {
        complete.classList.remove('complete');
    }

    icon = template.content.getElementById('favorite');
    if (!page.favorited) {
        icon.innerHTML = '<i class="far fa-star"></i>';
    } else {
        icon.classList.add('favorite');
        icon.innerHTML = '<i class="fas fa-star"></i>';
    }

    template.content.getElementById('page-number').innerHTML = page.pageNumber + '.';
    template.content.getElementById('page-title').innerHTML = page.title;

    list = template.content.getElementById('idea-list');
    loadIdeas(page, list);

    clone = document.importNode(template.content, true);
    document.body.appendChild(clone);
}

/**
 * Toggle a page as a favorite.
 */
function favorite() {
    const pagesService = new PagesService();

    const page = getSelectedPage();
    const favorite = document.body.querySelector('#favorite');
    const favoriteIcon = favorite.querySelector('.fa-star');

    pagesService.favoritePage(page);

    favoriteIcon.classList.toggle('far');
    favoriteIcon.classList.toggle('fas');
    favorite.classList.toggle('favorite');

}

window.onload = function() {
    let page;

    const selectionService = new SelectionService();
    const url = window.location.href.split('?page=');

    if (url[1]) {
        selectionService.select(url[1]);
    }

    page = getSelectedPage();

    if (page) {
        window.history.pushState({page: page.pageNumber}, '', `?page=${page.pageNumber}`);
        
    } else {
        window.location.href = '/404.html';
    }

    showPageDetails(page);

    document.body.querySelector('footer input').value = page.pageNumber;
    checkPagination(page);

}

window.onbeforeunload = function() {
    new SelectionService().select('');
    window.history.back();
}

/**
 * Go back to the main page.
 */
function goBack() {
    new SelectionService().select('');
    window.location.href = '/';
}

/**
 * Return a boolean on whether the page is marked as completed.
 * 
 * @param {Page} page 
 */
function isComplete(page) {
    return getCookie('checkboxValues').split(',')[page.pageNumber - 1];
}

/**
 * Mark a page as complete from its details page.
 */
function markAsComplete() {
    const page = getSelectedPage();
    const complete = document.body.querySelector('#complete');
    let cookie = getCookie('checkboxValues').split(',');
    
    if (isComplete(page) === 'false') {
        cookie[page.pageNumber - 1] = 'true';
    } else {
        cookie[page.pageNumber -1] = 'false';
    }

    setCookie('checkboxValues', cookie.join(), 365);

    complete.classList.toggle('complete');
}

/**
 * Add an idea to the selected page.
 */
function addIdea() {
    const page = getSelectedPage();
    const input = document.querySelector('#ideas-form input');
    const list = document.getElementById('idea-list');

    new PagesService().addIdea(page, input.value);
    list.innerHTML += `<hr><li>
        <span>${input.value}</span>
        <button onclick="remove(${page.ideas.length - 1})"><i class="fas fa-minus-square"></i></button>
    </li>`;
    toggleIdeaForm();
}

/**
 * Show the form for an idea to be added.
 */
function toggleIdeaForm() {
    const form = document.getElementById('ideas-form');
    const input = form.querySelector('input');
    form.classList.toggle('show-form');

    input.value = '';
    input.focus();
}

/**
 * Remove all ideas from a page.
 */
function clearIdeas() {
    const page = getSelectedPage();
    const list = document.getElementById('idea-list');

    new PagesService().resetIdeas(page);
    list.innerHTML = '';
}

/**
 * Remove an idea according to its index in the list.
 * 
 * @param {number} index 
 */
function remove(index) {
    const page = getSelectedPage();
    const list = document.getElementById('idea-list');

    new PagesService().removeIdea(page, index);
    loadIdeas(getSelectedPage(), list);
}

/**
 * Render HTML for a page's ideas as a list.
 * 
 * @param {Page} page 
 * @param {string[]} list list of ideas 
 */
function loadIdeas(page, list) {
    list.innerHTML = '';
    if (page.ideas) {
        for (let i = 0; i < page.ideas.length; i++) {
            list.innerHTML += `<hr><li>
                <span>${page.ideas[i]}</span>
                <button onclick="remove(${i})"><i class="fas fa-minus-square"></i></button>
            </li>`;
        }
    }
}

/**
 * When the enter key is pressed and the idea form
 * is focused, add an idea to the page.
 * 
 * @param {keyboardEvent} event
 * @see function addIdea()
 */
function addIdeaOnEnter(event) {
    const key = event.key || event.keyCode;

    if ((key === 'Enter' || key === 13) && event.target.value !== '') {
        addIdea();
    }
}

/**
 * When the enter key is pressed and the paginator input is focused,
 * update the details page to reflect the new one.
 * 
 * @param {keyboardEvent} event 
 */
function jumpOnEnter(event) {
    const key = event.key || event.keyCode;
    const input = event.target;

    if (key === 'Enter' || key === 13) {
        if (input.value >= input.min || input.value <= input.max) {
            new SelectionService().select(input.value);
            changePage();
        }
    }
}

/**
 * Go to the previous page from the one selected.
 */
function prevPage() {
    const selectionService = new SelectionService();
    const selected = selectionService.selected;

    if (parseInt(selected) > document.querySelector('footer input').min) {
        selectionService.select(--selectionService.selected);
        changePage();
    }
    
}

/**
 * Go to the next page from the one selected.
 */
function nextPage() {
    const selectionService = new SelectionService();
    const selected = selectionService.selected;

    if (parseInt(selected) < document.querySelector('footer input').max) {
        selectionService.select(++selectionService.selected);
        changePage();
    }

}

/**
 * Update the details page to show information of a different page.
 */
function changePage() {
    const page = getSelectedPage();

    window.history.pushState({page: page.pageNumber}, '', `?page=${page.pageNumber}`);
    showPageDetails(page);
    document.querySelector('footer input').value = page.pageNumber;

    // disable prev or next arrows if necessary
    checkPagination(page);
}

/**
 * Show the previous or next buttons in the paginator
 * as 'disabled' if necessary.
 * 
 * @param {Page} page 
 */
function checkPagination(page) {
    const footer = document.querySelector('footer');
    const input = footer.querySelector('input');
    const arrows = footer.querySelectorAll('footer p');

    if (page.pageNumber > parseInt(input.min) && page.pageNumber < parseInt(input.max)) {
        arrows[0].classList.remove('disabled');
        arrows[2].classList.remove('disabled');
    } else if (page.pageNumber <= parseInt(input.min)) {
        arrows[0].classList.add('disabled');
    } else {
        arrows[2].classList.add('disabled');
    }
}