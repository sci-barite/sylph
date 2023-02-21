# Sylph

Sylph is a Chrome Extension that sifts data from a few popular websites, and sends it to a web app done in Google Apps Script, which in turn sends it to a Google Sheet.

This is my first project, so the code will be considered very dirty by most, but it gets the job done, and it was a cool learning experience. :)


## Instructions


Please note that if you "try this at home" as it is, it won't work, because it referes to a deployed version of my [Lancer](https://github.com/sci-barite/lancer) web app, the URL of which I obviously keep secret, in a file excluded via .gitignore.

To make it work, you should deploy your own version of Lancer, and put the URL of the deployment in a LancerWebApp string, declared in a lancer.ts file.

You can try to do this following the instructions in Lancer's readme file, but you'd probably be better off writing your own version of it, to adapt to the needs of your own Google Sheet.

Here is an example of how it would work when properly set up:

![Working with Sylph video](https://cdn-images-1.medium.com/max/800/0*zSQ_aYJ2K_1St3sV.gif)

Enjoy! :)