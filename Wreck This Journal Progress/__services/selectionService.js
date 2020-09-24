class SelectionService {
    static selected;

    constructor() {
        if (localStorage.getItem('selected') === 'undefined') {
            localStorage.setItem('selected', '');
        }

        this.selected = localStorage.getItem('selected');
    }

    /**
     * Mark a page with the given page number as selected
     * @param page
     */
    select(pageNumber) {
        localStorage.setItem('selected', pageNumber);
    }

    /**
     * Get the selected page.
     */
    getSelected() {
        localStorage.getItem('selected');
    }

}