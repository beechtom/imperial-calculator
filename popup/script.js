const calculator = {
    type: "detached_panel",
    url: "../calc/index.html",
    titlePreface: "Imperial Calculator",
    width: 450,
    height: 800
}

document.getElementById('sidebar').addEventListener('click', () => {
    browser.sidebarAction.open();
    window.close();
});

document.getElementById('window').addEventListener('click', () => {
    browser.windows.create(calculator);
    window.close();
});