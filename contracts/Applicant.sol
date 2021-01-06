pragma solidity ^0.5.0;
import "./EventHelper.sol";

contract ApplicantApp is EventHelper {


    enum AppStatus {
        Open,
        Close,
        Last
    }

    struct Applicant {
        string Name;
        string Resume;
        uint16 Status;

        uint   idx;
        bool   isValid;
        uint[] invitations;
        uint[] offers;
    }

    mapping(address => Applicant) applicants;
    address[] applicantAddrs;

    // Modifier
    modifier APPAccout(address _addr) {
        // require(isApplicant(_addr), "Address not registered as Applicant.");
        require(isApplicant(_addr));
        _;
    }

    function isApplicant(address _addr) public view returns(bool) {
        return (applicants[_addr].isValid);
    }

    // Action 
    function addAPPAcc(string memory _name) internal {
        applicants[msg.sender].Name    = _name;
        applicants[msg.sender].Status  = uint16(AppStatus.Close);
        applicants[msg.sender].isValid = true;
        applicants[msg.sender].idx     = applicantAddrs.push(msg.sender)-1;
        emit OnAccountAdd(msg.sender, "Applicant");
    }

    function updateAPPAcc(string memory _content) internal 
    APPAccout(msg.sender) {
        Applicant storage _applicant = applicants[msg.sender];
        _applicant.Resume = _content;
        emit OnAccountUpdate(msg.sender, "Applicant");
    }

    function updateApplicantStatus(uint _newStatus) public 
    APPAccout(msg.sender) ValidStatus(uint(AppStatus.Last), _newStatus) {
        Applicant storage _applicant = applicants[msg.sender];
        _applicant.Status = uint16(_newStatus);
        emit OnApplicantStatusChange(msg.sender, _applicant.Status);
    }

    // View
    function getApplicantsNum() public view returns (uint _len) {
        return applicantAddrs.length;
    }

    function getApplicantAddr(uint _idx) public view 
    ValidIdx(applicantAddrs.length, _idx) returns (address _addr) {
        return applicantAddrs[_idx];
    }

    function getAPPAcc(address _addr) internal view 
    APPAccout(_addr) returns(string memory _name, string memory _content) {
        Applicant storage _applicant = applicants[_addr];
        return (_applicant.Name, _applicant.Resume);
    }

    function getApplicantStatus(address _addr) public view 
    APPAccout(_addr) returns(uint _status) {
        Applicant storage _applicant = applicants[_addr];
        return uint(_applicant.Status);
    }

    //// Invitation
    function getApplincantInvNum(address _addr) public view 
    APPAccout(_addr) returns(uint _num) {
        Applicant storage _applicant = applicants[_addr];
        return _applicant.invitations.length;
    }

    function getApplincantInvIdx(address _addr, uint _invPos) public view 
    APPAccout(_addr) returns(uint _invIdx) {
        Applicant storage _applicant = applicants[_addr];
        // require(isValidIdx(_applicant.invitations.length, _invPos), "Applicant invitation idx not valid!");
        require(isValidIdx(_applicant.invitations.length, _invPos));
        return _applicant.invitations[_invPos];
    }

    //// Offer
    function getApplincantOffNum(address _addr) public view 
    APPAccout(_addr) returns(uint _num) {
        Applicant storage _applicant = applicants[_addr];
        return _applicant.offers.length;
    }

    function getApplincantOffIdx(address _addr, uint _offPos) public view 
    APPAccout(_addr) returns(uint _offIdx) {
        Applicant storage _applicant = applicants[_addr];
        // require(isValidIdx(_applicant.offers.length, _offPos), "Applicant offer idx not valid!");
        require(isValidIdx(_applicant.offers.length, _offPos));
        return _applicant.offers[_offPos];
    }
}