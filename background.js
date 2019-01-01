const calculator = {
    type: "detached_panel",
    url: "calc/index.html",
    titlePreface: "Imperial Calculator",
    width: 450,
    height: 800
}

const sidebar = document.querySelector('#sidebar');
const window  = document.querySelector('#window');

document.querySelector('#sidebar').addEventListener('click', () => {
    browser.sidebarAction.open();
});

document.querySelector('#window').addEventListener('click', () => {

});

// browser.browserAction.onClicked.addListener(() => {
//     //var creating = browser.windows.create(calculator);
//     //browser.sidebarAction.open();
// });