pragma solidity ^0.5.0;
import "./Applicant.sol";
import "./Company.sol";

contract AgencyApp is ApplicantApp, CompanyApp  {


    // Struct
    enum interStatus{
        wait,
        accept,
        reject,
        Last
    }
    uint256 constant deadline = 14 days;
    struct Invitation {
        address applicant;
        address company;
        uint jobIdx;
        string message;
        bool direction; // true: from applicant, false: from company
        uint16 status;

        uint idx;
        uint256 timestamp;
    }

    Invitation[] invitations;

    // Modifier
    modifier isValid(address addr) {
        require(isAccount(addr), "Address must be registered.");
        _;
    }

    function isAccount(address addr) public view returns(bool) {
        return (isApplicant(addr) || isCompany(addr));
    }

    modifier modifiableInv(uint invIdx, address addr) {
        Invitation storage inv = invitations[invIdx];
        require((inv.status == uint16(interStatus.wait)), "This invitation has been lock!");
        if (inv.direction) { // From applicant
            require(inv.company == addr, "Only company can update this invitation!");
        } else { // From company
            require(inv.applicant == addr, "Only applicant can update this invitation!");
        }
        _;
    }

    function existActiveInv(address _applicant, address _company, uint _jobIdx ) 
    public view isValidApplicant(_applicant) isValidCompany(_company) returns(bool){
        Company storage acc = companies[_company];
        require(_jobIdx < acc.joblist.length, "Job idx not valid!");
        Job storage job = acc.joblist[_jobIdx];
        address invApp;
        uint16  invStatus;
        uint256 invTime;
        for(uint i=0;i < job.invitations.length;i++){
            Invitation storage inv = invitations[job.invitations[i]];
            invApp = inv.applicant;
            invStatus = inv.status;
            invTime = inv.timestamp;
            if (invApp== _applicant && 
                invStatus== uint16(interStatus.wait) && 
                invTime+deadline <= now ) {
                    return true;
            }
        }
        return false;
    }


    // Account
    // Action
    function addAcc(string memory _name, bool _type) public {
        require(!isAccount(msg.sender), "Address should not be registered.");
        if (_type) { // Applicant
            addApplicantAcc(_name);
        }
        else { // Company
            addCompanyAcc(_name);
        }
    }

    function updataAccContent(string memory _content, bool _type) public isValid(msg.sender) {
        if (_type) { // Applicant
            updateApplicantAcc(_content);
        } else { // Company
            updateCompanyAcc(_content);
        }
    }

    // View
    function getAddrInfo(address _userAddr) public view isValid(_userAddr)
    returns(string memory _name, string memory _content, bool _type) {
        string memory name;
        string memory content;
        if (isApplicant(_userAddr)) { // Applicant
            (name, content, ) = getApplicantAcc(_userAddr);
            return (name, content, true);
        } else { // Company
            (name, content) = getCompanyAcc(_userAddr);
            return (name, content, false);
        }
    } 
    


    // Invitation
    // Action
    function sendInvitation(address _tarAddr, uint _jobIdx, string memory _msg, bool _dir) public {
        address _companyAddr;
        address _applicantAddr;
        if (_dir) { // From Applicant
            _companyAddr = _tarAddr;
            _applicantAddr = msg.sender;
        } else { // From company
            _companyAddr = msg.sender;
            _applicantAddr = _tarAddr;
        }
        require(!existActiveInv(_applicantAddr, _companyAddr, _jobIdx), "Exist active invitation!");

        Invitation memory new_inv = Invitation({
            applicant: _applicantAddr,
            company: _companyAddr,
            jobIdx: _jobIdx,
            message: _msg,
            direction: _dir,
            status: uint16(interStatus.wait),
            idx: 0,
            timestamp: now
        });
        new_inv.idx = invitations.push(new_inv)-1;

        Job storage _job = companies[_companyAddr].joblist[_jobIdx];
        _job.invitations.push(new_inv.idx);

        Applicant storage _applicant = applicants[_applicantAddr];
        _applicant.invitations.push(new_inv.idx);

        emit OnInvitationAdd(_applicantAddr, _companyAddr, _jobIdx, _dir);
    }

    function updateInvitationStatus(uint _invIdx, uint _newStatus) public modifiableInv(_invIdx, msg.sender) {
        require( _newStatus < uint(interStatus.Last), "New status is not valid!" );
        Invitation storage inv = invitations[_invIdx];
        require( inv.timestamp+deadline >= now, "Invitation expired!");
        inv.status = uint16(_newStatus);
        
        emit OnInvitationUpdate(inv.applicant, inv.company, inv.jobIdx, inv.direction, inv.status);
    }

    // View
    function getInvitationInfo(uint _invIdx) public view 
    returns (address _applicants, address _company, uint _jobIdx, 
    string memory _msg, bool _dir, uint _status, uint256 _timestamp) {
        Invitation storage inv = invitations[_invIdx];
        return (inv.applicant, inv.company, inv.jobIdx, inv.message, inv.direction, uint(inv.status), inv.timestamp);
    }


}