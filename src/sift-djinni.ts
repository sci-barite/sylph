// The most straightforward of the three.
function djinniSift(Msg: {[key: string]: any}) : {Failed: boolean, String: string} {
    const NAME = (document.querySelector("#candidate_name") as HTMLElement).innerText;
    const English = (document.querySelector(".inbox-thread-candidate-info") as HTMLElement).innerText;
    const Skills = (document.querySelector(".inbox-candidate-details--title") as HTMLElement).innerText;
    const RATE = Skills.split(",")[1];
    const SKILLS = Skills.split(",")[0]+" "+English.split(" · ")[0];
    const ENGLISH = English.split(" · ")[1];
    const POSITION = (document.querySelector(".page-header") as HTMLElement).innerText.split("›")[0].includes("Inbox")?
            Msg['📁'] : (document.querySelector(".page-header") as HTMLElement).innerText.substring(11).split("›")[0];
    const LOCATION = (document.querySelectorAll("li.inbox-candidate-details--item")[2] as HTMLElement).innerText.split('\n')[1];
    const LINK = document.URL;

    const PARAM_STRING = 'name='+NAME+'&pos='+encodeURIComponent(POSITION)+'&status=0.New&skills='+encodeURIComponent(SKILLS)
        +'&eng='+ENGLISH+'&rate='+RATE+'&loc='+LOCATION+'&url='+LINK+'&more=';
    return {Failed: false, String: PARAM_STRING};
}
