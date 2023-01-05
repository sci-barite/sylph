// ASYNC PRELOAD IMAGEDATA: big change: loading all the icons in memory from the start, using OffscreenCanvas to avoid slowdowns. Faster!
const preloadImageData = async (icon: string) : Promise<ImageData> => {
    const response = await fetch(`images/sylph${icon}`), blob = await response.blob(), img = await createImageBitmap(blob);
    const [width, height] = [img.width, img.height], ctx = new OffscreenCanvas(width, height).getContext('2d');
    ctx!.drawImage(img, 0, 0, width, height);
    return ctx!.getImageData(0, 0, width, height);
}

// ASYNC ICONS: an array of ImageData built with one of paths. Even if async, assigning each to its own index in an array ensures a wanted order.
const Icons: ImageData[] = [], IconNames: string[] = ['32.png', '-hurt64.png', ...Array.from({length: 10}, (_element, n) => `-casts${n}.png`)];
IconNames.forEach(async function(iconName, index) {Icons[index] = await preloadImageData(iconName)});   // Going around a Service Worker limit.

// ASYNC TAB AND BOOKMARK FOLDER GETTERS: Another conceptually big change, allowing to save on indentation and complexity, thanks to promises.
const getTabID = async (title: string) : Promise<number> => { return (await chrome.tabs.query({ title: title }))[0].id! };
const getFolder = async (bmParentID: string) : Promise<string> => { return (await chrome.bookmarks.get((bmParentID)))[0].title };

// UTILITY CONSTS: Storing website matches from the manifest to maintain them from there, plus cache containers and utility things.
const MagicalLands = chrome.runtime.getManifest().content_scripts![0].matches!.map(site => site.split('//')[1].replaceAll('*', ''));
const LandMap = MagicalLands.map(land => ({hostSuffix: land.substring(0, land.indexOf('/')), pathPrefix: land.substring(land.indexOf('/'))}));
const HostMap = LandMap.map(host => host.hostSuffix.slice(0,-3).replaceAll('.', '')), IndexedLands = MagicalLands.slice(0,2);   // Prefs?
const Color: {[key: string]: chrome.action.ColorArray} = {'👎': [230, 80, 90, 230], '👍': [80, 230, 90, 230], '👌': [80, 230, 230, 230]};
const Time: {[key: string]: number} = {'3️⃣': 3600, '2️⃣': 1200, '1️⃣': 1000, '🥇': 50, '🥈': 100}    // Not sure if intuitive...
const FirstFrame = IconNames.findIndex(icon => icon.includes('casts')), LastFrame = IconNames.length;   // To avoid "magic numbers".
const Stash: {[key: string]: string[]} = {}, Known: {[key: number]: number} = {};   // Temporary cache, easier than session storage or similar.

// SYLPHANIMATION: An object providing methods to start and stop the icon animation. Handles different animations for different tabs.
const SylphAnimation: {Frames: {[key: number]: number}, '▶️': (tabID: number, speed: number) => void, '⏹️': (tabID: number) => void} = {
    Frames: {},                                                   // Used to be "Tabs", but tabIDs are used as keys, values are frame numbers.
    '▶️': function(tabID: number, speed: number) {               // Play emoji to play the animation!
        Silence(tabID, '🧚‍♀️ Sylph is casting her spell...');      // Stops previous animations and displays a simple message in tooltip.
        this.Frames[tabID] = FirstFrame;                          // This associates the tab to the index of the first icon with "casts" in name.
        const Animate = (tabID: number, speed: number) => {       // Arrow function, so we are scoped to get "this.Frames" from parent object.
            if (!this.Frames[tabID]) return;                                                // So to stop it just delete that tabID from Frames.
            chrome.action.setIcon({tabId: tabID, imageData: Icons[this.Frames[tabID]]});    // Much faster than string-building and fetching!
            this.Frames[tabID] = (this.Frames[tabID] + 1) % LastFrame || FirstFrame;        // Reached the last frame? go back to the first.
            setTimeout(() => Animate(tabID, speed), speed);                                 // Sylph spell-casting animation for the win!!
        };
        Animate(tabID, speed);
    },
    '⏹️': function(tabID: number) { delete this.Frames[tabID]; } // Stop emoji to stop the animation!
};

