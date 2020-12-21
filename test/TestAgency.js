const AgencyApp = artifacts.require("./AgencyApp.sol");
// AgencyApp.events.OnAccountAdd().on("data", function(event) {
    // console.log("Event", event.returnValues.userAddr);
// }).on("error", console.error);

contract("AgencyApp", accounts => {  
        it("Add Account", async () => {  
            const agencyApp = await AgencyApp.deployed();  
            
            let isValid = await agencyApp.isValidAccount();  
            console.log(isValid);
            agencyApp.addAccount("test", 1);

            let isValid_after = await agencyApp.isValidAccount();  
            console.log(isValid_after);
            let {0: name, 1: content, 2: type} = await agencyApp.getAccount();
            console.log("Name:", name);
            console.log("Content:", content);
            console.log("Acc type:", type);
            agencyApp.updataAccount("new content");
            let {0: name1, 1: content1, 2: type1} = await agencyApp.getAccount();
            console.log("Name:", name1);
            console.log("Content:", content1);
            console.log("Acc type:", type1);
            // agencyApp.allEvents().get(function(error, logs) {
                // console.log("listened", logs);
            // });

    });  
});  


