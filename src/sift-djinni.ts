// The most straightforward of the three.

function SiftDjinni(position) {
    NAME = (document.querySelector("#candidate_name") as HTMLElement).innerText;
    ENGLISH = (document.querySelector(".inbox-thread-candidate-info") as HTMLElement).innerText;
    SKILLS = (document.querySelector(".inbox-candidate-details--title") as HTMLElement).innerText;
    RATE = SKILLS.split(",")[1];
    SKILLS = SKILLS.split(",")[0]+" "+ENGLISH.split(" · ")[0];
    ENGLISH = ENGLISH.split(" · ")[1];
    if ((document.querySelector(".page-header") as HTMLElement).innerText.split("›")[0].includes("Inbox")) 
         POSITION = position;
    else POSITION = (document.querySelector(".page-header") as HTMLElement).innerText.substring(11).split("›")[0];
    LOCATION = (document.querySelectorAll("li.inbox-candidate-details--item")[2] as HTMLElement).innerText.split('\n')[1];
    LINK = document.URL;
}