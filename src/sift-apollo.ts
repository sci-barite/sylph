// The only tricky thing here is it uses the same parameters for different things. Now that we return the params, we could make this better.
function apolloSift(Msg: {[key: string]: any}) : {Failed:boolean, String:string} {
    if (!document.querySelector('#location_detail_card')) return {Failed: true, String: '❌ She sees no human here!'};
    
    if (document.querySelector(".zp_1J5B6.zp_3L0DM")!.children.length == 5)
        (document.querySelector(".zp_1J5B6.zp_3L0DM")!.children[2] as HTMLElement)!.click(); // Click to display jobs!
    else if (document.querySelector(".zp_1J5B6.zp_3L0DM")!.children.length == 6)
        (document.querySelector(".zp_1J5B6.zp_3L0DM")!.children[3] as HTMLElement)!.click(); // Click to display jobs!
    
    const links = document.querySelector(".zp_33Rq5")!.childNodes;
    const COMPANY_LINK = (links[0] as HTMLElement).attributes[1].value;
    const COMPANY = links[1] ? (links[1] as HTMLElement).attributes[1].value : COMPANY_LINK;
    const PERSON_LINK = document.querySelector(".zp-button.zp_1TrB3.zp_Dxi_A.zp_3M2dC.zp_2tqsg")!
        .parentElement!.parentElement!.attributes[1].value;
    const PERSON = document.querySelector("a.zp-link.zp_3_fnL.zp_W8nfn.zp_3IiJ-")? 
        (document.querySelector("a.zp-link.zp_3_fnL.zp_W8nfn.zp_3IiJ-") as HTMLElement).innerText :  // Credit used override: Email
        (document.querySelector(".zp_1lj4H") as HTMLElement).innerText.split("\n")[0];  // Fallback (new contact): Company name
    const APPLICANTS = document.querySelector("a.zp-link.zp_3_fnL.zp_1AaQP")? 
        (document.querySelector("a.zp-link.zp_3_fnL.zp_1AaQP") as HTMLElement).innerText : // Credit used override: Phone
        (document.querySelector(".zp_1lj4H") as HTMLElement).innerText.split("\n")[1]; // Fallback (new contact): Position
    const LOCATION = document.querySelector(".zp_dfI-D")? (document.querySelector(".zp_dfI-D") as HTMLElement).innerText : 'NA';
    const COMPANY_SIZE = document.querySelector(".zp_2HUTp.zp_28q-l")? 
        (document.querySelector(".zp_2HUTp.zp_28q-l") as HTMLElement).innerText : 'NA';
    const positions = ['ngineer', 'eveloper', 'esigner', 'ester', 'rogrammer'];
    const Jobs = Array.from(document.querySelectorAll(".zp-list-view-item.zp_36VLh.zp_1Afi-.zp_2UWj3.zp_ggEA-.zp_15wD1"))
        .filter(elem => positions.some(position => (elem as HTMLElement).innerText.includes(position)));
    const MORE = Jobs.map(elem => elem.innerHTML.split('" target')[0].split('href="')[1].split('?')[0]);
    const DATE = Jobs.length; // Comments
    const NAME = document.title.split(" - Apollo")[0];
    const LINK = (document.URL.includes('contacts') ? "apollo/contacts/" : "apollo/people/")+document.URL.substring(document.URL.length -24);

    const PARAM_STRING : string = 'name='+encodeURIComponent(NAME)+'&url='+LINK+'&loc='+LOCATION+'&date='+DATE+'&person='+PERSON+
            '&app='+APPLICANTS+'&personlink='+PERSON_LINK+'&comp='+COMPANY+'&complink='+COMPANY_LINK+'&compsize='+COMPANY_SIZE+'&more='+MORE;
    return {Failed: false, String: PARAM_STRING};  
}
