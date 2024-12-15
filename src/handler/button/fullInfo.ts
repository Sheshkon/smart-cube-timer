const toggleInfoButton = document.getElementById('show-full-info');
const infoSection = document.getElementById('info');

toggleInfoButton?.addEventListener('click', () => {
    if (infoSection?.style.display === 'none' || infoSection?.style.display === '') {
        infoSection.style.display = 'grid'; // Show info
        toggleInfoButton.textContent = 'Hide Info'; // Change button text
    } else {
        // @ts-ignore
        infoSection.style.display = 'none'; // Hide info
        toggleInfoButton.textContent = 'Show Info'; // Change button text
    }
});