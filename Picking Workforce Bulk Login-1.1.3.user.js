// ==UserScript==
// @name         Picking Workforce Bulk Login
// @namespace    http://tampermonkey.net/
// @version      1.1.3
// @description  Adds a persistent bulk login input box.
// @author       Barak Rutherford
// @match        https://picking-console.na.picking.aft.a2z.com/fc/RIC2/pick-workforce
// @updateURL    https://github.com/Ashundoktur/Pick-Workforce-Bulk-Login.git
// @downloadURL  https://github.com/Ashundoktur/Pick-Workforce-Bulk-Login/archive/refs/heads/main.zip
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let isInitialized = false;

    function init() {
        if (isInitialized) return;

        // Ensure we don't create multiple boxes
        if (document.getElementById('custom-bulk-login-box')) return;

        const container = document.createElement('div');
        container.id = 'custom-bulk-login-box';
        container.style.cssText = `
            position: fixed; bottom: 30px; right: 30px; width: 300px;
            padding: 15px; background: #f8f8f8; border: 1px solid #ccc;
            border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            z-index: 9999; font-family: sans-serif;
        `;

        container.innerHTML = `
            <label style="font-weight:bold; display:block; margin-bottom:5px;">Bulk Login Filter</label>
            <textarea id="bulk-login-textarea" style="width:100%; height:80px; margin-bottom:10px; resize:vertical; box-sizing:border-box;"></textarea>
            <button id="run-filter-btn" style="width: 100%; padding: 8px; cursor:pointer; background: #232f3e; color: white; border: none; border-radius: 3px;">Apply Filters</button>
        `;

        document.body.appendChild(container);
        document.getElementById('run-filter-btn').onclick = applyBulkFilters;
        isInitialized = true;
    }

    // Use a MutationObserver to watch for the page to load the search input
    // instead of running an interval that might trigger re-renders
    const observer = new MutationObserver((mutations) => {
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput && !isInitialized) {
            init();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    function setReactInput(element, value) {
        // Use native property descriptor to bypass React's interference
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeInputValueSetter.call(element, value);

        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 13, bubbles: true }));
    }

    async function applyBulkFilters() {
        const inputArea = document.getElementById('bulk-login-textarea');
        const logins = inputArea.value.split(/[\s,]+/);
        const searchInput = document.querySelector('input[type="search"]');

        if (!searchInput) {
            alert("Search input not found.");
            return;
        }

        for (let login of logins) {
            if (login.trim() !== "") {
                setReactInput(searchInput, login.trim());
                await new Promise(resolve => setTimeout(resolve, 400));
            }
        }
    }
})();
