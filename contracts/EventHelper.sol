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

    // Modifier 
    modifier ValidIdx(uint _len, uint _idx) {
        // require(isValidIdx(_len, _idx), "Not valid index!");
        require(isValidIdx(_len, _idx));
        _;
    }

    modifier ValidStatus(uint _last, uint _status) {
        // require(isValidStatus(_last, _status), "Not valid status!");
        require(isValidStatus(_last, _status));
        _;
    }

    // Helper
    function isExpired(uint256 _create, uint256 _deadline) internal view returns(bool) {
        return ((_create + _deadline) <= now);
    }

    function inCoolDown(uint256 _update, uint256 _cooldown) internal view returns(bool) {
        return ((_update + _cooldown) >  now);
    }

    function isValidIdx(uint _len, uint _idx) internal pure returns(bool) {
        return (_len > _idx);
    }

    function isValidStatus(uint _last, uint _newstatus) internal pure returns(bool) {
        return (_last > _newstatus);
    }

}