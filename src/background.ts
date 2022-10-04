var CastingIndex = 1;
var SylphCasting = false;
var Tab;

function SylphCasts()
{               
   if ( SylphCasting )
   {
      chrome.pageAction.setIcon({tabId: Tab, path: 'images/sylph-casts'+CastingIndex+'.png'});
      CastingIndex = (CastingIndex + 1) % 10;
      window.setTimeout(SylphCasts, 160); // Sylph spell-casting animation for the win!!
   }
}

chrome.runtime.onInstalled.addListener(()=> {
    console.log('Sylph awaits your orders!');
});

chrome.bookmarks.onCreated.addListener((id, bookmark)=> {
    var url = bookmark.url as string;
    if (url.includes("linkedin.com/in") || 
        url.includes("upwork.com/ab/") || 
        url.includes("upwork.com/freelancers") || 
        url.includes("djinni.co/home")) {
        chrome.bookmarks.get((bookmark.parentId as string), (folder) => {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                Tab = tabs[0].id
                chrome.tabs.sendMessage(Tab, { name: 'Sylph', site: url, position: folder[0].title });
                console.log("Bookmark created in '"+folder[0].title+"', Sylph is casting her spell...");
                SylphCasting = true;
                SylphCasts(); // Starts the animation of the icon!
            });
        });
    }
});

chrome.runtime.onMessage.addListener(function(Sylph) {
    if (Sylph.SpellSuccessful) {
        SylphCasting = false;
        chrome.pageAction.setIcon({tabId: Tab, path: "images/sylph32.png"}); // Stops animation, puts default icon.
        console.log("Sylph has casted her spell successfully!");
    }
    else {
        SylphCasting = false;
        chrome.pageAction.setIcon({tabId: Tab, path: "images/sylph-hurt.png"}); // Stops animation, puts hurt icon.
    }
});