// INSTALL LISTENER: This handles the "rules" for icon deactivation and activation depending on website. Might include more in the future.
chrome.runtime.onInstalled.addListener(()=> {
    chrome.action.disable();
    const AwakeSylph: {conditions: chrome.declarativeContent.PageStateMatcher[], actions: any[]} = {
        conditions: LandMap.map(hostAndPrefix => new chrome.declarativeContent.PageStateMatcher({pageUrl: hostAndPrefix})),
        actions: [new chrome.declarativeContent.ShowAction()]
    };
    chrome.declarativeContent.onPageChanged.removeRules(undefined, ()=> {chrome.declarativeContent.onPageChanged.addRules([AwakeSylph])});
    console.log(`🧚‍♀️ Sylph can visit the following lands today... Awaiting orders!`, AwakeSylph.conditions);
});

// TAB REMOVED LISTENER: Needed for SylphAnimation, or it will keep trying to animate the icons of closed tabs forever, logging error each try.
chrome.tabs.onRemoved.addListener(tabID => SylphAnimation['⏹️'](tabID));

// TAB UPDATE LISTENER: handles when a page changes to another without loading, common on LinkedIn, or to a non-indexed page. Avoids UI errors.
chrome.tabs.onUpdated.addListener((tabID, change) => {
    if (!change.url) return;    // There can be changes due to pressing of buttons and stuff. We don't need those, so we exit early.
    if (!IndexedLands.some(indexed => change.url!.includes(indexed))) { Silence(tabID); delete Known[tabID]; } // Resets and rechecks if needed.
    else { delete Known[tabID]; setTimeout(() => Known[tabID] == undefined ? chrome.tabs.sendMessage(tabID, {'✨': true}) : false, Time['2️⃣'])};
})

// BOOKMARK LISTENER: the main interaction! When a bookmark is created, we send a message to the content script, which will process the page.
chrome.bookmarks.onCreated.addListener(async (_id, bm)=> {   // Bookmarking works independently, so we have to check again the website.
    if (!MagicalLands.some(site => bm.url!.includes(site))) return;   // Aborts on negative rather than executing conditionally.
    const tabID = await getTabID(bm.title!), folder = await getFolder(bm.parentId!), host = HostMap.find((url: string) => bm.url!.includes(url));
    SylphAnimation['▶️'](tabID, Time['🥈']);
    (Known[tabID] < 0) ? (SylphBadge(tabID, `${Math.abs(Known[tabID])}`, Color['👎']), setTimeout(() => Silence(tabID), Time['3️⃣']))
        : (chrome.tabs.sendMessage(tabID, {'🧚‍♀️': true, '🗃️': tabID, '🗺️': host, '🌍': bm.url, '💌': Known[tabID], '📁': folder}),
           console.log(`🧚‍♀️ Bookmark created in ${folder}, Sylph is casting her spell from ${tabID}...`));
});

// SYLPHBADGE: Utility function to save repetition and characters, since all the time we specify a badge text, we also want to set a color.
function SylphBadge(tabID: number, text: string, color?: chrome.action.ColorArray, ) {
    if (color) chrome.action.setBadgeBackgroundColor({color: color, tabId: tabID}); 
    chrome.action.setBadgeText({text: text, tabId: tabID});
}

// SHOUT: I found myself repeating a similar pattern, so I made a utility function. Now it's expanded to cover all the "UI" displays.
function Shout(Msg: {[key: string]: any}, text: string, additional?: string) {
    const tabID = Msg['🗃️'], Err = Msg['✔️'] === undefined, How = Msg['✔️'] ^ Msg['🧜‍♂️']; // Chat-GPT suggested XOR, then I got crazy with it!
    chrome.action.setTitle({tabId: tabID, title: `${text}${(additional || '\n')}`});
    Err ? (console.error(text, Msg), SylphBadge(tabID, 'ERR!', Color['👎']))
        : How ? (console.warn(text, Msg), SylphBadge(tabID, `${Known[tabID]+2}`, Color['👌'])) 
            : (console.log(text, Msg), SylphBadge(tabID, (Msg['📝'] || 'NEW!'), Color['👍']), Known[tabID] = -parseInt(Msg['📝']) || 0,
               setTimeout(() => SylphBadge(tabID, ''), Time['3️⃣'])); // The positive badge disappears to make the "ready" icon more visible.
    setTimeout(() => SylphAnimation['⏹️'](tabID), Time['1️⃣']);     // Delayed to make it visible when Stash values are retrieved too quickly.
    setTimeout(() => chrome.action.setIcon({tabId: tabID, imageData: Icons[Err ? 1 : How]}), Time['1️⃣']+Time['🥈']);   // XOR result as index!
}

