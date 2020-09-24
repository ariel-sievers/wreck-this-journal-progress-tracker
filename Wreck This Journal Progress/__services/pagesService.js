class PagesService {
    static pages;

    constructor() {
        if (localStorage.getItem('pages') === 'undefined') {
            this.pages = new Map();
        } else {
            this.pages = new Map(JSON.parse(localStorage.getItem('pages')));
        }
    }

    /**
     * Remove a page by its number.
     * @param {number} pageNumber
     * @returns false if page does not exist
     */
    removePage(pageNumber) {
        const found = this.pages.delete(pageNumber);
        this.updatePages();

        return found;
    }

    /**
     * Add a page by its number and Page object.
     * @param {Page} page a Page object
     */
    addPage(page) {
        this.pages.set(page.pageNumber, page);
        this.updatePages();
    }

    /**
     * Check whether a page with the given number exists.
     * @param {number} pageNumber 
     */
    hasPage(pageNumber) {
        return this.pages.has(pageNumber);
    }

    /**
     * Get a page by its page number.
     * @param {number} pageNumber 
     * @returns false if page does not exist
     */
    getPage(pageNumber) {
        return this.pages.get(pageNumber);
    }

    /**
     * Get all pages.
     */
    getPages() {
        return this.pages;
    }

    /**
     * Remove all pages.
     */
    resetPages() {
        this.pages.clear();
        this.updatePages();
    }

    /**
     * Update the stored pages with an updated pages map.
     */
    updatePages() {
        localStorage.setItem('pages', JSON.stringify([...this.getPages()]));
    }

    /**
     * Toggle a page as favorited and update both the map and stored pages.
     * @param {Page} page 
     */
    favoritePage(page) {
        page.favorited = !page.favorited;
        this.addPage(page); // update in map
        this.updatePages();
    }

    /**
     * Add an idea to the ideas array; update the map and stored pages.
     * @param {Page} page 
     * @param {string} idea 
     */
    addIdea(page, idea) {
       page.ideas.push(idea);
       this.addPage(page); // update in map
       this.updatePages();
    }

    /**
     * Remove an idea at the given index for a particular page.
     * Then update the map and stored pages.
     * 
     * @param {Page} page 
     * @param {number} index
     */
    removeIdea(page, index) {
        page.ideas = page.ideas.filter( (idea, i) => {
            return i !== index;
        })
        this.addPage(page);
        this.updatePages();
    }

    /**
     * Get an idea at the given index for a particular page.
     * 
     * @param {Page} page 
     * @param {number} index
     * @returns false if idea is not found
     */
    getIdea(page, index) {
        return page.ideas[index];
    }

    /**
     * Reset the ideas list to empty for a given page;
     * update the map and stored pages.
     * 
     * @param {Page} page 
     */
    resetIdeas(page) {
        page.ideas = [];
        this.addPage(page);
        this.updatePages();
    }

    /**
     * Display a list of paginated items according to the given number
     * of items per page and the current page of items.
     * 
     * @param {number} itemsPerPage number of items to show per page
     * @param {number} p current page of items
     */
    paginate(itemsPerPage, p) {
        const list = document.getElementById('list');

        list.innerHTML = '';
        p--;

        const start = itemsPerPage * p;
        const end = start + itemsPerPage;
        
        let counter = 0;
        if (end !== this.pages.size) {
            for (let i = start; i < end; i++) {
                const page = this.getPage(i + 1);

                list.innerHTML += `<div class="checkbox"><label><input type="checkbox">&nbsp; Page ${i + 1}<span>: ${page.title}</span></label>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-file-alt" onclick="seeDetails(${i + 1})"></i></div>`;
    
                if (page.favorited) {
                    list.querySelectorAll('.fa-star')[counter].classList.add('favorite');
                }

                counter++;
            }
        } else {
            for (let i = start; i < end - 1; i++) {
                const page = this.getPage(i + 1);
                list.innerHTML += `<div class="checkbox"><label><input type="checkbox">&nbsp; Page ${i + 1}<span>: ${page.title}</span></label>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-file-alt" onclick="seeDetails(${i + 1})"></i></div>`;
    
                if (page.favorited) {
                    list.querySelectorAll('.fa-star')[counter].classList.add('favorite');
                }

                counter++;
            }

            list.innerHTML += `<div class="checkbox"><label><input type="checkbox">&nbsp; Back Cover</label>
                <i class="fas fa-star"></i><i class="fas fa-file-alt" onclick="seeDetails(${end})"></i></div>`;
    
            if (this.getPage(end).favorited) {
                list.querySelectorAll('.fa-star')[end - 1].classList.add('favorite');
            }
        }

        let cookieValues = getCookie('checkboxValues').split(',');
        let checkboxes = [...document.querySelectorAll("input[type='checkbox']")];
        for (let i = start, j = 0; i < end; i++, j++) {
            let val = cookieValues[i];
            if (val === 'true') {
                checkboxes[j].checked = val;
            }
        }
    }

    /**
     * Update the paginator after filtershave already been applied.
     * 
     * @param {number} itemsPerPage items to show per page during pagination
     * @param {number} p current page selected in the paginator 
     */
    paginateAfterFilter(itemsPerPage, p) {
        const list = document.getElementById('list');
        const elements = document.querySelectorAll('.checkbox');

        list.innerHTML = '';
        p--;

        if (!elements.length) { return; }

        const start = itemsPerPage * p;
        const end = start + itemsPerPage;

        let cookieValues = getCookie('checkboxValues').split(',');
        for (let i = start; i < end && elements[i]; i++) {
            let val = cookieValues[i];
            if (val === 'true') {
                elements[i].checked = val;
            }
            list.appendChild(elements[i]);
        }
    }

    /**
     * Display the paginator with the buttons to go to the previous or next page,
     * or a particular numbered page.
     * 
     * @param {number} itemsPerPage items to show per page
     * @param {number} p current page of items
     * @param {number} size total number of items; if not given, then automatically uses total number of pages.
     */
    displayPaginator(itemsPerPage, p = 1, size = this.getPages().size) {
        const paginator = document.getElementById('paginator');
        const pages = size / itemsPerPage;

        paginator.innerHTML = '';
        paginator.innerHTML += `<button type="button" onclick="new PagesService().cursorToPrev(${p})"><i class="fa fa-long-arrow-alt-left"></i> prev</button>`;
        for (let i = 1; i <= pages; i++) {
            if (i === p) {
                paginator.innerHTML += `<button type="button" class="paginator-selected" onclick="new PagesService().jumpTo(${i})">${i}</button>`;
            } else {
                paginator.innerHTML += `<button type="button" onclick="new PagesService().jumpTo(${i})">${i}</button>`;
            }
        }
        paginator.innerHTML += `<button type="button" onclick="new PagesService().cursorToNext(${p})">next <i class="fa fa-long-arrow-alt-right"></i></button>`;
    }

    /**
     * Jump to a page of items. Disable the previous or next buttons if necessary.
     * 
     * @param {number} p page of items to jump to
     */
    jumpTo(p) {
        const paginatorButtons = document.querySelectorAll('#paginator button');
        const currSelected = document.querySelector('#paginator button.paginator-selected');

        p = parseInt(p);

        if (p >= 1 && p <= paginatorButtons.length - 2) {
            this.updatePaginatorButtonListeners(paginatorButtons, p);

            currSelected.classList.remove('paginator-selected');
            paginatorButtons[p].classList.add('paginator-selected');

            const filterValue = document.querySelector('select').value;
            filter(null, filterValue);
            if (filterValue === 'none') {
                this.paginate(12, p);
            } else {
                let itemsPerPage = document.querySelectorAll('.checkbox').length;
                this.paginateAfterFilter(itemsPerPage, p);
            }

        } else if (p < 1) {
            this.jumpTo(paginatorButtons.length - 2);
        } else {
            this.jumpTo(1);
        }
    }

    /**
     * Jump to the previous page while paginating.
     * 
     * @param {number} p current page selected in the paginator 
     */
    cursorToPrev(p) {
        this.jumpTo(--p);
    }

    /**
     * Jump to the next page while paginating.
     * 
     * @param {number} p current page selected in the paginator 
     */
    cursorToNext(p) {
        this.jumpTo(++p);
    }

    /**
     * Update the previous and next buttons (in the paginator) so that
     * the cursorToPrev() and cursorToNext() jump to the corrrect pages.
     * 
     * @param {NodeList} paginatorButtons 
     * @param {number} p current page selected in the paginator 
     */
    updatePaginatorButtonListeners(paginatorButtons, p) {
        paginatorButtons[0].setAttribute('onclick', `new PagesService().cursorToPrev(${p})`);
        paginatorButtons[paginatorButtons.length - 1].setAttribute('onclick', `new PagesService().cursorToNext(${p})`);
    }



}