pragma solidity ^0.5.0;
import "./EventHelper.sol";

contract ApplicantApp is EventHelper {


    enum AppStatus {
        open,
        close,
        Last
    }

    struct Applicant {
        string name;
        string resume;
        uint16 status;
        uint   idx;
        bool   isValid;
    }

    mapping(address => Applicant) applicants;
    address[] applicantAddrs;

    // Modifier
    modifier isValidApplicant(address addr) {
        require(isApplicant(addr), "Address must be registered as Applicant.");
        _;
    }

    function isApplicant(address addr) public view returns(bool) {
        return (applicants[addr].isValid);
    }


    function addApplicantAcc(string memory _name) internal {
        applicants[msg.sender].name    = _name;
        applicants[msg.sender].isValid = true;
        applicants[msg.sender].status  = uint16(AppStatus.close);
        applicants[msg.sender].idx     = applicantAddrs.push(msg.sender)-1;
        emit OnAccountAdd(msg.sender, "Applicant");
    }

    function getApplicantAcc(address _userAddr) internal view isValidApplicant(_userAddr)
    returns(string memory _name, string memory _content, uint _status) {
        Applicant storage acc = applicants[_userAddr];
        return (acc.name, acc.resume, uint(acc.status));
    }

    function getApplicantStatus(address _userAddr) public view isValidApplicant(_userAddr)
    returns(uint _status) {
        Applicant storage acc = applicants[_userAddr];
        return uint(acc.status);
    }

    function updateApplicantAcc(string memory _content) internal isValidApplicant(msg.sender) {
        Applicant storage acc = applicants[msg.sender];
        acc.resume = _content;
        emit OnAccountUpdate(msg.sender, "Applicant");
    }


    // Action 

    // Currently solidity only support return of array if you use pragma experimental ABIEncoderV2. 
    // If you dont want to use that, you have to create one more function that will return the lenght
    // of the array and in the Dapp creates a for loop and access the element of array through index. 
    function getApplicantsNum() public view returns (uint _len) {
        return applicantAddrs.length;
    }

    function getApplicantAddr(uint _idx) public view returns (address _userAddr) {
        return applicantAddrs[_idx];
    }

    function updateApplicantStatus(uint _newStatus) public isValidApplicant(msg.sender) {
        require( _newStatus < uint(AppStatus.Last), "New status is not valid" );
        Applicant storage acc = applicants[msg.sender];
        acc.status = uint16(_newStatus);
        emit OnApplicantStatusChange(msg.sender, acc.status);
    }

}