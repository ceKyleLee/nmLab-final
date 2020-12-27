pragma solidity ^0.5.0;

contract EventHelper {
    event OnAccountAdd(address userAddr, string userType);
    event OnAccountUpdate(address userAddr, string userType);
    event OnApplicantStatusChange(address userAddr, uint16 newStatus);

}