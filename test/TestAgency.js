const AgencyApp = artifacts.require("./AgencyApp.sol");
// AgencyApp.events.OnAccountAdd().on("data", function(event) {
    // console.log("Event", event.returnValues.userAddr);
// }).on("error", console.error);

contract("AgencyApp", accounts => {  
        it("Add Account", async () => {  
            const agencyApp = await AgencyApp.deployed();  
            
            let isValid = await agencyApp.isAccount(accounts[0]);  
            console.log("Before register... ", isValid);
            agencyApp.addAcc("test", true);

            let isValid_after = await agencyApp.isAccount(accounts[0]);  
            console.log("After register... ", isValid_after);
            let {0: name, 1: content, 2: type} = await agencyApp.getAcc(accounts[0]);
            console.log("Name:", name);
            console.log("Content:", content);
            console.log("Acc type:", type);
            agencyApp.updataAccContent("new content", true);
            let {0: name1, 1: content1, 2: type1} = await agencyApp.getAcc(accounts[0]);
            console.log("Name:", name1);
            console.log("Content:", content1);
            console.log("Acc type:", type1);
    });  
});  


