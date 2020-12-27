pragma solidity ^0.5.0;
import "./EventHelper.sol";

contract CompanyApp is EventHelper {

    enum JobStatus {
        open,
        close,
        Last
    }

    struct Job {
        string title;
        string description;
        uint number;
        uint remain;
        uint16 status;

        uint   idx;
    }

    struct Company {
        string name;
        string intro;
        uint   idx;
        Job[]  joblist;
        bool   isValid;
    }

    mapping( address => Company ) companies;
    address[] companyAddrs;

    // Modifier
    modifier isValidCompany(address addr) {
        require(isCompany(addr), "Address must be registered as Company.");
        _;
    }

    function isCompany(address addr) public view returns(bool) {
        return (companies[addr].isValid);
    }

    // Company
    // Action
    function addCompanyAcc(string memory _name) internal {
        companies[msg.sender].name = _name;
        companies[msg.sender].isValid = true;
        companies[msg.sender].idx = companyAddrs.push(msg.sender)-1;
        emit OnAccountAdd(msg.sender, "Company");
    }

    function updateCompanyAcc(string memory _content) internal isValidCompany(msg.sender) {
        Company storage acc = companies[msg.sender];
        acc.intro = _content;
        emit OnAccountUpdate(msg.sender, "Company");
    }

    // View

    // Currently solidity only support return of array if you use pragma experimental ABIEncoderV2. 
    // If you dont want to use that, you have to create one more function that will return the lenght
    // of the array and in the Dapp creates a for loop and access the element of array through index. 
    function getCompanyNum() public view returns (uint _len) {
        return companyAddrs.length;
    }

    function getCompanyAddr(uint _idx) public view returns (address _userAcc) {
        return companyAddrs[_idx];
    }

    function getCompanyAcc(address _userAddr) internal view isValidCompany(_userAddr)
    returns(string memory _name, string memory _content) {
        Company storage acc = companies[_userAddr];
        return (acc.name, acc.intro);
    }

    // Job
    // Action
    function AddCompanyJob(string memory _title, string memory _description, uint _num) public isValidCompany(msg.sender) {
        Company storage acc = companies[msg.sender];
        Job memory newJob = Job({
            title:_title, 
            description: _description, 
            number: _num, 
            remain: _num, 
            status: uint16(JobStatus.open), 
            idx: 0
        });
        newJob.idx = acc.joblist.push(newJob)-1;
        emit OnJobAdd(msg.sender, newJob.idx);
    }

    function UpdateJob(uint _jobIdx, string memory _title, string memory _description, uint _num) public isValidCompany(msg.sender) {
        Company storage acc = companies[msg.sender];
        require(_jobIdx < acc.joblist.length, "Job idx not valid!");
        Job storage job = acc.joblist[_jobIdx];
        job.title = _title;
        job.description = _description;
        job.number = _num;
        if (_num < job.remain) { job.remain = _num; }
        emit OnJobUpdate(msg.sender, job.idx);
    }

    function ChangeJobStatus(uint _jobIdx, uint _newStatus) public isValidCompany(msg.sender) {
        require( _newStatus < uint(JobStatus.Last), "New status is not valid!" );

        Company storage acc = companies[msg.sender];
        require(_jobIdx < acc.joblist.length, "Job idx not valid!");

        Job storage job = acc.joblist[_jobIdx];
        job.status = uint16(_newStatus);
        emit OnJobStatusChange(msg.sender, job.idx, job.status);
    }

    // View
    function getCompanyJobNum(address _userAddr) public view isValidCompany(_userAddr) returns(uint _len) {
        Company storage acc = companies[_userAddr];
        return acc.joblist.length;
    }

    function getJobContent(address _userAddr, uint _jobIdx) public view 
    returns (string memory _title, string memory _description, 
    uint _num, uint _remain, uint _status) {
        Company storage acc = companies[_userAddr];
        require(_jobIdx < acc.joblist.length, "Job idx not valid!");

        Job storage job = acc.joblist[_jobIdx];
        return ( job.title,job.description,job.number,job.remain, uint(job.status));
    }

}