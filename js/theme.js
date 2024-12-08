// theme.js
// Handles theme switching between light and dark modes.
// Saves the user's preference in localStorage.

/**
 * Update the theme toggle button text based on the current theme.
 * @param {HTMLElement} themeToggle - The theme toggle button element.
 * @param {string} theme - Current theme, 'light' or 'dark'.
 */
function updateThemeButton(themeToggle, theme) {
    themeToggle.textContent = theme === 'light' ? 
        '🌞 Light Mode' : 
        '🌙 Dark Mode';
}

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Attempt to get saved theme from localStorage
    let savedTheme = 'light';
    try {
        savedTheme = localStorage.getItem('theme') || 'light';
    } catch (err) {
        console.warn('Unable to access localStorage for theme preference. Defaulting to light mode.');
    }

    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(themeToggle, savedTheme);

    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);

        try {
            localStorage.setItem('theme', newTheme);
        } catch (err) {
            console.warn('Unable to save theme preference to localStorage.');
        }

        updateThemeButton(themeToggle, newTheme);
    });
});
