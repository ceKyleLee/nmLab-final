pragma solidity ^0.5.0;
import "./EventHelper.sol";

contract CompanyApp is EventHelper {

    enum JobStatus {
        Open,
        Close,
        Last
    }

    struct Job {
        string Title;
        string Descri;
        uint   Number;
        address[] Employee;
        uint16 Status;

        uint   idx;
        uint[] invitations;
        uint[] offers;
    }

    struct Company {
        string Name;
        string Intro;
        Job[]  JobList;

        bool   isValid;
        uint   idx;
    }

    mapping( address => Company ) companies;
    address[] companyAddrs;

    // Modifier
    modifier COMAccout(address _addr) {
        // require(isCompany(_addr), "Address not registered as Company.");
        require(isCompany(_addr));
        _;
    }

    function isCompany(address _addr) public view returns(bool) {
        return (companies[_addr].isValid);
    }

    // Company
    // Action
    function addCOMAcc(string memory _name) internal {
        companies[msg.sender].Name    = _name;
        companies[msg.sender].isValid = true;
        companies[msg.sender].idx     = companyAddrs.push(msg.sender)-1;
        emit OnAccountAdd(msg.sender, "Company");
    }

    function updateCOMAcc(string memory _content) internal COMAccout(msg.sender) {
        Company storage acc = companies[msg.sender];
        acc.Intro = _content;
        emit OnAccountUpdate(msg.sender, "Company");
    }

    // View

    // Currently solidity only support return of array if you use pragma experimental ABIEncoderV2. 
    // If you dont want to use that, you have to create one more function that will return the lenght
    // of the array and in the Dapp creates a for loop and access the element of array through index. 
    function getCompanyNum() public view returns (uint _len) {
        return companyAddrs.length;
    }

    function getCompanyAddr(uint _idx) public view 
    ValidIdx(companyAddrs.length, _idx) returns (address _addr) {
        return companyAddrs[_idx];
    }

    function getCOMAcc(address _addr) internal view COMAccout(_addr)
    returns(string memory _name, string memory _content) {
        return (companies[_addr].Name, companies[_addr].Intro);
    }

    // Job
    // Action
    function AddJob(string memory _title, string memory _description, uint _num) public 
    COMAccout(msg.sender) {
        Company storage acc = companies[msg.sender];
        Job memory newJob;
        
        newJob.Title  = _title;
        newJob.Descri = _description;
        newJob.Number = _num;
        newJob.Status = uint16(JobStatus.Open);

        newJob.idx = acc.JobList.push(newJob)-1;
        emit OnJobAdd(msg.sender, newJob.idx);
    }

    function updateJob(uint _jobIdx, string memory _title, string memory _description, uint _num) public 
    COMAccout(msg.sender) {
        Job storage _job = getJob(msg.sender, _jobIdx);
        // require( _num >= _job.Employee.length, "Number is less then num of employee!");
        require( _num >= _job.Employee.length);
        _job.Title = _title;
        _job.Descri = _description;
        _job.Number = _num;
        emit OnJobUpdate(msg.sender, _job.idx);
    }

    function updateJobStatus(uint _jobIdx, uint _newStatus) public 
    COMAccout(msg.sender) ValidStatus(uint(JobStatus.Last), _newStatus) {
        Job storage _job = getJob(msg.sender, _jobIdx);
        _job.Status = uint16(_newStatus);
        emit OnJobStatusChange(msg.sender, _job.idx, _job.Status);
    }

    function deleteEmployee(uint _jobIdx, uint _addrIdx) public {
        Job storage _job = getJob(msg.sender, _jobIdx);
        // require(_job.Employee.length > _addrIdx, "Idx not valid!");
        require(_job.Employee.length > _addrIdx);
        _job.Employee[_addrIdx] = _job.Employee[_job.Employee.length - 1];
        delete _job.Employee[_job.Employee.length - 1];
        _job.Employee.length--;
    }

    // View
    function getCompanyJobNum(address _addr) public view 
    COMAccout(_addr) returns(uint _len) {
        Company storage _company = companies[_addr];
        return _company.JobList.length;
    }

    function getJobContent(address _addr, uint _jobIdx) public view 
    COMAccout(_addr) returns ( string memory _title, string memory _descri, 
                                    uint _number, uint _remain, uint _status ) 
    {
        Job storage _job = getJob(_addr, _jobIdx);
        return (_job.Title, _job.Descri, _job.Number, 
                _job.Number - _job.Employee.length, uint(_job.Status));
    }

    //// Invitation
    function getJobInvNum(address _addr, uint _jobIdx) public view 
    COMAccout(_addr) returns(uint _num) {
        Job storage _job = getJob(_addr, _jobIdx);
        return _job.invitations.length;
    }

    function getJobInvIdx(address _addr, uint _jobIdx, uint _invPos) public view 
    COMAccout(_addr) returns(uint _invIdx) {
        Job storage _job = getJob(_addr, _jobIdx);
        // require(isValidIdx(_job.invitations.length, _invPos), "Job invitation idx not valid!");
        require(isValidIdx(_job.invitations.length, _invPos));
        return _job.invitations[_invPos];
    }

    //// Offer
    function getJobOffNum(address _addr, uint _jobIdx) public view 
    COMAccout(_addr) returns(uint _num) {
        Job storage _job = getJob(_addr, _jobIdx);
        return _job.offers.length;
    }

    function getJobOffIdx(address _addr, uint _jobIdx, uint _offPos) public view 
    COMAccout(_addr) returns(uint _offIdx) {
        Job storage _job = getJob(_addr, _jobIdx);
        // require(isValidIdx(_job.offers.length, _offPos), "Job offer idx not valid!");
        require(isValidIdx(_job.offers.length, _offPos));
        return _job.offers[_offPos];
    }

    // Helper 
    function getJob(address _addr, uint _jobIdx) internal view 
    COMAccout(_addr) returns(Job storage) {
        // require(isValidIdx(companies[_addr].JobList.length, _jobIdx), "Job idx not valid!");
        require(isValidIdx(companies[_addr].JobList.length, _jobIdx));
        return companies[_addr].JobList[_jobIdx];
    }

    function getJobRemain(address _addr, uint _jobIdx) public view
    returns (uint) {
        Job storage _job = getJob(_addr, _jobIdx);
        return _job.Number - _job.Employee.length;
    }
}