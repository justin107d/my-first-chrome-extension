
// listens to see if the page is a youtube video by reading the url

chrome.tabs.onUpdated.addListener((tabId, tab)=>{
    if (tab.url && tab.url.includes("youtube.com/watch")) {
        const queryParameters = tab.url.split("?")[1]
        const urlParameters = new URLSearchParams(queryParameters)
        console.log(urlParameters)

        // content script will have all this information
        chrome.tabs.sendMessage(tabId, {
            type: "NEW",
            videoId: urlParameters.get("v")
        })

    }

})