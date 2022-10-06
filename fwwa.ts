/**
 * This is the big one! 
 * Gets data sent by my Sylph Chrome Extension, and writes an entry on Google Sheets directly from LinkedIn, on Bookmark creation.
 * Now writing data coming from Upwork, and Djinni, too...
 */
 function doGet(e: { parameter: any; }) {
    var Get = e.parameter;
    if (Get.url.includes("linkedin")) var DB = SpreadsheetApp.openById('DB-ID'/** ⛔️ Replace this with ID */).getSheetByName("DB");
    else var DB = SpreadsheetApp.openById('FREEDB-ID'/** ⛔️ Replace this with ID */).getSheetByName("FreelanceDB");
    const Today = Utilities.formatDate(new Date(), "GMT+3", "dd/MM/yyyy");
    const Names = DB?.getRange('A:A').getValues();

    var JSONString = JSON.stringify([Get.name]);  
    var JSONOutput = ContentService.createTextOutput(JSONString+' parameter invalid.\n\nHave a nice day!');
    JSONOutput.setMimeType(ContentService.MimeType.JSON);

    if (Get.name == null) return JSONOutput;

    const Search = (element: any) => element == Get.name;
    if (Names?.findIndex(Search) != -1) var name = 'DUPLICATE! '+Get.name; else var name : string = Get.name;

    DB?.appendRow([
      name, '', '0.New', 'Sylph', Today, decodeURIComponent(Get.pos), decodeURIComponent(Get.skills), Get.loc, '', Get.more, '', '', Get.eng, Get.rate
    ]);
    var Name = DB?.getRange('A'+DB.getLastRow());
    var Row = DB?.getRange(DB.getLastRow()+':'+DB.getLastRow());
    var Link = SpreadsheetApp.newRichTextValue()
      .setText(name)
      .setLinkUrl(Get.url)
      .build();
    Name?.setRichTextValue(Link);
    Name?.offset(0,1).insertCheckboxes();
    Row?.offset(-1,0).copyTo(Row, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
    Name?.offset(0,3).setFontWeight("bold");
    Row?.setVerticalAlignment('middle');

    JSONString = JSON.stringify(Row?.getValues());  
    JSONOutput = ContentService.createTextOutput(JSONString+"\n🧚‍♀️ Sylph's spell was casted successfully!");
    JSONOutput.setMimeType(ContentService.MimeType.JSON);

    return JSONOutput;
}