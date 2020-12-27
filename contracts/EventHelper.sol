pragma solidity ^0.5.0;

contract EventHelper {
    event OnAccountAdd(address userAddr, string userType);
    event OnAccountUpdate(address userAddr, string userType);
    event OnApplicantStatusChange(address userAddr, uint16 newStatus);

    event OnJobAdd(address userAddr, uint jobIdx);
    event OnJobUpdate(address userAddr, uint jobIdx);
    event OnJobStatusChange(address userAddr, uint jobIdx, uint16 newStatus);
}