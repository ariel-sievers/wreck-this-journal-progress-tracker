/**
 * Set a cookie with the given name, value, and how many
 * days until it expires.
 * 
 * @param {string} name 
 * @param {string} value 
 * @param {number} daysToExpire 
 */
function setCookie(name, value, daysToExpire) {
    var date = new Date();
    date.setTime(date.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));

    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
}

/**
 * Get a cookie according to its name. If no cookie exists
 * with that name, then an empty string is returned.
 * 
 * @param {string} cookieName 
 */
function getCookie(cookieName) {
    var name = cookieName + "=";
    var cookies = decodeURIComponent(document.cookie).split(';');

    for(var i = 0; i < cookies.length; i++)
    {
        var temp = cookies[i].trim();
        if (temp.indexOf(name) == 0)
            return temp.substring(name.length, temp.length);
    }
    return '';
}

/**
 * Check whether a cookie exists by its name. If it does not
 * already exist, then set a cookie with that given name and value,
 * and set it expiration to a year from today.
 * 
 * If the cookie does exist, then split the cookie by commas and query for
 * every checkbox on the page; set each checkboxe's checked value to the respective
 * cookie value.
 * 
 * @param {string} name 
 * @param {string} value 
 */
function checkCookie(name, value) {
    var cookie = getCookie(name);
    if (cookie != '') {
        cookieValues = cookie.split(',');
        checkboxes = [...document.querySelectorAll("input[type='checkbox']")];
        cookieValues.forEach(function (val, i) {
            if (val === 'true') 
                checkboxes[i].checked = val;
        })

    } else {
        setCookie(name, value, 365);
    }
}

/**
 * Update the checkboxValue cookie with the returned checkbox values,
 * setting the expiration date to a year from today.
 */
function updateCookie() {
    setCookie('checkboxValues', getCheckboxValues(), 365);
}