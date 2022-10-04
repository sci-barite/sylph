var Tab : number;
var CastingIndex = 1;
var SylphCasting = false;

function SylphCasts()
{               
   if ( SylphCasting )
   {
      chrome.action.setIcon({tabId: Tab, path: 'images/sylph-casts'+CastingIndex+'.png'});
      CastingIndex = (CastingIndex + 1) % 10;
      setTimeout(() => SylphCasts(), 150); // Sylph spell-casting animation for the win!!
   }
}

chrome.runtime.onInstalled.addListener(()=> {
    console.log('Sylph awaits your orders!');
    chrome.action.disable();

    let rules = {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({pageUrl: { hostSuffix: '.linkedin.com', pathPrefix: '/in', schemes: ['https'] }}),
          new chrome.declarativeContent.PageStateMatcher({pageUrl: { hostSuffix: 'djinni.co', pathPrefix: '/home/inbox', schemes: ['https'] }}),
          new chrome.declarativeContent.PageStateMatcher({pageUrl: { hostSuffix: '.upwork.com', pathPrefix: '/ab/applicants', schemes: ['https'] }}),
          new chrome.declarativeContent.PageStateMatcher({pageUrl: { hostSuffix: '.upwork.com', pathPrefix: '/freelancers', schemes: ['https'] }}),
        ],
        actions: [ new chrome.declarativeContent.ShowAction() ]
      };
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([rules]);
      });
});

chrome.bookmarks.onCreated.addListener((id, bookmark)=> {
    var url = bookmark.url as string;
    if (url.includes("linkedin.com/in") || 
        url.includes("upwork.com/ab/") || 
        url.includes("upwork.com/freelancers") || 
        url.includes("djinni.co/home")) {
        chrome.bookmarks.get((bookmark.parentId as string), (folder) => {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                Tab = (tabs[0].id as number);
                SylphCasting = true;
                SylphCasts(); // Starts the animation of the icon!
                chrome.tabs.sendMessage(Tab, { name: 'Sylph', site: url, position: folder[0].title });
                console.log("Bookmark created in '"+folder[0].title+"', Sylph is casting her spell...");
            });
        });
    }
});

chrome.runtime.onMessage.addListener(function(Sylph) {
    if (Sylph.SpellSuccessful) {
        SylphCasting = false;
        chrome.action.setIcon({tabId: Tab, path: "images/sylph32.png"}); // Stops animation, puts default icon.
        console.log("Sylph has casted her spell successfully!");
    }
    else {
        SylphCasting = false;
        chrome.action.setIcon({tabId: Tab, path: "images/sylph-hurt.png"}); // Stops animation, puts hurt icon.
    }
});