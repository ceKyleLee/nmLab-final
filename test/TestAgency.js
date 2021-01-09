const AgencyApp = artifacts.require("./AgencyApp.sol");

contract("AgencyApp", accounts => {  
    it("Applicant Account Test", async () => {  
            console.log("\n...Applicant test...\n");
            const agencyApp = await AgencyApp.deployed();  
            // Register Accout
            var isValid = await agencyApp.isRegistered.call(accounts[0]);  
            console.log("Before register... ", isValid);
            agencyApp.addAcc("Applicant1", true, {from: accounts[0]});
            isValid = await agencyApp.isRegistered.call(accounts[0]);  
            console.log("After register... ", isValid);

            // Update and retrieve account info
            var content = await agencyApp.getAddrInfo.call(accounts[0]);
            var status = await agencyApp.getApplicantStatus.call(accounts[0]);
            console.log("Content: ", content);
            console.log("Status:", status);
            await agencyApp.updataAccContent("new content", true, {from: accounts[0]});
            await agencyApp.updateApplicantStatus(0, {from: accounts[0]});
            status = await agencyApp.getApplicantStatus.call(accounts[0]);
            content = await agencyApp.getAddrInfo(accounts[0]);
            console.log("===After update===");
            console.log("Content: ", content);
            console.log("Status:", status);


            // Retrieve applicant address
            var applicantNum = await agencyApp.getApplicantsNum.call();
            console.log("Total applicant number: ", applicantNum);
            var addr1 = await agencyApp.getApplicantAddr.call(applicantNum-1);
            console.log("From ganache:  ", accounts[0]);
            console.log("From contract: ", addr1);
    });  

    it("Company Account Test",  async () => {  
        console.log("\n...Company test...\n");
        const agencyApp = await AgencyApp.deployed();  
        
        // Register Accout
        await agencyApp.addAcc("Company1", false, {from: accounts[1]});
        await agencyApp.updataAccContent("new content", false, {from: accounts[1]});
        var content = await agencyApp.getAddrInfo.call(accounts[1]);
        console.log("Content:", content);

        // Retrieve Company address
        var companyNum = await agencyApp.getCompanyNum.call();
        console.log("Total company number: ", companyNum);
        var addr = await agencyApp.getCompanyAddr.call(companyNum-1);
        console.log("From ganache:  ", accounts[1]);
        console.log("From contract: ", addr);


        // Add job
        await agencyApp.AddJob(
            "First job", "I don't care.", 5, {from: accounts[1]}
        );
        var jobNum = await agencyApp.getCompanyJobNum.call(accounts[1]);
        content = await agencyApp.getJobContent.call(addr, jobNum-1);
        console.log("Job Content:", content);

        // Update Job
        console.log("===After update===");
        // await agencyApp.updateJobStatus(jobNum-1, 1, {from: accounts[1]});
        await agencyApp.updateJob(jobNum-1, "Not First job", "I do care.", 3, {from: accounts[1]});
        content = await agencyApp.getJobContent.call(addr, jobNum-1);
        console.log("Job Num:", jobNum);
        console.log("Job Content:", content);
    });  

    it("Invitation test",  async () => {  
        console.log("\n...Invitation test...\n");
        const agencyApp = await AgencyApp.deployed();  
        var applicantAddr = accounts[0];
        var companyAddr = accounts[1];
        var jobIdx = await agencyApp.getCompanyJobNum.call(companyAddr)-1;

        // Send Invitation
        await agencyApp.sendInvitation(
            applicantAddr, jobIdx, "First invitation.", false,
            {from: companyAddr}
        );

        // Check inv info from job and applicant
        var jobInvNum = await agencyApp.getJobInvNum.call(companyAddr, jobIdx);
        var jobInvIdx = await agencyApp.getJobInvIdx.call(companyAddr, jobIdx, jobInvNum-1);
        var appInvNum = await agencyApp.getApplincantInvNum.call(applicantAddr);
        var appInvIdx = await agencyApp.getApplincantInvIdx.call(applicantAddr, appInvNum-1);
        console.log("Job inv idx: ", jobInvIdx);
        console.log("App inv idx: ", appInvIdx);

        // Retrieve invitation info
        var content = await agencyApp.getInvitationInfo.call(jobInvIdx);
        console.log("Invitation content: ", content);

        // Exist invitation test
        // await agencyApp.sendInvitation(
        //     companyAddr, jobIdx, "Second invitation.", true,
        //     {from: applicantAddr}
        // );
        // await agencyApp.sendInvitation(
        //     applicantAddr, jobIdx, "First invitation.", false,
        //     {from: companyAddr}
        // );


        // Expiration Test
        function timeout(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        await timeout(1000);
        await agencyApp.updateInvitationStatus(jobInvIdx, 1, {from: applicantAddr});
        var content = await agencyApp.getInvitationInfo.call(jobInvIdx);
        console.log("Invitation content: ", content);

        // Lock invitation Test
        // await agencyApp.updateInvitationStatus(jobInvIdx, 2, {from: applicantAddr});
        // var content = await agencyApp.getInvitationInfo.call(jobInvIdx);
        // console.log("Invitation content: ", content);

        // New invitation Test
        await agencyApp.sendInvitation(
            companyAddr, jobIdx, "Second invitation.", true,
            {from: applicantAddr}
        );
        jobInvNum = await agencyApp.getJobInvNum.call(companyAddr, jobIdx);
        jobInvIdx = await agencyApp.getJobInvIdx.call(companyAddr, jobIdx, jobInvNum-1);
        console.log("Job inv idx: ", jobInvIdx);
        content = await agencyApp.getInvitationInfo.call(jobInvIdx);
        console.log("Invitation content: ", content);
    });  

    it("Offer Test", async () => {  
        console.log("\n...Offer test...\n");
        const agencyApp = await AgencyApp.deployed();  
        var applicantAddr = accounts[0];
        var companyAddr = accounts[1];
        var jobIdx = await agencyApp.getCompanyJobNum.call(companyAddr)-1;

        // Send Offer
        await agencyApp.sendOffer(
            applicantAddr, jobIdx, 1000, "First offer.", 
            {from: companyAddr}
        );

        // Check inv info from job and applicant
        var jobOffNum = await agencyApp.getJobOffNum.call(companyAddr, jobIdx);
        var jobOffIdx = await agencyApp.getJobOffIdx.call(companyAddr, jobIdx, jobOffNum-1);
        var appOffNum = await agencyApp.getApplincantOffNum.call(applicantAddr);
        var appOffIdx = await agencyApp.getApplincantOffIdx.call(applicantAddr, appOffNum-1);
        console.log("Job offer idx: ", jobOffIdx);
        console.log("App offer idx: ", appOffIdx);

        // Retrieve offer info
        var content = await agencyApp.getOfferInfo.call(jobOffIdx);
        console.log("Offer Content: ", content);

        // Exist offer Test
        // await agencyApp.sendOffer(
            // applicantAddr, jobIdx, 2000, "Second offer.", 
            // {from: companyAddr}
        // );
        // jobOffNum = await agencyApp.getJobInvNum.call(companyAddr, jobIdx);
        // jobOffIdx = await agencyApp.getJobInvIdx.call(companyAddr, jobIdx, jobOffNum-1);
        // console.log("Job offer idx: ", jobOffIdx);
        // content = await agencyApp.getOfferInfo.call(jobOffIdx);
        // console.log("Offer Content: ", content);
        
        // Cool down Test
        function timeout(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        // await timeout(3000);
        await agencyApp.updateOfferPayment(jobOffIdx, 4000, {from: companyAddr});

        content = await agencyApp.getOfferInfo.call(jobOffIdx);
        console.log("Offer Content: ", content);

        // Second company offer
        var company2Addr = accounts[2];
        await agencyApp.addAcc("Company2", false, {from: company2Addr});
        await agencyApp.AddJob(
            "Second job", "I don't care.", 5, {from: company2Addr}
        );
        var job2Idx = await agencyApp.getCompanyJobNum.call(company2Addr)-1;
        await agencyApp.sendOffer(
            applicantAddr, job2Idx, 2000, "Second offer.", 
            {from: company2Addr}
        );
        var job2OffNum = await agencyApp.getJobOffNum.call(company2Addr, job2Idx);
        var job2OffIdx = await agencyApp.getJobOffIdx.call(company2Addr, job2Idx, job2OffNum-1);


        // Applicant update status
        await agencyApp.updateOfferStatus(jobOffIdx, 2, {from: applicantAddr});
        content = await agencyApp.getOfferInfo.call(jobOffIdx);
        console.log("Offer Content: ", content);
        await agencyApp.updateOfferPayment(jobOffIdx, 3000, {from: companyAddr});
        await agencyApp.updateOfferStatus(jobOffIdx, 1, {from: applicantAddr});
        content = await agencyApp.getJobContent.call(companyAddr, jobIdx);
        console.log("First Job content: ", content);
        content = await agencyApp.getJobContent.call(company2Addr, job2Idx);
        console.log("Second Job content: ", content);
        content = await agencyApp.getOfferInfo.call(jobOffIdx);
        console.log("First offer content: ", content);
        content = await agencyApp.getOfferInfo.call(job2OffIdx);
        console.log("Second offer content: ", content);

        // Close offer Test
        // await agencyApp.updateOfferPayment(jobOff2Idx, 3000,  {from: company2Addr});

    
    });  

});  


