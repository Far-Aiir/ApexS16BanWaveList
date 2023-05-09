const rankedLeaderboard = function (system, page) { return "https://apex.tracker.gg/apex/leaderboards/stats/" + system + "/RankScore?page=" + page };
const fs = require('fs');

async function getUsernames(system, page) {
    let res = await (await fetch(rankedLeaderboard(system, page))).text()
    let toFind = "<script>window.__INITIAL_STATE__ = ";
    let beginning = res.indexOf(toFind);
    let jsonStart = res.substring(beginning+toFind.length)
    let toFindend = "</script>"
    let ending = jsonStart.indexOf(toFindend);
    let output = jsonStart.substring(0, ending);
    let parsed = JSON.parse(output);


    let userArray = parsed.stats.standardLeaderboards[0].items;

    let users = {};
    userArray.forEach(u => {
        users[Object.keys(users).length] = {"id": u.id, "rp": u.value, "rank": u.rank, "console": system, "banned": false}
    });

    return users;

}


async function checkProfile(u, system) {
    let users = await u
    let content = "";
    for (let i = 0; i < Object.keys(users).length; i++) {
        let loc = Object.keys(users)[i];
        let u = users[loc];
        // console.log(u.id)
        let name = u.id.replace(/ /g,"%20");
        let url = "https://apex.tracker.gg/apex/profile/" + system + "/" + name + "/overview"
        let res = await (await fetch(url)).text();
        let toFind = "Player has an active in-game ban.";
        content += `Name: ${u.id} RP: ${u.rp} Rank: ${u.rank} Console: ${u.console} Banned: ${res.indexOf(toFind) != -1 ? "true" : "false"}\n`

    }

    return content;
}

async function loadUsers() {
    console.time("begin");
    let PSNUsers = [await getUsernames("psn", 1)];
    let XBOXUsers = [await getUsernames("xbl", 1)];
    let PCUsers = [await getUsernames("origin", 1)];
    let allContent = ["", "", ""];

    for (let x = 0; x < PSNUsers.length; x++) allContent[0] += await checkProfile(PSNUsers[x], "psn");
    for (let x = 0; x < XBOXUsers.length; x++) allContent[1] += await checkProfile(XBOXUsers[x], "xbl");
    for (let x = 0; x < PCUsers.length; x++) allContent[2] += await checkProfile(PCUsers[x], "origin");

    console.log("DONE!");
    fs.appendFile(process.cwd()+"/playerListPC.txt", allContent[2], err => {
        if (err) {
            console.error(err);
        }
    });
    fs.appendFile(process.cwd()+"/playerListXbox.txt", allContent[1], err => {
        if (err) {
            console.error(err);
        }
    });
    fs.appendFile(process.cwd()+"/playerListPSN.txt", allContent[0], err => {
        if (err) {
            console.error(err);
        }
    });
    console.timeEnd("begin");
}
loadUsers()

