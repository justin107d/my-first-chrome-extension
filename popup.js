
import { getCurrentTab } from "./utils";

// adding a new bookmark row to the popup
const addNewBookmark = (bookmarksElement, bookmark) => {
    const bookmarkTitleElement = document.createElement("div");  
    const newBookmarkElement = document.createElement("div");
    controlsElement = document.createElement("div");
    
    bookmarkTitleElement.textContent = bookmark.desc;
    bookmarkTitleElement.className = 'bookmark-title';

    controlsElement.className = 'bookmark-controls';

    newBookmarkElement.id = "bookmark-" + bookmark.time;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp", bookmark.time);

    setBookmarkAttributes("play", onPlay, controlsElement);
    setBookmarkAttributes("delete", onDelete, controlsElement);

    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsElement);
    bookmarksElement.appendChild(newBookmarkElement);
};


// shows bookmarks if there are any
const viewBookmarks = (currentVideoBookmarks=[]) => {
    const bookmarksElement = document.getElementById("bookmarks");
    bookmarksElement.innerHTML = ""

    if (currentVideoBookmarks.length > 0){
        for (let i = 0; i < currentVideoBookmarks.length; i++){
            const bookmark = currentVideoBookmarks[i];
            addNewBookmark(bookmarksElement, bookmark);
        }
    } else {
        bookmarksElement.innerHTML = '<i class="row">No bookmarks yet</i>'
    }
};

const onPlay = async e => {
    const bookmarkTime = e.target.parentNode.getAttribute("timestamp");
    const activeTab = await getCurrentTab();

    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTime
    })
};

const onDelete = async e => {
    const activeTab = await getCurrentTab();
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const bookmarkElementToDelete = document.getElementById("bookmark-" + bookmarkTime);

    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        value: bookmarkTime

    }, viewBookmarks) //callback function to refresh bookmarks after the delete happens
};


const setBookmarkAttributes =  (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img");

    controlElement.src = "assets/" + src + ".png";
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);
    controlParentElement.appendChild(controlElement);


};

// fires when the document has initially been loaded
document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getCurrentTab()
    const queryParameters = activeTab.url.split("?")[1];
    urlParameters = new URLSearchParams(queryParameters);

    const currentVideo = urlParameters.get("v");

    if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
        chrome.storage.sync.get([currentVideo], (data) => {
            const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];
            // handles videos on page
            viewBookmarks(currentVideoBookmarks);
        })
    } else {
        // not on YouTube
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = '<div class="title">This is not a YouTube video.</div>'
    }
});