// SILENCE: The contrary of the above, it cleans up any changes to icon, badge, animation, text etc. when it needs to be reset for any reason.
function Silence(tabID: number, text?: string) {
    SylphAnimation['⏹️'](tabID)  // This is only in case the previous action didn't finish, or there's been an unexpected error.
    chrome.action.setIcon({tabId: tabID, imageData: Icons[0]}); // We keep the default icon at index 0 for several reasons.
    chrome.action.setTitle({tabId: tabID, title: text || ''});  // Adapted this to be able to display a message, optionally.
    SylphBadge(tabID, '');
}

// CHECKID: This used to be inside the listener below, but got too big to be comfortable. Checks based on cached or fetched values from Sheets.
function checkID(data: string | string[], Msg: {[key: string]: any}) {
    if (!Array.isArray(data)) Stash[`🗄️${Msg['🏷️']}`] = JSON.parse(data);
    const ID = Msg['🌍'].includes('jobs/') ? Msg['🌍'].split('/view/')[1].substring(0,10) // Extracting the unique ID.
        : (Msg['🌍'].includes('?') ? Msg['🌍'].split('/in/')[1].split('/?')[0] : Msg['🌍'].split('/in/')[1].replace('/', ''));
    const db = `🗄️${Msg['🏷️']}`, LastID = Stash[db][Stash[db].length - 1], Index= Stash[db].indexOf(ID);
    [Known[Msg['🗃️']], Msg['✔️']] = (Index != -1) ? [Index, true] : [0, false]    // That zero will be changed to an empty string later.
    Msg['✔️'] ? Shout(Msg, `🧜‍♂️ Lancer knows this place! He wrote it as ${ID} in row ${Index + 2}`, '\nClick on the ⭐ to update it.\n')
        : Shout(Msg, `🧜‍♂️ Lancer doesn't know this place. The last he wrote was ${LastID}`, '\nClick on the ⭐ to add this!\n');
}

// MESSAGE LISTENER: Reacts to the content script's actions; themselves replies to either this service worker's messages, or the onLoad event.
chrome.runtime.onMessage.addListener(async Msg => {
    if      (Msg['✔️']) Shout(Msg, `🧚‍♀️ Sylph has casted her spell successfully!`, `\n🧜‍♂️ Lancer's response was:\n\n${Msg['✔️']}\n`);
    else if (Msg['❓']) Shout(Msg, `🧚‍♀️ Sylph has lost Lancer!\n🧜‍♂️ He's left a clue:\n\n${Msg['❓']}`);
    else if (Msg['❌']) Shout(Msg, `🧚‍♀️ Sylph has miscasted!\n\n${Msg['❌']}`);
    if      (!Msg['🌍'] || !IndexedLands.some(indexed => Msg['🌍'].includes(indexed))) return;
    [Msg['🗃️'], Msg['🏷️']] = [await getTabID(Msg['🔤']), Msg['🌍'].split('.com/')[1].split('/')[0]];
    const get = `url=GetUnique${(Msg['🏷️'] === 'jobs' ? 'Jobs' : 'Cands')}`, db = `🗄️${Msg['🏷️']}`; // NOTE: This needs refactoring soon!
    SylphAnimation['▶️'](Msg['🗃️'], Time['🥇']); // Double time animation, to represent a quick lookup.
    console.log('🧚‍♀️ Sylph is summoning 🧜‍♂️ Lancer...', Msg, get);
    (Stash[db]) ? checkID(Stash[db], Msg) : fetch(Msg['🧜‍♂️']+get).then((response) => response.text()).then((data) => {checkID(data, Msg)});
}); 
