// var [APPLICANTS, PERSON, PERSON_LINK, COMPANY, COMPANY_LINK, COMPANY_SIZE, DATE] = 
//      TEL?,       EMAIL?  LINKEDIN,   LINKEDIN, WEBSITE,                    NAME

function SiftApollo(page: string) {
    const links = document.querySelector(".zp_33Rq5")!.childNodes;
    COMPANY_LINK = (links[0] as HTMLElement).attributes[1].value;
    COMPANY = (links[1] as HTMLElement).attributes[1].value;
    PERSON_LINK = document.querySelector(".zp_2aAOa > a")!.attributes[1].value;
    if (document.querySelector("a.zp-link.zp_3_fnL.zp_W8nfn.zp_3IiJ-")) {
        PERSON = (document.querySelector("a.zp-link.zp_3_fnL.zp_W8nfn.zp_3IiJ-") as HTMLElement).innerText;
        APPLICANTS = (document.querySelector("a.zp-link.zp_3_fnL.zp_1AaQP") as HTMLElement).innerText;
    }
    NAME = document.title.split(" - Apollo")[0];
    LINK = document.URL.split('?')[0];
}