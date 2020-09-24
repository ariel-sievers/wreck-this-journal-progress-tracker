class SearchService {
    terms;

    constructor() {
        if (localStorage.getItem('searchTerms') === 'undefined') {
            localStorage.setItem('searchTerms', '');
        }

        this.terms = localStorage.getItem('searchTerms');
    }

    /**
     * Update terms in the local storage.
     * 
     * @param {string[]} terms 
     */
    updateTerms(terms) {
        localStorage.setItem('searchTerms', terms);
    }

    /**
     * Remove terms from local storage.
     */
    removeTerms() {
        localStorage.removeItem('searchTerms');
    }

    /**
     * Get terms stored in local storage.
     * 
     * @returns null if no terms exist in the local storage.
     */
    getTerms() {
        const terms = localStorage.getItem('searchTerms');
        if (terms) {
            return terms.trim().toLowerCase();
        }

        return terms;
    }

}