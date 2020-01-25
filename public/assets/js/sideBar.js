/*SIDEBAR FUNCTIONS */
function openNav(width) {
    document.getElementById("mySidebar").style.width = `${width}vw`;
    document.getElementById("main").style.marginLeft = `${width}vw`
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}