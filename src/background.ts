var Tab : number;
var CastingIndex = 1;
var SylphCasting = false;

var UniqueJobs = '';
var ExistingID = '';

function SylphCasts(speed : number)
{               
    if ( SylphCasting ) {
        chrome.action.setIcon({tabId: Tab, path: 'images/sylph-casts'+CastingIndex+'.png'});
        CastingIndex = (CastingIndex + 1) % 10;
        setTimeout(() => SylphCasts(speed), speed); // Sylph spell-casting animation for the win!!
    }
}

chrome.runtime.onInstalled.addListener(()=> {
    console.log('Sylph awaits your orders!');
    chrome.action.disable();
    let AwakeSylph = {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({ pageUrl: { hostSuffix: '.linkedin.com', pathPrefix: '/in' } }),
          new chrome.declarativeContent.PageStateMatcher({ pageUrl: { hostSuffix: '.linkedin.com', pathPrefix: '/jobs' } }),
          new chrome.declarativeContent.PageStateMatcher({ pageUrl: { hostSuffix: 'djinni.co', pathPrefix: '/home/inbox' } }),
          new chrome.declarativeContent.PageStateMatcher({ pageUrl: { hostSuffix: '.upwork.com', pathPrefix: '/ab/applicants' } }),
          new chrome.declarativeContent.PageStateMatcher({ pageUrl: { hostSuffix: '.upwork.com', pathPrefix: '/freelancers' } }),
        ],
        actions: [ new chrome.declarativeContent.ShowAction() ]
    };
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([AwakeSylph]);
    });
});

chrome.bookmarks.onCreated.addListener((id, bookmark)=> {
    var url = bookmark.url as string;
    if (url.includes("linkedin.com/in") || 
        url.includes("linkedin.com/jobs") || 
        url.includes("upwork.com/ab/") || 
        url.includes("upwork.com/freelancers") || 
        url.includes("djinni.co/home")) {
        chrome.bookmarks.get((bookmark.parentId as string), (folder) => {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                Tab = (tabs[0].id as number);
                SylphCasting = true;
                SylphCasts(150); // Starts the animation of the icon!
                chrome.tabs.sendMessage(Tab, { name: 'Sylph', site: url, ex: ExistingID, position: folder[0].title });
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
    else if (!Sylph.SpellSuccessful && !Sylph.LancerAnswer) {
        SylphCasting = false;
        chrome.action.setIcon({tabId: Tab, path: "images/sylph-hurt.png"}); // Stops animation, puts hurt icon.
    }
    else if (Sylph.LancerAnswer) {
        if (!Sylph.LancerAnswer.startsWith("Oh no!")) {
            UniqueJobs = Sylph.LancerAnswer;
            console.log('Sylph has summoned Lancer! He told her a secret: "'+UniqueJobs.substring(UniqueJobs.length - 5)+'"');
            chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
                var JobURL = (tabs[0]!.url as string);
                let JobID = JobURL.split("view/")[1];
                let JobsArray = UniqueJobs.split(',');
                let JobIndex = JobsArray.indexOf(JobID!.split('/')[0]);
                if (JobIndex != -1) { 
                    ExistingID = JobIndex.toString();
                    console.log('Lancer has found a double! '+JobID!.split('/')[0]+' at '+ExistingID);
                    SylphCasting = true;
                    SylphCasts(80);
                    setTimeout(() => { SylphCasting = false; chrome.action.setIcon({tabId: Tab, path: "images/sylph-hurt.png"}); }, 4000);
                }
                else chrome.action.setIcon({tabId: tabs[0].id, path: "images/sylph32.png"});
            });
        }
        else console.log('Sylph missed Lancer! He left a note saying: "'+Sylph.LancerAnswer+'"');
    }
});