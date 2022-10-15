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
    console.log('🧚‍♀️ Sylph awaits your orders!');
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
    if (url.includes("in.com/in") || url.includes("in.com/jobs") || 
        url.includes("rk.com/ab/") || url.includes("rk.com/free") || url.includes("nni.co/home")) {
        chrome.bookmarks.get((bookmark.parentId as string), (folder) => {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                Tab = (tabs[0].id as number);
                SylphCasting = true;
                SylphCasts(150); // Starts the animation of the icon!
                chrome.tabs.sendMessage(Tab, { name: 'Sylph', site: url, ex: ExistingID, position: folder[0].title });
                console.log("🧚‍♀️ Bookmark created in '"+folder[0].title+"', Sylph is casting her spell...");
            });
        });
    }
});

chrome.runtime.onMessage.addListener(function(Sylph) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        Tab = (tabs[0].id as number);
        if (Sylph.SpellSuccessful) {
            SylphCasting = false;
            chrome.action.setIcon({tabId: Tab, path: "images/sylph32.png"}); // Stops animation, puts default icon.
            console.log("🧚‍♀️ Sylph has casted her spell successfully!");
            chrome.action.setTitle({tabId: Tab, 
                title: "🧜‍♂️ Lancer's response was:\n\n"+Sylph.LancerResponse+'\n'});
        }
        else if (!Sylph.SpellSuccessful && !Sylph.Lancer) {
            SylphCasting = false;
            chrome.action.setIcon({tabId: Tab, path: "images/sylph-hurt.png"}); // Stops animation, puts hurt icon.
            console.log("🧚‍♀️ Sylph has miscasted!");
            chrome.action.setTitle({tabId: Tab, 
                title: "🧚‍♀️ Sylph has miscasted!\n🧜‍♂️ Lancer's response was:\n\n"+Sylph.LancerResponse+'\n'});
        }
        else if (Sylph.Lancer) {
            SylphCasting = true;
            SylphCasts(60);
            console.log('🧚‍♀️ Sylph is summoning Lancer...');
            fetch(
            "https://script.google.com/macros/s/AKfycbxMDCxoSFoZREabwctL86r1q8Hf5_iylcUxlZtL_4Y_dQrjwL9onaJ6G1SshfgCHqLq/exec?url=GetUniqueJobs"
            )
            .then((response) => response.text())
            .then((data) => {
                let UniqueJobs = data;
                let JobURL = Sylph.Place;
                let JobID = JobURL.split("view/")[1];
                let JobsArray = UniqueJobs.split(',');
                let JobIndex;
                JobsArray.indexOf(JobID!.split('/')[0]) ? JobIndex = JobsArray.indexOf(JobID!.split('/')[0]) : JobIndex = JobsArray.indexOf(JobID);
                if (JobIndex != -1) {
                    ExistingID = JobIndex.toString();
                    SylphCasting = false; 
                    chrome.action.setIcon({tabId: Tab, path: "images/sylph-hurt.png"});
                    console.log("🧜‍♂️ Lancer knows this place! He wrote it as "+JobID!.split('/')[0]+' in row '+(parseInt(ExistingID)+2));
                    chrome.action.setTitle({tabId: Tab, 
                        title: "🧜‍♂️ Lancer knows this place!\nHe wrote it as "+JobID!.split('/')[0]+' in row '+(parseInt(ExistingID)+2)+'\n'
                                +"Click on the ⭐ to update it.\n"})
                }
                else {
                    ExistingID = '';
                    SylphCasting = false;
                    chrome.action.setIcon({tabId: Tab, path: "images/sylph32.png"});
                    console.log("🧜‍♂️ Lancer doesn't know this place. The last he wrote was "+UniqueJobs.substring(UniqueJobs.length - 10));
                    chrome.action.setTitle({tabId: Tab, 
                        title: "🧜‍♂️ Lancer doesn't know this place.\nThe last he wrote was "+UniqueJobs.substring(UniqueJobs.length - 10)+'\n'
                                +"Click on the ⭐ to add this!\n"})
                }
            });
        }
    });
});