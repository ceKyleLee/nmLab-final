pragma solidity ^0.5.0;
import "./EventHelper.sol";

contract ApplicantApp is EventHelper {


    enum appStatus {
        open,
        close
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
        applicants[msg.sender].status  = uint16(appStatus.close);
        applicants[msg.sender].idx     = applicantAddrs.push(msg.sender)-1;
        emit OnAccountAdd(msg.sender, "Applicant");
    }

    function getApplicantAcc(address _userAddr) internal view isValidApplicant(_userAddr)
    returns(string memory _name, string memory _content, bool _type) {
        Applicant storage acc = applicants[_userAddr];
        return (acc.name, acc.resume, true);
    }

    function updateApplicantAcc(string memory _content) internal isValidApplicant(msg.sender) {
        Applicant storage acc = applicants[msg.sender];
        acc.resume = _content;
        emit OnAccountUpdate(msg.sender, "Applicant");
    }

}