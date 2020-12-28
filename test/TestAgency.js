const AgencyApp = artifacts.require("./AgencyApp.sol");
// AgencyApp.events.OnAccountAdd().on("data", function(event) {
    // console.log("Event", event.returnValues.userAddr);
// }).on("error", console.error);

contract("AgencyApp", accounts => {  
        it("Applicant Account Test", async () => {  
            console.log("\nApplicant test...\n");
            const agencyApp = await AgencyApp.deployed();  
            
            let isValid = await agencyApp.isAccount.call(accounts[0]);  
            console.log("Before register... ", isValid);
            agencyApp.addAcc("test", true, {from: accounts[0]});

            let isValid_after = await agencyApp.isAccount.call(accounts[0]);  
            console.log("After register... ", isValid_after);
            let {0: name, 1: content, 2: type} = await agencyApp.getAddrInfo.call(accounts[0]);
            console.log("Name:", name);
            console.log("Content:", content);
            console.log("Acc type:", type);
            agencyApp.updataAccContent("new content", true, {from: accounts[0]});
            let {0: _name, 1: new_content, 2: _type} = await agencyApp.getAddrInfo(accounts[0]);
            console.log("Name:", _name);
            console.log("Content:", new_content);
            console.log("Acc type:", _type);
            await agencyApp.updateApplicantStatus(1, {from: accounts[0]});
            let applicantNum = await agencyApp.getApplicantsNum.call();
            console.log("Total number: ", applicantNum);
            let addr1 = await agencyApp.getApplicantAddr.call(applicantNum-1);
            let {0: name1, 1: content1, 2: type1} = await agencyApp.getAddrInfo.call(addr1);
            let status1 = await agencyApp.getApplicantStatus.call(addr1);
            console.log("Name:", name1);
            console.log("Content:", content1);
            console.log("Acc type:", type1);
            console.log("Status:", status1);
    });  

    it("Company Account Test",  async () => {  
        console.log("\nCompany test...\n");
        const agencyApp = await AgencyApp.deployed();  
        await agencyApp.addAcc("Company1", false, {from: accounts[1]});
        await agencyApp.updataAccContent("new content", false, {from: accounts[1]});
        let {0: name, 1: content, 2: type} = await agencyApp.getAddrInfo.call(accounts[1]);
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
        await agencyApp.updateJobStatus(jobNum-1, 1, {from: accounts[1]});
        await agencyApp.UpdateJob(jobNum-1, "Not First job", "I do care.", 3, {from: accounts[1]});
        let {0: title1, 1: description1, 2: number1, 3: remain1, 4: status1} = 
            await agencyApp.getJobContent.call(addr1, jobNum-1);
        console.log("Job:", title1);
        console.log("Description:", description1);
        console.log("Number/Remain:", number1, "/", remain1);
        console.log("Status:", status1);

    });  

    it("Invitation test",  async () => {  
        console.log("\nInvitation test...\n");
        const agencyApp = await AgencyApp.deployed();  
        let applicantAddr = accounts[0];
        let companyAddr = accounts[1];
        let jobIdx = await agencyApp.getCompanyJobNum.call(companyAddr)-1;
        await agencyApp.sendInvitation(
            applicantAddr, jobIdx, "First invitation.", false,
            {from: companyAddr}
        );

        let jobInvNum = await agencyApp.getJobInvNum.call(companyAddr, jobIdx);
        let jobInvIdx = await agencyApp.getJobInvIdx.call(companyAddr, jobIdx, jobInvNum-1);
        let appInvNum = await agencyApp.getApplincantInvNum.call(applicantAddr);
        let appInvIdx = await agencyApp.getApplincantInvIdx.call(applicantAddr, appInvNum-1);
        console.log("Job inv num: ", jobInvNum, " idx: ", jobInvIdx);
        console.log("App inv num: ", appInvNum, " idx: ", appInvIdx);

        let {0: invApp, 1: invCom, 2: invJob, 3: invMsg, 4: invDir, 5:invStatus, 6: invTime} = 
            await agencyApp.getInvitationInfo.call(jobInvIdx);
            console.log("Applicant:", invApp);
            console.log("Company:", invCom);
            console.log("JobIdx:", invJob);
            console.log("Message:", invMsg);
            console.log("Direction:", invDir);
            console.log("Status:", invStatus);
            console.log("Timestamp:", invTime);

        function timeout(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        await timeout(1000);
        await agencyApp.updateInvitationStatus(jobInvIdx, 1, {from: applicantAddr});
        let {0: invApp1, 1: invCom1, 2: invJob1, 3: invMsg1, 4: invDir1, 5:invStatus1, 6: invTime1} = 
            await agencyApp.getInvitationInfo.call(jobInvIdx);
            console.log("Applicant:", invApp1);
            console.log("Company:", invCom1);
            console.log("JobIdx:", invJob1);
            console.log("Message:", invMsg1);
            console.log("Direction:", invDir1);
            console.log("Status:", invStatus1);
            console.log("Timestamp:", invTime1);
    });  
});  


