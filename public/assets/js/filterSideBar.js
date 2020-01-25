/*SIDEBAR FUNCTIONS */
function openFilter(width) {
    document.getElementById("mySideFilters").style.width = `${width}vw`;
    document.getElementById("mainFilter").style.marginLeft = `${width}vw`
}

function closeFilter() {
    document.getElementById("mySideFilters").style.width = "0";
    document.getElementById("mainFilter").style.marginLeft = "0";

}