// It got much, much easier than the first version, but still a bit tricky sometimes.

function SiftLinked(position : string) {
    var Sifted: Array<string> = [];
    for (var i=0; i<3; i++) {
        Sifted.push(' '+
        (document.querySelectorAll("a[data-field='skill_card_skill_topic']")[i] as HTMLElement).innerText.split("\n")[0]);
    }

    const Hidden = document.querySelectorAll(".visually-hidden");
    var Collated = " · ";
    for (i=0; i < Hidden.length; i++) {
        let String: string = (Hidden[i] as HTMLElement).innerText;
        if (String.includes("Skills:") && String.includes("·")) 
            Collated = Collated+String.substring(8)+" · ";
        else if (String === "English") ENGLISH = (Hidden[i+1] as HTMLElement).innerText;
    }

    var SubSkills = Collated.split(" · ");
    for (i=0; i<SubSkills.length; i++) {
        if (Sifted.indexOf(' '+SubSkills[i]) == -1 && Sifted[i] != '') Sifted.push(' '+SubSkills[i]);
    }

    SKILLS = Sifted.toString().substring(1);
    NAME = (document.querySelector(".text-heading-xlarge") as HTMLElement).innerText
    POSITION = position;
    LINK = document.URL;
}