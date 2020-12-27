const AgencyApp = artifacts.require("./AgencyApp.sol");
// AgencyApp.events.OnAccountAdd().on("data", function(event) {
    // console.log("Event", event.returnValues.userAddr);
// }).on("error", console.error);

contract("AgencyApp", accounts => {  
        it("Applicant Account Test", async () => {  
            const agencyApp = await AgencyApp.deployed();  
            
            let isValid = await agencyApp.isAccount.call(accounts[0]);  
            console.log("Before register... ", isValid);
            agencyApp.addAcc("test", true, {from: accounts[0]});

            let isValid_after = await agencyApp.isAccount.call(accounts[0]);  
            console.log("After register... ", isValid_after);
            let {0: name, 1: content, 2: type} = await agencyApp.getAcc.call(accounts[0]);
            console.log("Name:", name);
            console.log("Content:", content);
            console.log("Acc type:", type);
            agencyApp.updataAccContent("new content", true, {from: accounts[0]});
            let {0: _name, 1: new_content, 2: _type} = await agencyApp.getAcc(accounts[0]);
            console.log("Name:", _name);
            console.log("Content:", new_content);
            console.log("Acc type:", _type);
            await agencyApp.updateApplicantStatus(1, {from: accounts[0]});
            let applicantNum = await agencyApp.getApplicantsNum.call();
            console.log("Total number: ", applicantNum);
            let addr1 = await agencyApp.getApplicantAddr.call(applicantNum-1);
            let {0: name1, 1: content1, 2: type1} = await agencyApp.getAcc.call(addr1);
            let status1 = await agencyApp.getApplicantStatus.call(addr1);
            console.log("Name:", name1);
            console.log("Content:", content1);
            console.log("Acc type:", type1);
            console.log("Status:", status1);
    });  

    it("Company Account Test",  async () => {  
        const agencyApp = await AgencyApp.deployed();  
        await agencyApp.addAcc("Company1", false, {from: accounts[1]});
        await agencyApp.updataAccContent("new content", false, {from: accounts[1]});
        let {0: name, 1: content, 2: type} = await agencyApp.getAcc.call(accounts[1]);
        console.log("Name:", name);
        console.log("Content:", content);
        console.log("Acc type:", type);
        let companyNum = await agencyApp.getCompanyNum.call();
        console.log("Total number: ", companyNum);
        let addr1 = await agencyApp.getCompanyAddr.call(companyNum-1);
        console.log("Addr: ", addr1);
        await agencyApp.AddCompanyJob(
            "First job", "I don't care.",  5, {from: accounts[1]}
        );
        let jobNum = await agencyApp.getCompanyJobNum.call(accounts[1]);
        let {0: title0, 1: description0, 2: number0, 3: remain0, 4: status0} = 
            await agencyApp.getJobContent.call(addr1, jobNum-1);
        console.log("Job:", title0);
        console.log("Description:", description0);
        console.log("Number/Remain:", number0, "/", remain0);
        console.log("Status:", status0);
        await agencyApp.ChangeJobStatus(jobNum-1, 1, {from: accounts[1]});
        await agencyApp.UpdateJob(jobNum-1, "Not First job", "I do care.", 3, {from: accounts[1]});
        let {0: title1, 1: description1, 2: number1, 3: remain1, 4: status1} = 
            await agencyApp.getJobContent.call(addr1, jobNum-1);
        console.log("Job:", title1);
        console.log("Description:", description1);
        console.log("Number/Remain:", number1, "/", remain1);
        console.log("Status:", status1);

    });  
});  


