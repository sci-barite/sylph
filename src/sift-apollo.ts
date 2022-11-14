function SiftApollo(page: string) {
    if (document.querySelector(".zp_1J5B6.zp_3L0DM")!.children.length == 5)
        (document.querySelector(".zp_1J5B6.zp_3L0DM")!.children[2] as HTMLElement)!.click(); // Click to display jobs!
    else if (document.querySelector(".zp_1J5B6.zp_3L0DM")!.children.length == 6)
        (document.querySelector(".zp_1J5B6.zp_3L0DM")!.children[3] as HTMLElement)!.click(); // Click to display jobs!

    const links = document.querySelector(".zp_33Rq5")!.childNodes;
    COMPANY_LINK = (links[0] as HTMLElement).attributes[1].value;
    if (links[1]) COMPANY = (links[1] as HTMLElement).attributes[1].value;
    else COMPANY = COMPANY_LINK;
    PERSON_LINK = document.querySelector(".zp-button.zp_1TrB3.zp_Dxi_A.zp_3M2dC.zp_2tqsg")!
                    .parentElement!.parentElement!.attributes[1].value
    if (document.querySelector("a.zp-link.zp_3_fnL.zp_W8nfn.zp_3IiJ-")) {   // Credit has been used if this is here.
        PERSON = (document.querySelector("a.zp-link.zp_3_fnL.zp_W8nfn.zp_3IiJ-") as HTMLElement).innerText; // Email
        if (document.querySelector("a.zp-link.zp_3_fnL.zp_1AaQP"))
            APPLICANTS = (document.querySelector("a.zp-link.zp_3_fnL.zp_1AaQP") as HTMLElement).innerText; //Phone
    }
    else {  // Here we assume it's a new person because that's when I'd import without using a credit.
        const newPersonOverride = (document.querySelector(".zp_1lj4H") as HTMLElement).innerText.split("\n");
        PERSON = newPersonOverride[0]; // Company name
        APPLICANTS = newPersonOverride[1]; // Position
        LOCATION = (document.querySelector(".zp_dfI-D") as HTMLElement).innerText;
        COMPANY_SIZE = (document.querySelector(".zp_2HUTp.zp_28q-l") as HTMLElement).innerText;
    }
    let JobsCount = 0;
    document.querySelectorAll(".zp-list-view-item.zp_36VLh.zp_1Afi-.zp_2UWj3.zp_ggEA-.zp_15wD1")
        .forEach((elem) => {
            if ((elem as HTMLElement).innerText.includes('ngineer') || 
                (elem as HTMLElement).innerText.includes('eveloper') || 
                (elem as HTMLElement).innerText.includes('esigner')) {
                JobsCount++ // Eventually these should go as jobs, need to update Lancer to deal with these.
                MORE = MORE + (elem as HTMLElement).innerHTML.split('" target')[0].split('href="')[1].split('?')[0] + '---';
            }
        });
    DATE = JobsCount.toString(); // Comments
    NAME = document.title.split(" - Apollo")[0];
    LINK = "apollo/people/"+document.URL.substring(document.URL.length -24);
}