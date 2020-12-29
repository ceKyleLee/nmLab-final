pragma solidity ^0.5.0;

contract EventHelper {
    event OnAccountAdd(address userAddr, string userType);
    event OnAccountUpdate(address userAddr, string userType);
    event OnApplicantStatusChange(address userAddr, uint16 newStatus);

    event OnJobAdd(address userAddr, uint jobIdx);
    event OnJobUpdate(address userAddr, uint jobIdx);
    event OnJobStatusChange(address userAddr, uint jobIdx, uint16 newStatus);

    event OnInvitationAdd(address applicant, address company, uint jobIdx, bool direction);
    event OnInvitationUpdate(address applicant, address company, uint jobIdx, bool direction, uint16 status);

    event OnOfferAdd(address applicant, address company, uint jobIdx, uint payment);
    event OnOfferUpdate(address applicant, address company, uint jobIdx, uint payment, uint16 status);


    function checkMsgsender() public view returns(address){
        return msg.sender;
    }
}